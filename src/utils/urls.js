export function parseSpotifyUrl(input) {
  if (typeof input !== 'string') return '';
  try {
    const url = new URL(input.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com' ||
        url.port || url.username || url.password) return '';
    const match = url.pathname.match(/^\/(?:embed\/)?(playlist|album|track)\/([a-zA-Z0-9]+)\/?$/);
    return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0` : '';
  } catch {
    return '';
  }
}

export function isSafeBackground(value) {
  return typeof value === 'string' && value.length <= 3 * 1024 * 1024 &&
    /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value);
}
