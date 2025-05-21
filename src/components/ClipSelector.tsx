
import React from "react";
import { VideoClip } from "@/types/video";

interface ClipSelectorProps {
  clips: VideoClip[];
  activeClipId: string;
  onSelectClip: (clip: VideoClip) => void;
}

const ClipSelector: React.FC<ClipSelectorProps> = ({
  clips,
  activeClipId,
  onSelectClip
}) => {
  return (
    <div className="p-4 bg-secondary rounded-lg">
      <h2 className="text-xl font-bold mb-4">Video Clips</h2>
      <div className="space-y-2">
        {clips.map((clip) => (
          <div
            key={clip.id}
            className={`clip-item flex items-start gap-3 ${
              clip.id === activeClipId ? "active" : ""
            }`}
            onClick={() => onSelectClip(clip)}
          >
            {clip.thumbnail && (
              <div className="flex-shrink-0 w-20 h-12 overflow-hidden rounded">
                <img
                  src={clip.thumbnail}
                  alt={clip.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-medium text-sm">{clip.title}</h3>
              <p className="text-xs text-muted-foreground">{clip.description}</p>
              <span className="text-xs text-muted-foreground">
                {Math.floor(clip.startTime / 60)}:{String(Math.floor(clip.startTime % 60)).padStart(2, "0")} - 
                {Math.floor(clip.endTime / 60)}:{String(Math.floor(clip.endTime % 60)).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClipSelector;
