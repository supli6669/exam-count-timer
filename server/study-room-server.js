import { createServer } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { WebSocketServer, WebSocket } from 'ws';

const port = Number(process.env.STUDY_ROOM_PORT) || 8787;
const rooms = new Map();
const matchingQueue = new Map();
const dataDirectory = join(dirname(fileURLToPath(import.meta.url)), 'data');
mkdirSync(dataDirectory, { recursive: true });
const database = new DatabaseSync(join(dataDirectory, 'study-rooms.sqlite'));
database.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS guest_identities (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES guest_identities(id)
  );
  CREATE TABLE IF NOT EXISTS room_snapshots (
    room_id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

const send = (socket, message) => {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
};

const sanitizeText = (value, maxLength) => Array.from(String(value || ''))
  .map((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127 ? ' ' : character;
  })
  .join('')
  .trim()
  .slice(0, maxLength);

const normalizeRoomId = (value) => sanitizeText(value, 16)
  .toUpperCase()
  .replace(/[^A-Z0-9-]/g, '');

const createRoom = (id) => ({
  id,
  createdAt: Date.now(),
  members: new Map(),
  chat: [],
  tasks: [],
  reports: [],
  timer: {
    mode: 'focus',
    running: false,
    durationSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    endAt: null
  }
});

const persistRoom = (room) => {
  const payload = JSON.stringify({
    id: room.id,
    createdAt: room.createdAt,
    chat: room.chat,
    tasks: room.tasks,
    reports: room.reports,
    timer: room.timer
  });
  database.prepare(`
    INSERT INTO room_snapshots (room_id, payload, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(room_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
  `).run(room.id, payload, Date.now());
};

const restoreRoom = (id) => {
  const row = database.prepare('SELECT payload FROM room_snapshots WHERE room_id = ?').get(id);
  if (!row) return createRoom(id);
  try {
    const saved = JSON.parse(row.payload);
    const defaultTimer = createRoom(id).timer;
    const restoredTimer = saved.timer && typeof saved.timer === 'object'
      ? { ...defaultTimer, ...saved.timer }
      : defaultTimer;
    const timer = restoredTimer.running && Number(restoredTimer.endAt) <= Date.now()
      ? { ...restoredTimer, running: false, remainingSeconds: 0, endAt: null }
      : restoredTimer;
    return {
      ...createRoom(id),
      createdAt: Number(saved.createdAt) || Date.now(),
      chat: Array.isArray(saved.chat) ? saved.chat.slice(-50) : [],
      tasks: Array.isArray(saved.tasks) ? saved.tasks : [],
      reports: Array.isArray(saved.reports) ? saved.reports : [],
      timer
    };
  } catch {
    return createRoom(id);
  }
};

const getRoom = (id) => {
  if (!rooms.has(id)) rooms.set(id, restoreRoom(id));
  return rooms.get(id);
};

const readSession = (token) => {
  if (typeof token !== 'string' || token.length < 32 || token.length > 128) return null;
  const row = database.prepare(`
    SELECT sessions.token, sessions.expires_at, guest_identities.id, guest_identities.display_name
    FROM sessions
    JOIN guest_identities ON guest_identities.id = sessions.user_id
    WHERE sessions.token = ? AND sessions.expires_at > ?
  `).get(token, Date.now());
  return row ? {
    token: row.token,
    expiresAt: row.expires_at,
    user: { id: row.id, displayName: row.display_name }
  } : null;
};

const createOrRefreshGuestSession = (rawDisplayName, existingToken) => {
  const displayName = sanitizeText(rawDisplayName, 32);
  if (!displayName) return null;
  const current = readSession(existingToken);
  const now = Date.now();
  const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
  if (current) {
    database.prepare('UPDATE guest_identities SET display_name = ?, last_seen_at = ? WHERE id = ?')
      .run(displayName, now, current.user.id);
    database.prepare('UPDATE sessions SET expires_at = ? WHERE token = ?')
      .run(expiresAt, current.token);
    return { token: current.token, expiresAt, user: { ...current.user, displayName } };
  }
  const userId = randomUUID();
  const token = randomBytes(32).toString('base64url');
  database.prepare('INSERT INTO guest_identities (id, display_name, created_at, last_seen_at) VALUES (?, ?, ?, ?)')
    .run(userId, displayName, now, now);
  database.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .run(token, userId, expiresAt);
  return { token, expiresAt, user: { id: userId, displayName } };
};

const roomSnapshot = (room) => ({
  roomId: room.id,
  members: [...room.members.values()].map(({ id, displayName }) => ({ id, displayName })),
  chat: room.chat,
  tasks: room.tasks,
  timer: room.timer
});

const broadcast = (room, message, exceptId = null) => {
  room.members.forEach((member) => {
    if (member.id !== exceptId) send(member.socket, message);
  });
};

const leaveRoom = (client) => {
  if (!client.roomId) return;
  const room = rooms.get(client.roomId);
  if (!room) return;
  room.members.delete(client.id);
  broadcast(room, { type: 'presence', members: roomSnapshot(room).members });
  if (room.members.size === 0) {
    persistRoom(room);
    rooms.delete(room.id);
  }
  client.roomId = null;
};

const joinRoom = (client, rawRoomId) => {
  const roomId = normalizeRoomId(rawRoomId);
  const displayName = client.auth?.user.displayName || '';
  if (!roomId || !displayName) {
    send(client.socket, { type: 'error', message: 'Mã phòng và tên hiển thị là bắt buộc.' });
    return;
  }
  leaveRoom(client);
  const room = getRoom(roomId);
  client.roomId = roomId;
  client.displayName = displayName;
  room.members.set(client.id, client);
  send(client.socket, { type: 'joined', selfId: client.id, ...roomSnapshot(room) });
  broadcast(room, { type: 'presence', members: roomSnapshot(room).members }, client.id);
};

const handleMatch = (client, subject) => {
  const key = sanitizeText(subject, 48).toLowerCase() || 'general';
  const waiting = matchingQueue.get(key);
  if (waiting && waiting.socket.readyState === WebSocket.OPEN && waiting.id !== client.id) {
    matchingQueue.delete(key);
    const roomId = `MATCH-${randomUUID().slice(0, 6).toUpperCase()}`;
    send(waiting.socket, { type: 'matched', roomId });
    send(client.socket, { type: 'matched', roomId });
  } else {
    matchingQueue.set(key, client);
    send(client.socket, { type: 'matching', subject: key });
  }
};

const sendJson = (response, status, payload) => {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  response.end(JSON.stringify(payload));
};

const readJsonBody = (request) => new Promise((resolve, reject) => {
  let body = '';
  request.setEncoding('utf8');
  request.on('data', (chunk) => {
    body += chunk;
    if (body.length > 8 * 1024) reject(new Error('Payload too large'));
  });
  request.on('end', () => {
    try {
      resolve(body ? JSON.parse(body) : {});
    } catch {
      reject(new Error('Invalid JSON'));
    }
  });
  request.on('error', reject);
});

const server = createServer((request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    response.end();
    return;
  }
  if (request.url === '/health') {
    sendJson(response, 200, { ok: true, rooms: rooms.size, persistence: 'sqlite' });
    return;
  }
  if (request.url === '/auth/guest' && request.method === 'POST') {
    void readJsonBody(request)
      .then((body) => {
        const session = createOrRefreshGuestSession(body.displayName, body.token);
        sendJson(response, session ? 200 : 400, session || { error: 'Tên hiển thị là bắt buộc.' });
      })
      .catch((error) => sendJson(response, 400, { error: error.message }));
    return;
  }
  sendJson(response, 404, { error: 'Not found' });
});

const wss = new WebSocketServer({ server, path: '/study', maxPayload: 16 * 1024 });

wss.on('connection', (socket) => {
  const client = {
    id: randomUUID(),
    displayName: '',
    roomId: null,
    socket,
    auth: null,
    rateWindowStartedAt: Date.now(),
    rateCount: 0
  };

  socket.on('message', (raw) => {
    const now = Date.now();
    if (now - client.rateWindowStartedAt > 10_000) {
      client.rateWindowStartedAt = now;
      client.rateCount = 0;
    }
    client.rateCount += 1;
    if (client.rateCount > 35) {
      send(socket, { type: 'error', message: 'Bạn thao tác quá nhanh. Hãy thử lại sau.' });
      return;
    }

    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (message.type === 'auth') {
      const session = readSession(message.token);
      if (!session) {
        send(socket, { type: 'error', code: 'UNAUTHORIZED', message: 'Phiên đăng nhập đã hết hạn. Hãy kết nối lại.' });
        socket.close(4001, 'Unauthorized');
        return;
      }
      client.auth = session;
      client.displayName = session.user.displayName;
      send(socket, { type: 'authenticated', user: session.user });
      return;
    }

    if (!client.auth) {
      send(socket, { type: 'error', code: 'UNAUTHORIZED', message: 'Bạn cần xác thực trước khi vào phòng.' });
      return;
    }

    if (message.type === 'join') {
      joinRoom(client, message.roomId);
      return;
    }
    if (message.type === 'match') {
      handleMatch(client, message.subject);
      return;
    }

    const room = rooms.get(client.roomId);
    if (!room) return;

    if (message.type === 'chat') {
      const text = sanitizeText(message.text, 500);
      if (!text) return;
      const chatMessage = {
        id: randomUUID(),
        senderId: client.id,
        displayName: client.displayName,
        text,
        createdAt: Date.now()
      };
      room.chat = [...room.chat, chatMessage].slice(-50);
      persistRoom(room);
      broadcast(room, { type: 'chat', message: chatMessage });
      return;
    }

    if (message.type === 'task:add') {
      const text = sanitizeText(message.text, 160);
      if (!text) return;
      room.tasks.push({ id: randomUUID(), text, completed: false, createdBy: client.id });
      persistRoom(room);
      broadcast(room, { type: 'tasks', tasks: room.tasks });
      return;
    }

    if (message.type === 'task:toggle') {
      room.tasks = room.tasks.map((task) => task.id === message.id
        ? { ...task, completed: !task.completed }
        : task);
      persistRoom(room);
      broadcast(room, { type: 'tasks', tasks: room.tasks });
      return;
    }

    if (message.type === 'task:remove') {
      room.tasks = room.tasks.filter((task) => task.id !== message.id);
      persistRoom(room);
      broadcast(room, { type: 'tasks', tasks: room.tasks });
      return;
    }

    if (message.type === 'timer') {
      const action = message.action;
      if (action === 'start') {
        const duration = Math.min(3 * 60 * 60, Math.max(60, Number(message.durationSeconds) || room.timer.remainingSeconds));
        room.timer = { ...room.timer, running: true, durationSeconds: duration, remainingSeconds: duration, endAt: now + duration * 1000 };
      } else if (action === 'pause') {
        const remaining = room.timer.endAt ? Math.max(0, Math.ceil((room.timer.endAt - now) / 1000)) : room.timer.remainingSeconds;
        room.timer = { ...room.timer, running: false, remainingSeconds: remaining, endAt: null };
      } else if (action === 'reset') {
        room.timer = { ...room.timer, running: false, remainingSeconds: room.timer.durationSeconds, endAt: null };
      }
      persistRoom(room);
      broadcast(room, { type: 'timer', timer: room.timer });
      return;
    }

    if (message.type === 'media:ready') {
      broadcast(room, { type: 'media:ready', senderId: client.id }, client.id);
      return;
    }

    if (message.type === 'signal') {
      const target = room.members.get(message.targetId);
      if (target) send(target.socket, { type: 'signal', senderId: client.id, data: message.data });
      return;
    }

    if (message.type === 'report') {
      const report = {
        id: randomUUID(),
        reporterId: client.id,
        targetId: sanitizeText(message.targetId, 64),
        reason: sanitizeText(message.reason, 300),
        createdAt: now
      };
      room.reports.push(report);
      persistRoom(room);
      send(socket, { type: 'report:received', reportId: report.id });
    }
  });

  socket.on('close', () => {
    matchingQueue.forEach((queued, key) => {
      if (queued.id === client.id) matchingQueue.delete(key);
    });
    leaveRoom(client);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Study room server listening on http://localhost:${port}`);
});
