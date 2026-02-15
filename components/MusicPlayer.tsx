import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { IconPlay, IconPause, IconNext, IconPrev, IconMusic } from './PixelIcons';

const MusicPlayer: React.FC = () => {
    const { config } = useGame();
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState(true); // Default to true so it starts when tracks exist
    const [volume, setVolume] = useState(0.3);
    const audioRef = useRef<HTMLAudioElement>(null);

    const tracks = config.audioTracks || [];
    const currentTrack = tracks[currentTrackIndex];

    // Volume control
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Track switching logic
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        // Force reload of the source if needed (React handles src prop, but explicit load is safer)
        audio.load();

        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Autoplay prevented:", error);
                    // Optional: setIsPlaying(false) if we want to reflect failure, 
                    // but keeping it true allows resume on next interaction
                });
            }
        }
    }, [currentTrack?.id]); // Only re-run if the specific track ID changes

    // Play/Pause toggle effect
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        if (isPlaying) {
             const playPromise = audio.play();
             if (playPromise !== undefined) {
                 playPromise.catch(e => console.warn("Play failed", e));
             }
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    const togglePlay = () => {
        if (tracks.length === 0) return;
        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        if (tracks.length === 0) return;
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    };
    
    const prevTrack = () => {
        if (tracks.length === 0) return;
        setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    }

    const handleError = () => {
        console.error("Error playing track, skipping...");
        nextTrack();
    };

    if (tracks.length === 0) return null;

    return (
        <div className="fixed bottom-24 right-4 z-40 md:bottom-4 md:right-4">
            <audio 
                ref={audioRef}
                src={currentTrack?.dataUri} 
                onEnded={nextTrack}
                onError={handleError}
            />
            
            <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-3 shadow-xl flex items-center gap-3 animate-pop-in">
                <div className="flex items-center justify-center bg-slate-800 w-8 h-8 rounded border border-slate-700 relative overflow-hidden">
                    <IconMusic className="w-4 h-4 text-pink-400 relative z-10" />
                    {isPlaying && (
                        <div className="absolute inset-0 bg-pink-500/20 animate-pulse" />
                    )}
                </div>
                <div className="flex flex-col max-w-[120px]">
                    <span className="text-[0.5rem] text-slate-400 uppercase">Now Playing</span>
                    <span className="text-xs text-white truncate font-bold">{currentTrack?.name || 'Unknown'}</span>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                     <button onClick={prevTrack} className="text-slate-300 hover:text-white active:scale-95">
                         <IconPrev className="w-4 h-4" />
                     </button>
                     <button onClick={togglePlay} className="text-white bg-indigo-600 hover:bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 border border-indigo-400">
                         {isPlaying ? <IconPause className="w-3 h-3" /> : <IconPlay className="w-3 h-3" />}
                     </button>
                     <button onClick={nextTrack} className="text-slate-300 hover:text-white active:scale-95">
                         <IconNext className="w-4 h-4" />
                     </button>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;