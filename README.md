# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Getting Started Locally

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up Environment Variables:**
    *   Copy the `.env.example` file to a new file named `.env.local`.
        ```bash
        cp .env.example .env.local
        ```
    *   Open `.env.local` and add your Google AI API key:
        ```
        GOOGLE_API_KEY="YOUR_ACTUAL_GOOGLE_AI_API_KEY"
        ```
    *   You can obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey) or by enabling the Vertex AI API in your Google Cloud project.
    *   **Important:** The `.env.local` file is already in `.gitignore` and should **never** be committed to your repository.

3.  **Run the development server (for Next.js app):**
    ```bash
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

4.  **Run the Genkit development server (optional, for Genkit-specific tools like the inspector):**
    In a separate terminal:
    ```bash
    npm run genkit:dev
    ```
    This typically starts the Genkit inspector on [http://localhost:4000](http://localhost:4000).

## Deploying to Vercel

1.  Push your code to a GitHub repository.
2.  Import your GitHub repository into Vercel.
3.  Configure Environment Variables in Vercel:
    *   In your Vercel project settings, go to "Environment Variables".
    *   Add `GOOGLE_API_KEY` with your actual Google AI API key as its value.
    Vercel will use this key for your deployed application.
```