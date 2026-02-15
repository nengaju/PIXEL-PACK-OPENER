// Simple synth for pixel art sound effects
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
const ctx = new AudioContextClass();

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, volume: number = 0.1) => {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
};

const playNoise = (duration: number) => {
    if (ctx.state === 'suspended') ctx.resume();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
};

const playCustom = (uri: string) => {
    const audio = new Audio(uri);
    audio.volume = 0.4;
    audio.play().catch(e => console.warn("Audio play failed", e));
};

export const SFX = {
    openPack: (customUri?: string) => {
        if (customUri) { playCustom(customUri); return; }
        // Tear/Explosion sound
        playNoise(0.4); 
        playTone(100, 'sawtooth', 0.2, 0.0, 0.2);
        playTone(60, 'square', 0.4, 0.1, 0.2);
    },
    revealCommon: (customUri?: string) => {
        if (customUri) { playCustom(customUri); return; }
        playTone(400, 'sine', 0.1, 0, 0.1);
    },
    revealRare: (customUri?: string) => {
        if (customUri) { playCustom(customUri); return; }
        playTone(600, 'square', 0.1, 0, 0.1);
        playTone(800, 'square', 0.1, 0.05, 0.1);
    },
    revealEpic: (customUri?: string) => {
        if (customUri) { playCustom(customUri); return; }
        playTone(400, 'sawtooth', 0.1, 0, 0.1);
        playTone(600, 'sawtooth', 0.1, 0.05, 0.1);
        playTone(900, 'sawtooth', 0.2, 0.1, 0.1);
    },
    revealLegendary: (customUri?: string) => {
        if (customUri) { playCustom(customUri); return; }
        playTone(523.25, 'square', 0.1, 0, 0.15); // C
        playTone(659.25, 'square', 0.1, 0.1, 0.15); // E
        playTone(783.99, 'square', 0.1, 0.2, 0.15); // G
        playTone(1046.50, 'square', 0.4, 0.3, 0.15); // C
    },
    revealFoil: (customUri?: string) => {
        if (customUri) { playCustom(customUri); return; }
        playTone(1200, 'sine', 0.1, 0, 0.05);
        playTone(1500, 'sine', 0.1, 0.05, 0.05);
        playTone(1800, 'sine', 0.1, 0.1, 0.05);
        playTone(2000, 'sine', 0.2, 0.15, 0.05);
    },
    sell: (customUri?: string) => {
        if (customUri) { playCustom(customUri); return; }
        playTone(800, 'sine', 0.05, 0, 0.1);
        playTone(1200, 'square', 0.05, 0.05, 0.1);
    }
};
