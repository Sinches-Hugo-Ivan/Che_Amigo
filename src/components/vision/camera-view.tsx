// src/components/vision/camera-view.tsx
"use client";

import type { Dispatch, SetStateAction } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CameraOff, Loader2 } from "lucide-react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCameraReady: (isReady: boolean) => void;
  setCameraError: Dispatch<SetStateAction<string | null>>;
  width?: number;
  height?: number;
}

const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  onCameraReady,
  setCameraError,
  width = 640,
  height = 480,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      setIsLoading(true);
      setCameraError(null);
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width, height, facingMode: "environment" },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              onCameraReady(true);
              setIsLoading(false);
            };
          }
        } else {
          throw new Error("Camera API not supported by this browser.");
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        let message = "Could not access camera. ";
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            message += "Permission denied.";
          } else if (err.name === "NotFoundError") {
            message += "No camera found.";
          } else {
            message += err.message;
          }
        }
        setCameraError(message);
        onCameraReady(false);
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      onCameraReady(false);
    };
  }, [videoRef, onCameraReady, setCameraError, width, height]);

  return (
    <Card className="w-full overflow-hidden shadow-lg">
      <CardContent className="p-0 relative aspect-[4/3]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // Mute to avoid feedback loop if microphone was also captured
          className="w-full h-full object-cover"
          width={width}
          height={height}
        />
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-foreground">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="text-lg">Iniciando cámara...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraView;
