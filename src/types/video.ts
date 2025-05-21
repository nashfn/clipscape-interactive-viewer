
export interface VideoClip {
  id: string;
  title: string;
  description: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  thumbnail?: string;
}

export interface VideoSource {
  url: string;
  type: string;
}

export interface VideoPlayerProps {
  source: VideoSource;
  clips: VideoClip[];
  initialClip?: VideoClip;
}
