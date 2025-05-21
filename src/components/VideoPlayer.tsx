
import React, { useState, useRef, useEffect } from "react";
import { VideoPlayerProps, VideoClip } from "@/types/video";
import VideoControls from "./VideoControls";

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  source,
  clips,
  initialClip
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeClip, setActiveClip] = useState<VideoClip | null>(initialClip || null);

  // Set up event listeners when the component mounts
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // If we're playing a clip and reached the end time, go to the next clip
      if (activeClip && video.currentTime >= activeClip.endTime) {
        const currentIndex = clips.findIndex(clip => clip.id === activeClip.id);
        if (currentIndex < clips.length - 1) {
          playClip(clips[currentIndex + 1]);
        } else {
          // If it's the last clip, pause the video
          video.pause();
          setIsPlaying(false);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // If there's an active clip, seek to its start time
      if (activeClip) {
        video.currentTime = activeClip.startTime;
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Clean up event listeners when component unmounts
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [activeClip, clips]);

  // Effect to handle initial clip if provided
  useEffect(() => {
    if (initialClip && videoRef.current) {
      setActiveClip(initialClip);
      videoRef.current.currentTime = initialClip.startTime;
    }
  }, [initialClip]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    // If we're playing a clip, make sure we stay within its bounds
    if (activeClip) {
      if (time < activeClip.startTime) time = activeClip.startTime;
      if (time > activeClip.endTime) time = activeClip.endTime;
    }

    video.currentTime = time;
    setCurrentTime(time);
  };

  const playClip = (clip: VideoClip) => {
    setActiveClip(clip);
    const video = videoRef.current;
    if (!video) return;

    // Set the current time to the start of the clip
    video.currentTime = clip.startTime;
    // Start playing
    video.play()
      .catch(error => {
        console.error("Error playing video:", error);
      });
  };

  return (
    <div className="video-container w-full h-full">
      <video
        ref={videoRef}
        className="video-player"
        src={source.url}
        onClick={togglePlayPause}
      />
      <VideoControls
        videoRef={videoRef}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onSeek={handleSeek}
      />
    </div>
  );
};

export default VideoPlayer;
