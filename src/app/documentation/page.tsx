
// src/app/documentation/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const rawDocumentationText = `
## Documentación del Proyecto: "Che Amigo"

**1. Introducción y Propósito**

*   **Nombre de la Aplicación:** "Che Amigo"
*   **Objetivo Principal:** Asistir a los usuarios mediante la detección de objetos a través de la cámara del dispositivo, activada por un botón, y anunciarlos verbalmente en español latinoamericano.
*   **Caso de Uso Principal:** Potencialmente útil para personas con discapacidad visual o cualquier persona que necesite una identificación rápida de objetos en su entorno de manera accesible.

**2. Tecnologías Utilizadas**

*   **Framework Frontend:** Next.js (v15.x con App Router)
    *   *Justificación:* Framework moderno de React, componentes de servidor, rendimiento optimizado, buena experiencia para el desarrollador.
*   **Biblioteca UI:** React (v18.x)
    *   *Justificación:* UI declarativa, arquitectura basada en componentes.
*   **Lenguaje de Programación:** TypeScript
    *   *Justificación:* Seguridad de tipos, mejor mantenibilidad del código.
*   **Estilos:**
    *   Tailwind CSS: Framework CSS "utility-first" para un rápido desarrollo de UI.
    *   ShadCN/UI: Colección de componentes de UI reutilizables construidos con Radix UI y Tailwind CSS.
    *   *Justificación:* Estilo consistente, componentes accesibles, apariencia moderna.
*   **Inteligencia Artificial (IA):**
    *   Genkit: Framework de Google para construir aplicaciones impulsadas por IA.
    *   Modelo Gemini de Google AI (específicamente \`gemini-2.0-flash\` a través de Vertex AI): Modelo de IA multimodal utilizado para la detección y descripción de objetos a partir de imágenes.
    *   *Justificación:* Genkit simplifica la integración de IA; Gemini proporciona potentes capacidades de comprensión de imágenes.
*   **Síntesis de Voz:** Web Speech API (integrada en el navegador)
    *   *Justificación:* Capacidad nativa del navegador para texto a voz, sin necesidad de dependencias externas para esta parte.
*   **Iconos:**
    *   \`lucide-react\`: Biblioteca de iconos SVG simples y elegantes (ej. \`Aperture\` para el botón de detección).
    *   Componente SVG Personalizado (\`CustomHandshakeIcon.tsx\`): Para el icono de marca específico.
*   **Imágenes Estáticas:** Componente \`next/image\` para la imagen del logo (\`logo_che_amigo.png\`).
*   **Manejo de Estado:** React Hooks (\`useState\`, \`useRef\`, \`useEffect\`, \`useCallback\`)
    *   *Justificación:* Soluciones integradas de React para gestionar el estado de los componentes y los efectos secundarios.
*   **Calidad de Código/Utilidades:**
    *   ESLint/Prettier (asumido, estándar para Next.js)
    *   \`clsx\` y \`tailwind-merge\`: Utilidades para nombres de clase condicionales.

**3. Estructura del Proyecto (Archivos y Carpetas Clave)**

\`\`\`
.
├── public/images/logo_che_amigo.png  # Imagen del logo
├── src/
│   ├── ai/
│   │   ├── flows/
│   │   │   └── describe-object.ts      # Lógica del flujo de Genkit
│   │   ├── dev.ts
│   │   └── genkit.ts                   # Configuración de Genkit
│   ├── app/
│   │   ├── globals.css                 # Estilos globales y tema
│   │   ├── layout.tsx                  # Layout principal
│   │   ├── page.tsx                    # Componente principal de la aplicación
│   │   └── documentation/
│   │       └── page.tsx                # Esta página de documentación
│   ├── components/
│   │   ├── ui/                         # Componentes de ShadCN
│   │   ├── vision/
│   │   │   └── camera-view.tsx         # Componente de vista de cámara
│   │   └── icons/
│   │       └── CustomHandshakeIcon.tsx # Componente de icono SVG personalizado
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── tts.ts                      # Lógica de Text-to-Speech
│   │   └── utils.ts
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
\`\`\`

**4. Funcionalidad Principal y Lógica**

*   **A. Interfaz de Usuario e Interacción (\`src/app/page.tsx\`)**
    *   **Encabezado:** Muestra el logo de la aplicación (\`logo_che_amigo.png\` usando \`next/image\`) y el nombre "Che Amigo" con colores celeste y blanco. Utiliza un icono SVG personalizado (\`CustomHandshakeIcon.tsx\`).
    *   **Mensaje de Bienvenida:** "Hola, soy Che Amigo. Para saber qué hay enfrente, presiona el botón grande que se encuentra en la parte central de la pantalla." Este mensaje se verbaliza cuando la cámara está lista.
    *   **Vista de Cámara:**
        *   Gestionada por \`CameraView.tsx\`.
        *   Solicita permiso de cámara (\`getUserMedia\`).
        *   Muestra el feed de video en vivo.
        *   Maneja los estados de carga de la cámara y los errores.
    *   **Botón de Identificación Superpuesto:**
        *   Un botón grande (\`w-11/12\`, \`h-24\`), translúcido, con el texto "Identificar" y el icono \`Aperture\` de \`lucide-react\`.
        *   Está superpuesto en la parte inferior central de la vista de la cámara.
        *   Al presionarlo (\`onClick\`), se llama a la función \`performDetection\`.
    *   **Mensajes de Estado:** Muestra dinámicamente mensajes para:
        *   Inicialización/carga de la cámara.
        *   Errores de cámara (permiso denegado, no encontrada).
        *   Detección de objetos en progreso ("Analizando imagen...").
        *   IA hablando ("Che Amigo está hablando...").
        *   Errores durante la detección de objetos.
        *   La descripción actual del objeto detectado (debajo del botón).
    *   **Visualización de Descripción de Objetos:** Muestra el texto del último objeto detectado en un componente \`Card\` debajo del botón de identificación.

*   **B. Detección de Objetos Activada por Botón (\`src/app/page.tsx\`)**
    *   **Activación Manual:** La detección de objetos se inicia cuando el usuario presiona el botón "Identificar".
    *   **Función \`performDetection\`:**
        *   Se ejecuta solo si la cámara está lista, sin errores, y no hay otra detección o habla en curso.
    *   **Captura de Frame:**
        *   Se captura un frame del elemento \`<video>\`.
        *   Se dibuja en un \`<canvas>\` temporal.
        *   Se convierte a un Data URI Base64 (\`image/jpeg\`).
    *   **Llamada al Procesamiento de IA:**
        *   El Data URI se envía al flujo de Genkit \`describeObject\`.
        *   \`setIsDetecting(true)\` mientras se espera la respuesta de la IA.
    *   **Manejo de Resultados:**
        *   Si tiene éxito, el estado \`detectionResult\` se actualiza con la descripción de la IA.
        *   Si la nueva descripción es diferente de la anterior, se verbaliza usando \`speakTextRef.current\`.
        *   Maneja posibles errores de la llamada a la IA.
    *   **Evitar Superposición:** Los estados \`isDetecting\` e \`isSpeaking\` previenen múltiples detecciones o interrupciones del habla.

*   **C. Descripción de Objetos por IA (\`src/ai/flows/describe-object.ts\`)**
    *   **Flujo de Genkit (\`describeObjectFlow\`):**
        *   Entrada: \`photoDataUri\` (string de imagen Base64).
        *   Salida: \`objectDescription\` (string en español latinoamericano).
    *   **Prompt de Genkit (\`describeObjectPrompt\`):**
        *   Instruye al modelo Gemini (\`gemini-2.0-flash\`) para:
            *   Analizar la imagen proporcionada (\`{{media url=photoDataUri}}\`).
            *   Describir los objetos identificados en español latinoamericano.
            *   Si los objetos no están claros, describir formas generales, colores o texturas.
            *   Si la imagen está vacía, indicarlo.
            *   Asegurar una respuesta no vacía.
    *   **Manejo de Errores:** Incluye un mensaje de fallback si la IA no devuelve una descripción válida.

*   **D. Verbalización de Nombres de Objetos (\`src/lib/tts.ts\`)**
    *   **Web Speech API:** Aprovecha \`window.speechSynthesis\`.
    *   **Selección de Voz:** Prioriza voces en español latinoamericano.
    *   **Configuración de la Emisión:** Establece idioma, volumen, velocidad y tono para el habla (los valores de volumen y velocidad se gestionan con estados internos en \`page.tsx\` con valores predeterminados, sin controles de UI expuestos al usuario).
    *   **Gestión de Cola:** Cancela habla anterior antes de nueva emisión.
    *   **Basado en Promesas:** La función \`speak\` es asíncrona.

**5. Estilos y Tema**

*   **\`src/app/globals.css\`:**
    *   Define propiedades CSS para el tema de ShadCN UI:
        *   \`--background\`: Gris muy oscuro (#212121)
        *   \`--foreground\`: Blanco
        *   \`--primary\`: Morado oscuro (#673AB7) (usado por el botón translúcido)
        *   \`--accent\`: Rosa brillante (#E91E63)
    *   Modo oscuro por defecto.
*   **Tailwind CSS:** Utilizado extensamente.

**6. Decisiones de Diseño Clave y Características Implementadas**

*   **Introducción del Asistente de Voz:** Implementada ("Hola, soy Che Amigo. Para saber qué hay enfrente, presiona el botón grande que se encuentra en la parte central de la pantalla.").
*   **Detección de Objetos Activada por Botón:** Implementada con un botón grande, central y translúcido superpuesto a la cámara.
*   **Verbalización de Nombres de Objetos:** Implementada mediante la Web Speech API en español latinoamericano.
*   **Esquema de Colores:** Implementado en \`globals.css\`.
*   **Fuentes:** Utiliza Geist Sans.
*   **Diseño de Interfaz:** Simplificado para accesibilidad, con enfoque en la cámara y el botón de acción.
*   **Logo y Nombre de Marca:** "Che Amigo" con el logo \`logo_che_amigo.png\` y un icono SVG personalizado, ambos con colores celeste y blanco.
`;

function downloadTextFile(filename: string, text: string, mimeType: string = 'text/plain') {
  if (typeof window === "undefined") return;
  const element = document.createElement('a');
  element.setAttribute('href', `data:${mimeType};charset=utf-8,` + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="mb-8 flex flex-col items-center">
        <div className="w-full max-w-4xl mb-4">
            <Link href="/" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver a la aplicación
            </Link>
        </div>
        <h1 className="text-4xl font-bold text-center">Documentación del Proyecto</h1>
        <h2 className="text-2xl text-primary text-center mt-1">Che Amigo</h2>
      </header>
      
      <div className="my-6 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button 
          onClick={() => downloadTextFile('che_amigo_documentacion.txt', rawDocumentationText, 'text/plain')}
          variant="outline"
          size="lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Descargar como .txt
        </Button>
        <Button 
          onClick={() => downloadTextFile('che_amigo_documentacion.md', rawDocumentationText, 'text/markdown')}
          size="lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Descargar como .md
        </Button>
      </div>

      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Contenido de la Documentación</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-muted/30 p-4 rounded-md max-h-[70vh] overflow-auto">
            {rawDocumentationText}
          </pre>
        </CardContent>
      </Card>
      
      <footer className="mt-12 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} <span className="font-semibold text-sky-400">Che</span> <span className="font-semibold text-white">Amigo</span>. Documentación del proyecto.</p>
      </footer>
    </div>
  );
}

    
