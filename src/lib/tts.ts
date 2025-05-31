// src/lib/tts.ts
"use client";

interface SpeakOptions {
  lang?: string;
  volume?: number;
  rate?: number;
  pitch?: number;
}

const DEFAULT_LANG = "es-419"; // BCP 47 for Latin American Spanish
const DEFAULT_VOLUME = 1;
const DEFAULT_RATE = 1;
const DEFAULT_PITCH = 1;

let internalVoices: SpeechSynthesisVoice[] = [];
let voicesPromise: Promise<SpeechSynthesisVoice[]>;
let resolveVoicesPromise: ((value: SpeechSynthesisVoice[] | PromiseLike<SpeechSynthesisVoice[]>) => void) | null = null;

if (typeof window !== 'undefined' && window.speechSynthesis) {
  voicesPromise = new Promise(resolve => {
    resolveVoicesPromise = resolve;
  });

  const loadVoices = () => {
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
      internalVoices = availableVoices;
      if (resolveVoicesPromise) {
        resolveVoicesPromise(internalVoices);
      }
      // No need to listen for onvoiceschanged anymore if voices are loaded
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    }
  };

  // Initial attempt to load voices
  loadVoices();

  // If voices are not immediately available, set up a listener
  if (internalVoices.length === 0 && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  } else if (internalVoices.length === 0) {
    // Fallback if onvoiceschanged is not supported but getVoices is
    console.warn("Speech synthesis voices not immediately available and onvoiceschanged event not supported. Retrying in a bit.");
    setTimeout(() => {
        loadVoices();
        if(internalVoices.length === 0) {
            console.error("Failed to load speech synthesis voices even after a delay.");
            if (resolveVoicesPromise) {
              resolveVoicesPromise([]); // Resolve with empty if still no voices
            }
        }
    }, 1000); // Retry after 1 second
  }

} else {
  // speechSynthesis not supported, resolve promise with empty array
  voicesPromise = Promise.resolve([]);
}


export async function speak(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("SpeechSynthesis API not supported. Cannot speak.");
    return Promise.resolve(); // Resolve, don't reject, as it's a capability issue
  }

  // Wait for voices to be loaded
  const availableVoices = await voicesPromise;

  return new Promise((resolve, reject) => {
    const {
      lang = DEFAULT_LANG,
      volume = DEFAULT_VOLUME,
      rate = DEFAULT_RATE,
      pitch = DEFAULT_PITCH,
    } = options;

    // Cancel any ongoing speech. Important to do this before creating a new utterance.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.volume = Math.max(0, Math.min(1, volume));
    utterance.rate = Math.max(0.1, Math.min(10, rate));
    utterance.pitch = Math.max(0, Math.min(2, pitch));

    if (availableVoices.length === 0) {
      console.warn("No speech synthesis voices found in the browser. Attempting to speak with browser default settings for lang:", lang);
    } else {
      let selectedVoice: SpeechSynthesisVoice | undefined = undefined;

      // 1. Try exact language match (e.g., 'es-419')
      const langSpecificVoices = availableVoices.filter(voice => voice.lang === lang);
      if (langSpecificVoices.length > 0) {
        selectedVoice = langSpecificVoices.find(v => v.default) || langSpecificVoices[0];
        console.log(`TTS: Selected voice for exact lang ${lang}: ${selectedVoice?.name} (Default: ${selectedVoice?.default})`);
      }
      
      // 2. Try broader language match (e.g., 'es') if no exact match
      if (!selectedVoice) {
        const broaderLang = lang.substring(0, 2);
        const broaderLangVoices = availableVoices.filter(voice => voice.lang.startsWith(broaderLang));
        if (broaderLangVoices.length > 0) {
          selectedVoice = broaderLangVoices.find(v => v.default) || broaderLangVoices[0];
          console.log(`TTS: Selected voice for broader lang ${broaderLang}: ${selectedVoice?.name} (Default: ${selectedVoice?.default})`);
        }
      }
      
      // 3. Fallback to navigator's language if available and still no voice
      if (!selectedVoice) {
        const navigatorLang = typeof navigator !== 'undefined' ? navigator.language : '';
        if (navigatorLang) {
          const navigatorLangCode = navigatorLang.substring(0,2);
          const navigatorLangVoices = availableVoices.filter(voice => voice.lang.startsWith(navigatorLangCode));
          if (navigatorLangVoices.length > 0) {
              selectedVoice = navigatorLangVoices.find(v => v.default) || navigatorLangVoices[0];
              console.log(`TTS: Selected voice (navigator language ${navigatorLangCode} fallback): ${selectedVoice?.name} (Default: ${selectedVoice?.default})`);
          }
        }
      }
      
      // 4. As a last resort, use the first available 'default' voice or just the very first voice
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.default) || (availableVoices.length > 0 ? availableVoices[0] : undefined);
        if (selectedVoice) {
            console.log(`TTS: Selected voice (general fallback): ${selectedVoice.name} (Default: ${selectedVoice.default})`);
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        console.warn(`TTS: Could not find any specific voice. Using browser default for lang ${lang}.`);
      }
    }

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error("SpeechSynthesisUtterance.onerror occurred.");
      console.error("Error type from event:", event.type); // Should be 'error'
      console.error("Error code from event:", event.error); // This is the SpeechSynthesisErrorCode
      console.error("Error charIndex from event:", event.charIndex);
      console.error("Error elapsedTime from event:", event.elapsedTime);
      
      const errorCode = event.error || 'unknown';
      let detailedMessage = `Error de síntesis de voz: ${errorCode}.`;

      switch (event.error) {
        case 'canceled':
          detailedMessage += " El habla fue cancelada.";
          break;
        case 'interrupted':
          detailedMessage += " El habla fue interrumpida.";
          break;
        case 'audio-busy':
          detailedMessage += " El sistema de audio está ocupado.";
          break;
        case 'audio-hardware':
          detailedMessage += " Error de hardware de audio.";
          break;
        case 'network':
          detailedMessage += " Error de red para la síntesis de voz.";
          break;
        case 'synthesis-failed':
          detailedMessage += " Falló la síntesis.";
          break;
        case 'synthesis-unavailable':
          detailedMessage += " Motor de síntesis no disponible.";
          break;
        case 'language-unavailable':
          detailedMessage += ` El idioma '${utterance.lang}' no está disponible o no es soportado por la voz seleccionada ('${utterance.voice?.name}', lang: '${utterance.voice?.lang}').`;
          break;
        case 'voice-unavailable':
          detailedMessage += ` La voz seleccionada ('${utterance.voice?.name}') para el idioma '${utterance.lang}' no está disponible.`;
          break;
        case 'text-too-long':
          detailedMessage += " El texto a sintetizar es demasiado largo.";
          break;
        case 'invalid-argument':
          detailedMessage += " Argumento inválido proporcionado a la síntesis de voz.";
          break;
        case 'not-allowed':
           detailedMessage += " Permiso denegado para la síntesis de voz.";
           break;
        case 'service-not-allowed':
           detailedMessage += " Servicio de síntesis de voz no permitido (podría ser por políticas del navegador o del sistema).";
           break;
        default:
          detailedMessage += " Ocurrió un error desconocido durante la síntesis de voz.";
      }
      
      console.error(`TTS Error Context: ${detailedMessage}`);
      console.error(`Utterance details - Text (first 100 chars): "${utterance.text.substring(0, 100)}...", Lang: ${utterance.lang}, Voice: ${utterance.voice ? `${utterance.voice.name} (lang: ${utterance.voice.lang})` : 'Default browser voice'}`);
      
      reject(new Error(detailedMessage));
    };
    
    // Delay slightly before speaking, sometimes helps with 'canceled' or 'interrupted' errors
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 100);

  });
}
