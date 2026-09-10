import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCurrentTime } from '../utils/clock';

const getDefaultSocketUrl = () => {
  if (import.meta.env.VITE_STUDY_ROOM_WS_URL) return import.meta.env.VITE_STUDY_ROOM_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:8787/study`;
};

const getDefaultApiUrl = () => {
  if (import.meta.env.VITE_STUDY_ROOM_API_URL) return import.meta.env.VITE_STUDY_ROOM_API_URL;
  return `${window.location.protocol}//${window.location.hostname}:8787`;
};

const getGuestSession = async (displayName) => {
  const response = await fetch(`${getDefaultApiUrl()}/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName,
      token: localStorage.getItem('study_room_session_token') || ''
    })
  });
  const payload = await response.json();
  if (!response.ok || !payload.token) throw new Error(payload.error || 'Không thể tạo phiên học.');
  localStorage.setItem('study_room_session_token', payload.token);
  return payload;
};

const formatTimer = (seconds) => {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
};

function StreamVideo({ stream, label, muted = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <figure>
      <video ref={ref} autoPlay playsInline muted={muted} />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function StudyTogether() {
  const now = useCurrentTime();
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('study_room_display_name') || '');
  const [roomInput, setRoomInput] = useState('');
  const [subject, setSubject] = useState('');
  const [connection, setConnection] = useState('disconnected');
  const [roomId, setRoomId] = useState('');
  const [selfId, setSelfId] = useState('');
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatDraft, setChatDraft] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskDraft, setTaskDraft] = useState('');
  const [timer, setTimer] = useState({ running: false, durationSeconds: 1500, remainingSeconds: 1500, endAt: null });
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [status, setStatus] = useState('');
  const [blockedIds, setBlockedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('study_room_blocked_ids') || '[]');
    } catch {
      return [];
    }
  });
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});

  const socketRef = useRef(null);
  const selfIdRef = useRef('');
  const displayNameRef = useRef(displayName);
  const membersRef = useRef([]);
  const blockedIdsRef = useRef(blockedIds);
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());

  useEffect(() => {
    displayNameRef.current = displayName;
  }, [displayName]);
  useEffect(() => {
    membersRef.current = members;
  }, [members]);
  useEffect(() => {
    blockedIdsRef.current = blockedIds;
    localStorage.setItem('study_room_blocked_ids', JSON.stringify(blockedIds));
  }, [blockedIds]);

  const send = useCallback((payload) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
  }, []);

  const removePeer = useCallback((peerId) => {
    peersRef.current.get(peerId)?.close();
    peersRef.current.delete(peerId);
    setRemoteStreams((current) => {
      const next = { ...current };
      delete next[peerId];
      return next;
    });
  }, []);

  const ensurePeer = useCallback((peerId) => {
    if (blockedIdsRef.current.includes(peerId)) return null;
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId);
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }]
    });
    localStreamRef.current?.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));
    peer.onicecandidate = (event) => {
      if (event.candidate) send({ type: 'signal', targetId: peerId, data: { candidate: event.candidate } });
    };
    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) setRemoteStreams((current) => ({ ...current, [peerId]: stream }));
    };
    peer.onconnectionstatechange = () => {
      if (['failed', 'closed', 'disconnected'].includes(peer.connectionState)) removePeer(peerId);
    };
    peersRef.current.set(peerId, peer);
    return peer;
  }, [removePeer, send]);

  const makeOffer = useCallback(async (peerId) => {
    if (!localStreamRef.current) return;
    const peer = ensurePeer(peerId);
    if (!peer || peer.signalingState !== 'stable') return;
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    send({ type: 'signal', targetId: peerId, data: { description: peer.localDescription } });
  }, [ensurePeer, send]);

  const handleSignal = useCallback(async (senderId, data) => {
    if (!localStreamRef.current || blockedIdsRef.current.includes(senderId)) return;
    const peer = ensurePeer(senderId);
    if (!peer) return;
    try {
      if (data.description) {
        await peer.setRemoteDescription(data.description);
        if (data.description.type === 'offer') {
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          send({ type: 'signal', targetId: senderId, data: { description: peer.localDescription } });
        }
      } else if (data.candidate) {
        await peer.addIceCandidate(data.candidate);
      }
    } catch {
      removePeer(senderId);
    }
  }, [ensurePeer, removePeer, send]);

  const connect = useCallback(async (initialMessage) => {
    socketRef.current?.close();
    setConnection('connecting');
    setStatus('Đang kết nối máy chủ phòng học…');
    let session;
    try {
      session = await getGuestSession(displayNameRef.current);
    } catch (error) {
      setConnection('disconnected');
      setStatus(error?.message || 'Không thể xác thực phiên học.');
      return;
    }
    const socket = new WebSocket(getDefaultSocketUrl());
    socketRef.current = socket;
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ type: 'auth', token: session.token }));
    });
    socket.addEventListener('message', (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.type === 'authenticated') {
        setConnection('connected');
        socket.send(JSON.stringify(initialMessage));
      } else if (message.type === 'joined') {
        selfIdRef.current = message.selfId;
        setSelfId(message.selfId);
        setRoomId(message.roomId);
        setMembers(message.members || []);
        setMessages((message.chat || []).filter((item) => !blockedIdsRef.current.includes(item.senderId)));
        setTasks(message.tasks || []);
        setTimer(message.timer);
        setStatus(`Đã vào phòng ${message.roomId}.`);
      } else if (message.type === 'presence') {
        setMembers(message.members || []);
        const memberIds = new Set((message.members || []).map((member) => member.id));
        peersRef.current.forEach((_, peerId) => {
          if (!memberIds.has(peerId)) removePeer(peerId);
        });
      } else if (message.type === 'chat' && !blockedIdsRef.current.includes(message.message.senderId)) {
        setMessages((current) => [...current, message.message].slice(-50));
      } else if (message.type === 'tasks') {
        setTasks(message.tasks || []);
      } else if (message.type === 'timer') {
        setTimer(message.timer);
      } else if (message.type === 'matched') {
        socket.send(JSON.stringify({ type: 'join', roomId: message.roomId, displayName: displayNameRef.current }));
      } else if (message.type === 'matching') {
        setStatus(`Đang tìm bạn học môn ${message.subject}…`);
      } else if (message.type === 'media:ready') {
        if (localStreamRef.current && selfIdRef.current < message.senderId) void makeOffer(message.senderId);
      } else if (message.type === 'signal') {
        void handleSignal(message.senderId, message.data);
      } else if (message.type === 'report:received') {
        setStatus('Đã gửi báo cáo tới quản trị phòng.');
      } else if (message.type === 'error') {
        setStatus(message.message);
      }
    });
    socket.addEventListener('close', () => {
      setConnection('disconnected');
      setRoomId('');
      setSelfId('');
      setMembers([]);
      setStatus('Đã ngắt kết nối.');
    });
    socket.addEventListener('error', () => {
      setStatus('Không kết nối được backend Study Together. Hãy chạy npm run dev:rooms.');
    });
  }, [handleSignal, makeOffer, removePeer]);

  const join = (targetRoomId) => {
    const name = displayName.trim();
    const room = targetRoomId.trim().toUpperCase();
    if (!name || !room) {
      setStatus('Nhập tên hiển thị và mã phòng trước.');
      return;
    }
    localStorage.setItem('study_room_display_name', name);
    void connect({ type: 'join', roomId: room });
  };

  const createRoom = () => {
    const generated = `STUDY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setRoomInput(generated);
    join(generated);
  };

  const findBuddy = () => {
    const name = displayName.trim();
    if (!name) {
      setStatus('Nhập tên hiển thị trước.');
      return;
    }
    localStorage.setItem('study_room_display_name', name);
    void connect({ type: 'match', subject: subject.trim() || 'general' });
  };

  const leave = () => {
    socketRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    setRemoteStreams({});
  };

  useEffect(() => leave, []);

  const sendChat = (event) => {
    event.preventDefault();
    const text = chatDraft.trim();
    if (!text) return;
    send({ type: 'chat', text });
    setChatDraft('');
  };

  const addTask = (event) => {
    event.preventDefault();
    const text = taskDraft.trim();
    if (!text) return;
    send({ type: 'task:add', text });
    setTaskDraft('');
  };

  const enableMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      send({ type: 'media:ready' });
      membersRef.current.forEach((member) => {
        if (member.id !== selfIdRef.current && selfIdRef.current < member.id) void makeOffer(member.id);
      });
    } catch {
      setStatus('Bạn chưa cấp quyền camera/micro hoặc thiết bị không khả dụng.');
    }
  };

  const disableMedia = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    setRemoteStreams({});
  };

  const blockMember = (memberId) => {
    setBlockedIds((current) => current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId]);
    removePeer(memberId);
    setMessages((current) => current.filter((message) => message.senderId !== memberId));
  };

  const reportMember = (memberId) => {
    const reason = window.prompt('Mô tả ngắn lý do báo cáo:');
    if (reason?.trim()) send({ type: 'report', targetId: memberId, reason: reason.trim() });
  };

  const remainingSeconds = timer.running && timer.endAt
    ? Math.max(0, Math.ceil((timer.endAt - now) / 1000))
    : timer.remainingSeconds;
  const visibleMembers = members.filter((member) => !blockedIds.includes(member.id));
  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member.displayName])), [members]);

  if (!roomId) {
    return (
      <main className="study-together-lobby">
        <section className="glass-panel">
          <div className="study-lobby-copy">
            <span>👥</span>
            <div><h2>Study Together</h2><p>Học cùng bạn bè bằng timer đồng bộ, task chung, chat và video tuỳ chọn.</p></div>
          </div>
          <label>Tên hiển thị<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength="32" /></label>
          <div className="study-join-row">
            <input value={roomInput} onChange={(event) => setRoomInput(event.target.value.toUpperCase())} placeholder="Mã phòng" maxLength="16" aria-label="Mã phòng học" />
            <button type="button" onClick={() => join(roomInput)} disabled={connection === 'connecting'}>Vào phòng</button>
            <button type="button" onClick={createRoom} disabled={connection === 'connecting'}>Tạo phòng</button>
          </div>
          <div className="study-match-row">
            <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Môn đang học" maxLength="48" aria-label="Môn để ghép bạn học" />
            <button type="button" onClick={findBuddy} disabled={connection === 'connecting'}>Tìm bạn cùng môn</button>
          </div>
          <p role="status" aria-live="polite">{status}</p>
          <details><summary>Quy tắc cộng đồng</summary><p>Tôn trọng người học khác; không quấy rối, phát nội dung nhạy cảm hoặc chia sẻ thông tin cá nhân. Bạn có thể chặn và báo cáo thành viên ngay trong phòng.</p></details>
        </section>
      </main>
    );
  }

  return (
    <main className="study-room" aria-label={`Phòng học ${roomId}`}>
      <header className="study-room-header glass-panel">
        <div><span className="study-live-dot" /> <strong>{roomId}</strong><small>{visibleMembers.length} người đang học</small></div>
        <div>
          <button type="button" onClick={() => navigator.clipboard?.writeText(roomId)}>Sao chép mã</button>
          <button type="button" onClick={leave}>Rời phòng</button>
        </div>
      </header>

      <div className="study-room-grid">
        <section className="study-shared-timer glass-panel">
          <span>Timer chung</span>
          <strong>{formatTimer(remainingSeconds)}</strong>
          <div>
            <select value={timerMinutes} onChange={(event) => setTimerMinutes(Number(event.target.value))} aria-label="Thời lượng timer nhóm">
              <option value="25">25 phút</option>
              <option value="50">50 phút</option>
              <option value="90">90 phút</option>
            </select>
            <button type="button" onClick={() => send({ type: 'timer', action: timer.running ? 'pause' : 'start', durationSeconds: timer.running ? undefined : timerMinutes * 60 })}>
              {timer.running ? 'Tạm dừng' : 'Bắt đầu'}
            </button>
            <button type="button" onClick={() => send({ type: 'timer', action: 'reset' })}>Đặt lại</button>
          </div>
        </section>

        <section className="study-members glass-panel">
          <h3>Thành viên</h3>
          <ul>{members.map((member) => {
            const blocked = blockedIds.includes(member.id);
            return (
              <li key={member.id}>
                <span>{member.id === selfId ? 'Bạn' : member.displayName}</span>
                {member.id !== selfId && <div>
                  <button type="button" onClick={() => blockMember(member.id)}>{blocked ? 'Bỏ chặn' : 'Chặn'}</button>
                  <button type="button" onClick={() => reportMember(member.id)}>Báo cáo</button>
                </div>}
              </li>
            );
          })}</ul>
        </section>

        <section className="study-video glass-panel">
          <header><h3>Video/voice tuỳ chọn</h3>{localStream
            ? <button type="button" onClick={disableMedia}>Tắt camera</button>
            : <button type="button" onClick={enableMedia}>Bật camera</button>}
          </header>
          <div className="study-video-grid">
            {localStream && <StreamVideo stream={localStream} label="Bạn" muted />}
            {Object.entries(remoteStreams)
              .filter(([peerId]) => !blockedIds.includes(peerId))
              .map(([peerId, stream]) => <StreamVideo key={peerId} stream={stream} label={memberMap.get(peerId) || 'Bạn học'} />)}
            {!localStream && Object.keys(remoteStreams).length === 0 && <p className="focus-empty">Camera tắt. Bạn vẫn có thể dùng timer, task và chat.</p>}
          </div>
        </section>

        <section className="study-shared-tasks glass-panel">
          <h3>Task chung</h3>
          <form onSubmit={addTask}><input value={taskDraft} onChange={(event) => setTaskDraft(event.target.value)} placeholder="Mục tiêu của phiên…" maxLength="160" /><button>Thêm</button></form>
          <ul>{tasks.map((task) => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <label><input type="checkbox" checked={task.completed} onChange={() => send({ type: 'task:toggle', id: task.id })} /><span>{task.text}</span></label>
              <button type="button" onClick={() => send({ type: 'task:remove', id: task.id })} aria-label={`Xóa ${task.text}`}>×</button>
            </li>
          ))}</ul>
        </section>

        <section className="study-chat glass-panel">
          <h3>Chat trong phiên</h3>
          <div className="study-chat-log" aria-live="polite">
            {messages.map((message) => (
              <p key={message.id}><strong>{message.senderId === selfId ? 'Bạn' : message.displayName}</strong><span>{message.text}</span></p>
            ))}
          </div>
          <form onSubmit={sendChat}><input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Nhắn một lời động viên…" maxLength="500" /><button>Gửi</button></form>
        </section>
      </div>
      <p className="study-room-status" role="status" aria-live="polite">{status}</p>
    </main>
  );
}

export default memo(StudyTogether);
