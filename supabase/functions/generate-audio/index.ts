import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AudioRequest {
  text: string;
  service: 'elevenlabs' | 'tavus' | 'azure';
  voice_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, service, voice_id }: AudioRequest = await req.json()

    // Validate input
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (service === 'elevenlabs') {
      return await generateElevenLabsAudio(text, voice_id)
    } else if (service === 'tavus') {
      return await generateTavusAudio(text)
    } else if (service === 'azure') {
      return await generateAzureAudio(text, voice_id)
    }

    return new Response(
      JSON.stringify({ error: 'Invalid service specified' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Audio generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate audio' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function generateAzureAudio(text: string, voice?: string): Promise<Response> {
  const subscriptionKey = Deno.env.get('AZURE_SPEECH_KEY')
  const region = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus'
  
  if (!subscriptionKey) {
    return new Response(
      JSON.stringify({ error: 'Azure Speech subscription key not configured' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Get access token
    const tokenResponse = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!tokenResponse.ok) {
      console.error('Failed to get Azure access token:', tokenResponse.status)
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Azure' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const accessToken = await tokenResponse.text()

    // Default to high-quality neural voice
    const selectedVoice = voice || 'en-US-AriaNeural'
    
    // Limit text length
    const limitedText = text.substring(0, 1000)

    // Create SSML
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${selectedVoice}">
          <prosody rate="0%" pitch="0%">
            ${escapeXml(limitedText)}
          </prosody>
        </voice>
      </speak>
    `.trim()

    console.log(`Generating Azure TTS audio for text: "${limitedText.substring(0, 50)}..." with voice: ${selectedVoice}`)

    // Generate speech
    const speechResponse = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'ShowerGenius-TTS',
      },
      body: ssml,
    })

    if (!speechResponse.ok) {
      const errorText = await speechResponse.text()
      console.error('Azure TTS API error:', speechResponse.status, errorText)
      return new Response(
        JSON.stringify({ error: `Azure TTS request failed: ${speechResponse.status}` }),
        { 
          status: speechResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const audioBuffer = await speechResponse.arrayBuffer()
    
    console.log(`Successfully generated Azure TTS audio, size: ${audioBuffer.byteLength} bytes`)
    
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Azure TTS generation failed:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate audio with Azure TTS' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function generateElevenLabsAudio(text: string, voiceId?: string): Promise<Response> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ElevenLabs API key not configured' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const defaultVoiceId = 'pNInz6obpgDQGcFmaJgB' // Adam voice
    const selectedVoiceId = voiceId || defaultVoiceId

    // Limit text length to avoid API limits
    const limitedText = text.substring(0, 1000)

    console.log(`Generating audio for text: "${limitedText.substring(0, 50)}..." with voice: ${selectedVoiceId}`)

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: limitedText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: `ElevenLabs API request failed: ${response.status}` }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const audioBuffer = await response.arrayBuffer()
    
    console.log(`Successfully generated audio, size: ${audioBuffer.byteLength} bytes`)
    
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('ElevenLabs generation failed:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate audio with ElevenLabs' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function generateTavusAudio(text: string): Promise<Response> {
  const apiKey = Deno.env.get('TAVUS_API_KEY')
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Tavus API key not configured' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Limit text length for Tavus
    const limitedText = text.substring(0, 500)

    console.log(`Creating Tavus video for text: "${limitedText.substring(0, 50)}..."`)

    // Create video with Tavus
    const createResponse = await fetch('https://tavusapi.com/v2/videos', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: limitedText,
        replica_id: 'r783537ef5', // Default replica
        video_name: `ShowerThought_${Date.now()}`,
        properties: {
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
          },
        },
      }),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('Tavus create video error:', createResponse.status, errorText)
      return new Response(
        JSON.stringify({ error: `Tavus video creation failed: ${createResponse.status}` }),
        { 
          status: createResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const createData = await createResponse.json()
    const videoId = createData.video_id

    console.log(`Tavus video created with ID: ${videoId}, polling for completion...`)

    // Poll for completion with shorter intervals
    let attempts = 0
    const maxAttempts = 20 // 3-4 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
      
      const statusResponse = await fetch(`https://tavusapi.com/v2/videos/${videoId}`, {
        headers: {
          'x-api-key': apiKey,
        },
      })

      if (!statusResponse.ok) {
        console.error('Tavus status check failed:', statusResponse.status)
        break
      }

      const statusData = await statusResponse.json()
      console.log(`Tavus video status: ${statusData.status}`)
      
      if (statusData.status === 'completed' && statusData.download_url) {
        console.log(`Tavus video completed: ${statusData.download_url}`)
        // Return the download URL
        return new Response(
          JSON.stringify({ audio_url: statusData.download_url }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      if (statusData.status === 'failed') {
        console.error('Tavus video generation failed')
        return new Response(
          JSON.stringify({ error: 'Tavus video generation failed' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      attempts++
    }
    
    console.error('Tavus video generation timed out')
    return new Response(
      JSON.stringify({ error: 'Tavus video generation timed out' }),
      { 
        status: 408,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Tavus generation failed:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate audio with Tavus' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}