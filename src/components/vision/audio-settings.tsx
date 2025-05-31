// src/components/vision/audio-settings.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Volume2, Zap, Settings2 } from "lucide-react";

interface AudioSettingsProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({
  volume,
  onVolumeChange,
  speechRate,
  onSpeechRateChange,
}) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Settings2 className="mr-2 h-6 w-6" />
          Ajustes de Audio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="volume-slider" className="flex items-center text-base">
            <Volume2 className="mr-2 h-5 w-5" />
            Volumen
          </Label>
          <Slider
            id="volume-slider"
            min={0}
            max={1}
            step={0.1}
            value={[volume]}
            onValueChange={(value) => onVolumeChange(value[0])}
            aria-label="Volume"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="speed-slider" className="flex items-center text-base">
            <Zap className="mr-2 h-5 w-5" />
            Velocidad de Voz
          </Label>
          <Slider
            id="speed-slider"
            min={0.5}
            max={2}
            step={0.1}
            value={[speechRate]}
            onValueChange={(value) => onSpeechRateChange(value[0])}
            aria-label="Speech Rate"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioSettings;
