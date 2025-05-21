
import React, { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import ClipSelector from "@/components/ClipSelector";
import { videoSource, videoClips } from "@/data/videoClips";
import { VideoClip } from "@/types/video";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [activeClipId, setActiveClipId] = useState<string>(videoClips[0].id);
  
  const handleSelectClip = (clip: VideoClip) => {
    setActiveClipId(clip.id);
  };

  const activeClip = videoClips.find(clip => clip.id === activeClipId) || videoClips[0];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-video-accent to-purple-500">
            The Entity
          </h1>
          <p className="text-muted-foreground mt-2">
            Select different clips to navigate through the video
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 overflow-hidden">
              <CardContent className="p-0">
                <VideoPlayer 
                  source={videoSource} 
                  clips={videoClips} 
                  initialClip={activeClip}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <ClipSelector 
              clips={videoClips}
              activeClipId={activeClipId}
              onSelectClip={handleSelectClip}
            />
          </div>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Now Playing</CardTitle>
            <CardDescription>{activeClip.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{activeClip.description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
