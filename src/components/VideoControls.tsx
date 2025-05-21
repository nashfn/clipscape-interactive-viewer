
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  videoRef,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek
}) => {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    const newTime = clickPosition * duration;
    onSeek(newTime);
  };

  return (
    <div className="video-controls flex flex-col gap-2 pb-2">
      <div 
        className="progress-bar w-full" 
        onClick={handleProgressClick}
      >
        <div 
          className="progress-filled" 
          style={{ width: `${progressPercentage}%` }} 
        />
      </div>
      
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <button onClick={onPlayPause} className="video-button">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          
          <div className="relative" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
            <button onClick={toggleMute} className="video-button">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            
            {showVolumeSlider && (
              <div className="absolute bottom-full left-0 mb-2 bg-video-overlay p-2 rounded-md w-24 animate-fade-in">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </div>
            )}
          </div>
          
          <span className="text-xs text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
