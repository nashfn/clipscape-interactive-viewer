
import { VideoClip, VideoSource } from "../types/video";

// Using embedded YouTube iframe for Mission Impossible trailer clips
export const videoSource: VideoSource = {
  url: "https://www.youtube.com/embed/wb49-oV0F78", // Mission Impossible: Dead Reckoning Part One - Official Trailer
  type: "video/youtube"
};

export const videoClips: VideoClip[] = [
  {
    id: "clip1",
    title: "Dead Reckoning Intro",
    description: "Opening moments from the Dead Reckoning trailer",
    startTime: 0,
    endTime: 30,
    thumbnail: "https://i.ytimg.com/vi/wb49-oV0F78/hqdefault.jpg"
  },
  {
    id: "clip2",
    title: "Dangerous Mission",
    description: "Ethan Hunt faces a new dangerous mission",
    startTime: 30,
    endTime: 60,
    thumbnail: "https://i.ytimg.com/vi/wb49-oV0F78/hq2.jpg"
  },
  {
    id: "clip3",
    title: "The Chase",
    description: "Intense chase sequence from the trailer",
    startTime: 60,
    endTime: 90,
    thumbnail: "https://i.ytimg.com/vi/wb49-oV0F78/hq3.jpg"
  },
  {
    id: "clip4",
    title: "Hunt vs Villain",
    description: "Confrontation with the film's antagonist",
    startTime: 90,
    endTime: 120,
    thumbnail: "https://i.ytimg.com/vi/wb49-oV0F78/hqdefault.jpg"
  },
  {
    id: "clip5",
    title: "Final Moments",
    description: "The climactic moments of the trailer",
    startTime: 120,
    endTime: 150,
    thumbnail: "https://i.ytimg.com/vi/wb49-oV0F78/hq1.jpg"
  }
];
