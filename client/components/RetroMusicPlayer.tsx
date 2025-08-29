import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const RetroMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock track data
  const currentTrack = "CYBERPUNK_AMBIENT.mp3";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 180);
        
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    // Simulate track duration
    setDuration(180);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const playPause = () => {
    setIsPlaying(!isPlaying);
    // Simulate playback
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black text-white font-cartograph p-3 border-b border-white/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs truncate font-bold text-white/90">{currentTrack}</div>
            <div className="text-xs text-white/60">{formatTime(currentTime)} / {formatTime(duration)}</div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex-1 max-w-xs">
            <div 
              className="h-1 bg-white/20 border border-white/40 cursor-pointer relative rounded-full"
              onClick={seek}
            >
              <div 
                className="h-full bg-white transition-all duration-100 rounded-full"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button className="p-1 border border-white/40 hover:bg-white hover:text-black transition-colors duration-300 rounded">
              <SkipBack size={14} />
            </button>
                     
            <button
              onClick={playPause}
              className="p-1 border border-white/40 hover:bg-white hover:text-black transition-colors duration-300 rounded"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
                     
            <button className="p-1 border border-white/40 hover:bg-white hover:text-black transition-colors duration-300 rounded">
              <SkipForward size={14} />
            </button>
          </div>
          
          {/* Volume */}
          <div className="flex items-center space-x-2">
            <Volume2 size={12} className="text-white/70" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 accent-white bg-white/20 rounded-full"
            />
          </div>
        </div>
      </div>
      
      {/* Hidden audio element for future functionality */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default RetroMusicPlayer;
