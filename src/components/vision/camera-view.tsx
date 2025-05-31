
// src/components/vision/camera-view.tsx
"use client";

import type { Dispatch, SetStateAction } from "react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CameraOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [internalErrorOccurred, setInternalErrorOccurred] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      setIsLoading(true);
      setInternalErrorOccurred(false); // Reset on new attempt
      setCameraError(null); // Clear previous errors in parent
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
              setInternalErrorOccurred(false);
            };
            // Handle cases where onloadedmetadata might not fire for some reason
            videoRef.current.onerror = () => {
                console.error("Video element error.");
                setCameraError("Error en el elemento de video al cargar la transmisión.");
                onCameraReady(false);
                setIsLoading(false);
                setInternalErrorOccurred(true);
            }
          } else {
            // This case should ideally not happen if ref is managed correctly
            throw new Error("Video reference is not available.");
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
        setInternalErrorOccurred(true);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.onloadedmetadata = null; // Clean up event listener
        videoRef.current.onerror = null; // Clean up event listener
      }
      // Don't reset parent's cameraError here, just manage readiness
      onCameraReady(false); 
      setIsLoading(false); // Ensure loading is false on unmount/cleanup
    };
  }, [videoRef, onCameraReady, setCameraError, width, height]);

  return (
    <Card className="w-full overflow-hidden shadow-lg">
      <CardContent className="p-0 relative aspect-[4/3] bg-muted flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // Mute to avoid feedback loop if microphone was also captured
          className={cn(
            "w-full h-full object-cover",
            (isLoading || internalErrorOccurred) && "hidden" // Hide video if loading or error
          )}
          width={width}
          height={height}
        />
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-foreground">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="text-lg">Iniciando cámara...</p>
          </div>
        )}
        {!isLoading && internalErrorOccurred && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 text-destructive p-4">
            <CameraOff className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold text-center">Visor de Cámara Desactivado</p>
            <p className="text-sm text-center text-muted-foreground mt-1">
              No se pudo iniciar la cámara. Revisa los permisos en tu navegador o si otra aplicación la está usando.
            </p>
          </div>
        )}
        {!isLoading && !internalErrorOccurred && !videoRef.current?.srcObject && (
            // Fallback for when not loading, no error, but video still not active (e.g. onloadedmetadata never fired but no error caught)
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 text-foreground p-4">
                <CameraOff className="h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold text-center">Cámara no disponible</p>
                <p className="text-sm text-center text-muted-foreground mt-1">
                El visor de la cámara no pudo activarse. Intenta recargar la página.
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraView;

