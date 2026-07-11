/** Socket relay — 2 phones par WebRTC P2P fail ho to ye kaam karta hai */

export function startAgentAudioRelay(socket, stream, roomId, adminId) {
  if (!socket || !stream) return () => {};

  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  let stopped = false;

  processor.onaudioprocess = (e) => {
    if (stopped) return;
    const channel = e.inputBuffer.getChannelData(0);
    const int16 = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
      int16[i] = Math.max(-32768, Math.min(32767, channel[i] * 32768));
    }
    socket.emit("monitor_audio_chunk", {
      roomId,
      adminId: String(adminId),
      data: Array.from(int16),
      sampleRate: ctx.sampleRate,
    });
  };

  source.connect(processor);
  processor.connect(ctx.destination);

  return () => {
    stopped = true;
    processor.disconnect();
    source.disconnect();
    ctx.close().catch(() => {});
  };
}

export function createAdminAudioPlayer() {
  let ctx = null;
  let nextTime = 0;

  const ensureCtx = () => {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const playChunk = ({ data, sampleRate }) => {
    const audioCtx = ensureCtx();
    const int16 = new Int16Array(data);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

    const buffer = audioCtx.createBuffer(1, float32.length, sampleRate || audioCtx.sampleRate);
    buffer.getChannelData(0).set(float32);

    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    const start = Math.max(now, nextTime);
    src.start(start);
    nextTime = start + buffer.duration;
  };

  const resume = () => ensureCtx();

  const stop = () => {
    if (ctx) {
      ctx.close().catch(() => {});
      ctx = null;
    }
    nextTime = 0;
  };

  return { playChunk, resume, stop };
}

/** WebView ke liye — RN native button se call */
export function attachMonitorStream(stream, videoRef, audioRef) {
  if (!stream) return;
  const el = videoRef?.current || audioRef?.current;
  if (!el) return;
  el.srcObject = stream;
  el.muted = false;
  el.volume = 1;
  return el.play();
}

export function playMonitorMedia(videoRef, audioRef) {
  const el = videoRef?.current || audioRef?.current;
  if (!el) return Promise.reject(new Error("no media element"));
  el.muted = false;
  el.volume = 1;
  return el.play();
}
