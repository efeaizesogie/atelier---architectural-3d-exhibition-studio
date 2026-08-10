// Web Audio API synthesized gallery room acoustics ambiance generator
let audioCtx: AudioContext | null = null;
let roomResonanceGain: GainNode | null = null;
let noiseSource: AudioBufferSourceNode | null = null;

export function toggleStudioAmbiance(play: boolean) {
  if (play) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Create 5 seconds of soft pink noise filtered for gallery room acoustics
    const bufferSize = audioCtx.sampleRate * 5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.012; // Very gentle room background tone
      b6 = white * 0.115926;
    }

    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Gentle low pass filter simulating room air and soft echo
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320; // Soft room warmth

    roomResonanceGain = audioCtx.createGain();
    roomResonanceGain.gain.value = 0.08;

    noiseSource.connect(filter);
    filter.connect(roomResonanceGain);
    roomResonanceGain.connect(audioCtx.destination);

    noiseSource.start();
  } else {
    if (roomResonanceGain && audioCtx) {
      roomResonanceGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
      setTimeout(() => {
        if (noiseSource) {
          try {
            noiseSource.stop();
          } catch {}
          noiseSource = null;
        }
      }, 300);
    }
  }
}
