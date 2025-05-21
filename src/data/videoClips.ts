
import { VideoClip, VideoSource } from "../types/video";

// Using a royalty-free video from Pixabay for demonstration
export const videoSource: VideoSource = {
  url: "https://cdn.pixabay.com/vimeo/328224049/ocean-49267.mp4?width=1280&hash=f2c0e975b3af8c58e7aa634cc0c739455892d3e8",
  type: "video/mp4"
};

export const videoClips: VideoClip[] = [
  {
    id: "clip1",
    title: "Waves Crashing",
    description: "Beautiful ocean waves breaking on the shore",
    startTime: 0,
    endTime: 5,
    thumbnail: "https://cdn.pixabay.com/photo/2016/11/29/04/19/ocean-1867285_640.jpg"
  },
  {
    id: "clip2",
    title: "Calm Waters",
    description: "Peaceful view of the ocean surface",
    startTime: 5,
    endTime: 10,
    thumbnail: "https://cdn.pixabay.com/photo/2017/03/27/14/49/beach-2179183_640.jpg"
  },
  {
    id: "clip3",
    title: "Ocean Horizon",
    description: "Wide angle shot of the ocean meeting the sky",
    startTime: 10,
    endTime: 15,
    thumbnail: "https://cdn.pixabay.com/photo/2016/11/19/12/58/seagulls-1839598_640.jpg"
  },
  {
    id: "clip4",
    title: "Distant View",
    description: "Far view of the ocean from the shore",
    startTime: 15,
    endTime: 20,
    thumbnail: "https://cdn.pixabay.com/photo/2016/03/04/19/36/beach-1236581_640.jpg"
  },
  {
    id: "clip5",
    title: "Concluding Waves",
    description: "Final view of the ocean waves",
    startTime: 20,
    endTime: 25,
    thumbnail: "https://cdn.pixabay.com/photo/2014/08/15/11/29/beach-418742_640.jpg"
  }
];
