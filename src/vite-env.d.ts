/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELEVENLABS_API_KEY: string
  readonly VITE_TAVUS_API_KEY: string
  readonly VITE_GROQ_API_KEY: string
  readonly VITE_AZURE_SPEECH_KEY: string
  readonly VITE_AZURE_SPEECH_REGION: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
