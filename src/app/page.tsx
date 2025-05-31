
// src/app/page.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import CameraView from "@/components/vision/camera-view";
import { describeObject, type DescribeObjectInput } from "@/ai/flows/describe-object";
import { speak } from "@/lib/tts";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Info, Aperture } from "lucide-react";

const GREETING_MESSAGE_PART1 = "Hola, soy ";
const GREETING_MESSAGE_PART2 = ". Para saber qué hay enfrente, presiona el botón grande que se encuentra en la parte central de la pantalla.";

export default function CheAmigoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraViewLoading, setIsCameraViewLoading] = useState(true);

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<string | null>(null);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  const [volume, setVolume] = useState(1); // Default volume
  const [speechRate, setSpeechRate] = useState(1); // Default speech rate
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { toast } = useToast();

  const speakTextRef = useRef(async (text: string, isGreeting: boolean = false) => {});

  useEffect(() => {
    speakTextRef.current = async (text: string, isGreeting: boolean = false) => {
      if (!text) return;
      if (isSpeaking && !isGreeting) {
        console.log("SpeakTextRef: Skipped speaking new (non-greeting) text as already speaking.");
        return;
      }

      setIsSpeaking(true);
      try {
        await speak(text, { lang: "es-419", volume, rate: speechRate });
      } catch (error) {
        console.error("Error speaking text:", text, error);
        const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido al intentar hablar.";
        if (!isGreeting) {
          toast({
            variant: "destructive",
            title: "Error de Audio",
            description: `No se pudo reproducir el audio: ${errorMessage}`,
          });
        } else {
          console.warn("Failed to speak greeting message:", errorMessage);
        }
      } finally {
        setIsSpeaking(false);
      }
    };
  }, [volume, speechRate, toast, isSpeaking]);


  const handleCameraReadyCallback = useCallback((ready: boolean) => {
    setIsCameraReady(ready);
    setIsCameraViewLoading(false);
  }, []);

  useEffect(() => {
    if (isCameraReady && !cameraError) {
      const plainGreeting = `${GREETING_MESSAGE_PART1}Che Amigo${GREETING_MESSAGE_PART2}`;
      speakTextRef.current(plainGreeting, true);
    } else if (cameraError) {
      if (!cameraError.toLowerCase().includes("permission denied") && !cameraError.toLowerCase().includes("notallowederror")) {
        speakTextRef.current("Error al acceder a la cámara. Por favor, verifica los permisos e intenta recargar la página.", true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraReady, cameraError]); // speakTextRef removed to avoid re-triggering greeting on volume/rate change

  const previousDetectionResultRef = useRef<string | null>(null);

  const performDetection = async () => {
    if (isDetecting || isSpeaking || !isCameraReady || !videoRef.current || videoRef.current.paused || videoRef.current.ended || cameraError) {
      return;
    }

    const captureFrame = (): string | null => {
      if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL("image/jpeg");
        }
      }
      return null;
    };

    const frameDataUri = captureFrame();
    if (!frameDataUri) {
      console.warn("Detección: No se pudo capturar imagen.");
      setDetectionError("No se pudo capturar la imagen de la cámara.");
      return;
    }

    setIsDetecting(true);
    setDetectionError(null);
    // setDetectionResult(null); // Clear previous result while detecting

    try {
      const input: DescribeObjectInput = { photoDataUri: frameDataUri };
      const result = await describeObject(input);
      const newDescription = result.objectDescription;

      if (newDescription) {
        setDetectionResult(newDescription);
        if (newDescription !== previousDetectionResultRef.current) {
          previousDetectionResultRef.current = newDescription;
          await speakTextRef.current(newDescription);
        }
      } else {
         setDetectionError("No se pudo obtener una descripción.");
      }
    } catch (error) {
      console.error("Error en detección de objetos:", error);
      const errMsg = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
      setDetectionError(`Error en detección: ${errMsg}.`);
      setDetectionResult(null);
      previousDetectionResultRef.current = null; // Reset previous if error
    } finally {
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    // Cleanup speech synthesis on component unmount
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleDetectButtonClick = () => {
    performDetection();
  };

  const renderStatusMessages = () => {
    if (cameraError) {
      return (
        <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Cámara</AlertTitle>
          <AlertDescription>{cameraError}</AlertDescription>
        </Alert>
      );
    }
    
    if (isCameraViewLoading && !isCameraReady) { // Show loading only if camera view itself is loading
         return (
             <Alert variant="default" className="bg-secondary/50 shadow-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Iniciando cámara...</AlertTitle>
                <AlertDescription>Por favor, espera un momento.</AlertDescription>
            </Alert>
        );
    }
    
    // This error state should only show if no other major state (speaking, detecting) is active
    if (detectionError && !isSpeaking && !isDetecting) {
      return (
        <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Detección</AlertTitle>
          <AlertDescription>{detectionError}</AlertDescription>
        </Alert>
      );
    }

    if (isSpeaking) {
      return (
          <Alert variant="default" className="bg-primary/10 border-primary/50 shadow-md">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Che Amigo está hablando...</AlertTitle>
            {detectionResult && <AlertDescription>"{detectionResult.length > 70 ? detectionResult.substring(0, 67) + "..." : detectionResult}"</AlertDescription>}
          </Alert>
      );
    }

    if (isDetecting) {
      return (
            <Alert variant="default" className="bg-secondary shadow-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Analizando imagen...</AlertTitle>
              <AlertDescription>Identificando objetos, por favor espera.</AlertDescription>
            </Alert>
      );
    }

    // Show detection result only if not detecting, not speaking, and there is a result
    if (detectionResult && !isDetecting && !isSpeaking) {
      return (
        <Card className="shadow-lg bg-card border-primary/50 w-full">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg flex items-center">
              <Info className="mr-2 h-5 w-5 text-primary" />
              Última descripción
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <p className="text-base">{detectionResult}</p>
          </CardContent>
        </Card>
      );
    }
    
    // Default message if camera is ready and no other state is active
    if (isCameraReady && !isDetecting && !isSpeaking && !detectionResult && !detectionError && !cameraError) {
        return (
             <Alert variant="default" className="bg-secondary/50 shadow-md">
                <Info className="h-4 w-4" />
                <AlertTitle>Listo para identificar</AlertTitle>
                <AlertDescription>Presiona el botón grande en la imagen de la cámara para saber qué hay enfrente.</AlertDescription>
            </Alert>
        );
    }

    // Fallback if camera isn't ready, view isn't loading, and no error (edge case)
    if (!isCameraReady && !isCameraViewLoading && !cameraError) {
        return (
            <Alert variant="destructive" className="shadow-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Cámara no disponible</AlertTitle>
                <AlertDescription>No se pudo iniciar la cámara. Verifica los permisos.</AlertDescription>
            </Alert>
        );
    }

    return <div className="h-[56px]"></div>; // Placeholder for consistent layout height
  };


  return (
    <div className="min-h-screen flex flex-col items-center p-2 sm:p-4 bg-background text-foreground">
      <header className="mb-4 sm:mb-6 text-center">
        <div className="flex items-center justify-center mb-1 sm:mb-2">
          <Image
            src="/images/logo_che_amigo.png"
            alt="Che Amigo Logo"
            width={56} 
            height={56}
            className="mr-2"
            data-ai-hint="logo handshake"
          />
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span className="text-sky-400">Che</span> <span className="text-white">Amigo</span>
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground px-2">
          {GREETING_MESSAGE_PART1}
          <span className="font-semibold text-sky-400">Che</span> <span className="font-semibold text-white">Amigo</span>
          {GREETING_MESSAGE_PART2}
        </p>
      </header>

      <main className="w-full max-w-md flex flex-col items-center space-y-3 flex-grow">
        {/* Camera View and Superposed Button Container */}
        <div className="relative w-full rounded-lg overflow-hidden shadow-xl border border-border">
          <CameraView
            videoRef={videoRef}
            onCameraReady={handleCameraReadyCallback}
            setCameraError={setCameraError}
          />
          {isCameraReady && !cameraError && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm z-10">
              <Button
                onClick={handleDetectButtonClick}
                disabled={isDetecting || isSpeaking}
                className="w-full h-24 text-3xl rounded-xl shadow-lg bg-primary/70 hover:bg-primary/60 text-primary-foreground flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Identificar objetos en frente"
              >
                {isDetecting ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Aperture className="h-8 w-8 mr-3 sm:mr-4" />
                )}
                {isDetecting ? "Analizando..." : "Identificar"}
              </Button>
            </div>
          )}
        </div>

        {/* Status Messages Area (below camera view) */}
        <div className="w-full min-h-[70px] flex items-center justify-center px-1">
          {renderStatusMessages()}
        </div>
      </main>
      
      <footer className="mt-6 sm:mt-8 text-center text-muted-foreground text-sm">
        <p>Desarrollado por Developer Sinches Hugo.</p>
        <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
        <p className="mt-1">
          <Link href="/documentation" className="text-xs text-primary hover:underline">
            Ver Documentación del Proyecto
          </Link>
        </p>
      </footer>
    </div>
  );
}
    
