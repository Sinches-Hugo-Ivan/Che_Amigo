
// This is an AI-powered function that detects objects in an image and announces them in Latin American Spanish.
//   - describeObject - The main function to describe and announce objects.
//   - DescribeObjectInput - Input type for the describeObject function.
//   - DescribeObjectOutput - Output type for the describeObject function.

'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DescribeObjectInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo taken from the camera feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DescribeObjectInput = z.infer<typeof DescribeObjectInputSchema>;

const DescribeObjectOutputSchema = z.object({
  objectDescription: z.string().describe('Description of what is detected in the image in Latin American Spanish. This should not be empty; if no objects are clear, it should state that.'),
});
export type DescribeObjectOutput = z.infer<typeof DescribeObjectOutputSchema>;

export async function describeObject(input: DescribeObjectInput): Promise<DescribeObjectOutput> {
  return describeObjectFlow(input);
}

const describeObjectPrompt = ai.definePrompt({
  name: 'describeObjectPrompt',
  input: {schema: DescribeObjectInputSchema},
  output: {schema: DescribeObjectOutputSchema},
  prompt: `You are an AI assistant that analyzes images and describes what it sees in Latin American Spanish.
Your task is to describe the contents of the image provided.
- If you clearly identify one or more objects, list them and provide a brief description in Latin American Spanish.
- If the image is blurry, dark, or if you cannot confidently identify any specific objects, please state that you cannot make out clear objects but describe any general shapes, colors, or textures you perceive, in Latin American Spanish. For example: "La imagen es un poco borrosa, pero parece haber una forma oscura en el centro." or "No logro distinguir objetos específicos, se ve mayormente una superficie azul."
- If the image appears to be empty or of a uniform surface (e.g., a wall, the sky with no distinct features), describe that. For example: "La imagen muestra una superficie blanca uniforme."
Always provide a response in Latin American Spanish, and ensure the 'objectDescription' field is never empty.

Image: {{media url=photoDataUri}}
  `,
});

const describeObjectFlow = ai.defineFlow(
  {
    name: 'describeObjectFlow',
    inputSchema: DescribeObjectInputSchema,
    outputSchema: DescribeObjectOutputSchema,
  },
  async input => {
    const {output} = await describeObjectPrompt(input);
    if (!output || !output.objectDescription) {
      // Fallback in case the model returns an empty or invalid response despite the prompt
      return { objectDescription: "No se pudo obtener una descripción de la imagen." };
    }
    return output;
  }
);

