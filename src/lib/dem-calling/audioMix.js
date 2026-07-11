/** Mix multiple mic/remote streams into one for admin monitor */
export function mixAudioStreams(streams) {
  const valid = streams.filter((s) => s && s.getAudioTracks().length > 0);
  if (valid.length === 0) return null;
  if (valid.length === 1) return valid[0];

  const ctx = new AudioContext();
  const destination = ctx.createMediaStreamDestination();
  valid.forEach((stream) => {
    try {
      const source = ctx.createMediaStreamSource(stream);
      source.connect(destination);
    } catch {
      /* skip bad stream */
    }
  });
  return destination.stream;
}
