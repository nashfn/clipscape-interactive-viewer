
import React, { useState, useRef, useEffect } from "react";
import { VideoPlayerProps, VideoClip } from "@/types/video";
import VideoControls from "./VideoControls";

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  source,
  clips,
  initialClip
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeClip, setActiveClip] = useState<VideoClip | null>(initialClip || null);
  const isYouTube = source.type === "video/youtube";

  // Set up event listeners when the component mounts
  useEffect(() => {
    if (isYouTube) {
      // For YouTube videos, we'll rely on the YouTube iframe API
      // This is a simplified version, as we can't fully control YouTube's iframe
      setDuration(180); // Assuming a 3-minute trailer
      
      if (activeClip) {
        // Update YouTube video start time
        const currentUrl = new URL(source.url);
        currentUrl.searchParams.set("start", activeClip.startTime.toString());
        
        if (iframeRef.current) {
          iframeRef.current.src = currentUrl.toString();
        }
      }
      return;
    }

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
  }, [activeClip, clips, isYouTube, source.url]);

  // Effect to handle initial clip if provided
  useEffect(() => {
    if (initialClip) {
      setActiveClip(initialClip);
      
      if (isYouTube && iframeRef.current) {
        const currentUrl = new URL(source.url);
        currentUrl.searchParams.set("start", initialClip.startTime.toString());
        iframeRef.current.src = currentUrl.toString();
      } else if (videoRef.current) {
        videoRef.current.currentTime = initialClip.startTime;
      }
    }
  }, [initialClip, isYouTube, source.url]);

  const togglePlayPause = () => {
    if (isYouTube) {
      // For YouTube, we can't directly control playback
      console.log("YouTube playback control not implemented");
      return;
    }
    
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (time: number) => {
    if (isYouTube) {
      // For YouTube, we'd need to reload the iframe with a different start time
      console.log("YouTube seek functionality not fully implemented");
      return;
    }
    
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
    
    if (isYouTube && iframeRef.current) {
      const currentUrl = new URL(source.url);
      currentUrl.searchParams.set("start", clip.startTime.toString());
      iframeRef.current.src = currentUrl.toString();
      setIsPlaying(true);
    } else if (videoRef.current) {
      // Set the current time to the start of the clip
      videoRef.current.currentTime = clip.startTime;
      // Start playing
      videoRef.current.play()
        .catch(error => {
          console.error("Error playing video:", error);
        });
    }
  };

  return (
    <div className="video-container w-full h-full">
      {isYouTube ? (
        <iframe
          ref={iframeRef}
          className="w-full aspect-video"
          src={`${source.url}?autoplay=1&start=${activeClip?.startTime || 0}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <video
          ref={videoRef}
          className="video-player"
          src={source.url}
          onClick={togglePlayPause}
        />
      )}
      
      {!isYouTube && (
        <VideoControls
          videoRef={videoRef}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onSeek={handleSeek}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
