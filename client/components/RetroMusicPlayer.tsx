import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

const RetroMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Real track data
  const currentTrack = "Your Dream";
  const audioSrc =
    "https://cdn.builder.io/o/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2Fd2ece2d5791240589d71a6ba4873382a?alt=media&token=ec30df64-2a6f-45eb-a093-156dda894874&apiKey=6f2aebc9bb734d979c603aa774a20c1a";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set audio source
    audio.src = audioSrc;
    audio.volume = volume;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Enhanced autoplay with better error handling
    const playAudio = async () => {
      try {
        // Set autoplay attributes
        audio.autoplay = true;
        audio.loop = true;
        audio.muted = false;
        
        await audio.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch (error) {
        console.log("Autoplay failed:", error);
        setAutoplayBlocked(true);
        
        // Try muted autoplay as fallback
        try {
          audio.muted = true;
          await audio.play();
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch (mutedError) {
          console.log("Muted autoplay also failed:", mutedError);
          setAutoplayBlocked(true);
        }
      }
    };

    // Try autoplay when audio is ready
    if (audio.readyState >= 3) {
      playAudio();
    } else {
      audio.addEventListener("canplaythrough", playAudio, { once: true });
    }

    // Also try autoplay after a short delay
    const delayedAutoplay = setTimeout(() => {
      if (!isPlaying && !hasUserInteracted) {
        playAudio();
      }
    }, 1000);

    return () => {
      clearTimeout(delayedAutoplay);
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioSrc]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const playPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Mark that user has interacted
    setHasUserInteracted(true);
    setAutoplayBlocked(false);

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        // Unmute if it was muted due to autoplay restrictions
        if (audio.muted) {
          audio.muted = false;
        }
        await audio.play();
      }
    } catch (error) {
      console.log("Playback failed:", error);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-black text-white font-cartograph p-3 border-b border-white/20 backdrop-blur-xl relative">
      {/* Click to play overlay when autoplay is blocked */}
      {autoplayBlocked && !hasUserInteracted && (
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center cursor-pointer z-10"
          onClick={playPause}
        >
          <div className="text-center">
            <div className="text-white/90 text-sm mb-2">Click to play music</div>
            <div className="text-white/60 text-xs">Autoplay blocked by browser</div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center sm:justify-start space-x-4">
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs truncate font-bold text-white/90">
              {currentTrack}
            </div>
            <div className="text-xs text-white/60">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 max-w-xs">
            <div
              className="h-1 bg-white/20 border border-white/40 cursor-pointer relative rounded-full"
              onClick={seek}
            >
              <div
                className="h-full bg-white transition-all duration-100 rounded-full"
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                }}
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
        </div>
      </div>

      {/* Audio element */}
      <audio 
        ref={audioRef} 
        preload="auto" 
        autoPlay 
        loop 
        className="hidden" 
      />
    </div>
  );
};

export default RetroMusicPlayer;