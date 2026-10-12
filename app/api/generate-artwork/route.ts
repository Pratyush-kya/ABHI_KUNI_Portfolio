import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

export const maxDuration = 60;

function buildThematicFallbackPrompt(title: string, lyrics: string, style: string, customHint: string): string {
  const combined = `${title} ${lyrics}`;
  
  if (customHint) {
    return `${customHint}, cinematic lighting, high quality album cover art, clean focal point.`;
  }
  
  // Specific Odia topic recognizers
  if (combined.includes('ସଜନା') || combined.includes('ବାଡ଼ି') || combined.includes('ଗଛ')) {
    return 'A magnificent leafy green Sajana moringa tree full of delicate white blossoms standing proud in a rustic Odishan village backyard, warm golden morning light, serene countryside, cinematic depth.';
  }
  if (combined.includes('ନନ୍ଦ') || combined.includes('କୃଷ୍ଣ') || combined.includes('ଗୋବିନ୍ଦ') || combined.includes('ଯଶୋଦା')) {
    return 'A radiant baby Krishna sitting joyfully in the loving lap of mother Yashoda inside a warmly lit traditional Odishan home, glowing brass diya lamps, marigold garlands, divine golden atmosphere.';
  }
  if (combined.includes('ଦଶହରା') || combined.includes('ଦୁର୍ଗା') || combined.includes('କଟକ')) {
    return 'Majestic Goddess Durga idol in traditional silver filigree Chandi Medha pandal of Cuttack, ornate silver work, glowing festive oil lamps, vibrant Odishan celebration.';
  }
  if (combined.includes('ଗୋଧୂଳି') || combined.includes('ଗାଈ') || combined.includes('ସନ୍ଧ୍ୟା')) {
    return 'Magical Odishan twilight godhuli belaa with cattle walking home on an earthen village path kicking up golden dust, peaceful setting sun reflections, serene village dusk.';
  }
  if (combined.includes('ଜଗନ୍ନାଥ') || combined.includes('ହରି') || combined.includes('କରୁଣା') || combined.includes('ମନ୍ଦିର')) {
    return 'Ancient stone Kalinga temple sanctum glowing with warm earthen clay diya lamps at spiritual twilight, serene divine atmosphere, sacred lotus offerings, peaceful devotion.';
  }
  if (combined.includes('ଧର୍ମ') || combined.includes('ମୋକ୍ଷ') || combined.includes('ଫଳ') || combined.includes('ସଂସାର')) {
    return 'Ancient sacred palm-leaf manuscript illuminated by a serene glowing earthen lamp, sacred tulsi leaves, contemplative spiritual depth, warm golden light.';
  }

  // Style-guided fallback
  switch (style) {
    case 'devotional':
      return 'Majestic ancient Odisha Kalinga-style stone temple silhouette at spiritual twilight, warm glowing terracotta clay diya lamp on wet stone steps, sacred atmosphere, serene golden illumination.';
    case 'nature':
      return 'Cinematic landscape photography of rural Odisha countryside, serene riverbank with a wooden boat, tranquil lotus pond, golden twilight reflections, lush greenery, peaceful rural dawn.';
    case 'pattachitra':
      return 'Authentic Odisha Pattachitra folk art illustration of traditional Odishan cultural celebration, crisp hand-painted black outlines, ornate temple border, natural earthy mineral pigments of terracotta and indigo.';
    case 'poetic':
    default:
      return 'Minimalist cinematic album cover art, a single symbolic physical subject with soft bokeh and shallow depth of field, warm emotional golden hour lighting, clean and elegant visual metaphor.';
  }
}

export async function POST(req: NextRequest) {
  try {
    // Security Guard: Only authenticated admins may invoke AI artwork generation
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const startTime = Date.now();
    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 150) : '';
    const lyrics = typeof body.lyrics === 'string' ? body.lyrics.trim().slice(0, 4000) : '';
    const style = typeof body.style === 'string' ? body.style.trim() : 'poetic';
    const customHint = typeof body.customHint === 'string' ? body.customHint.trim().slice(0, 200) : '';
    const previousUrl = typeof body.previousUrl === 'string' ? body.previousUrl.trim() : '';
    const isTurbo = body.turbo !== false; // Default to turbo high-speed mode

    if (!title) {
      return NextResponse.json({ error: 'Song title is required for artwork generation' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY') {
      return NextResponse.json({ error: 'Supabase Service Role Key is not configured for storage upload' }, { status: 500 });
    }

    // Determine style-specific artistic guidance
    let styleGuidance = '';
    switch (style) {
      case 'pattachitra':
        styleGuidance = 'Aesthetic Style: Authentic Odisha Pattachitra folk art illustration. Elegant hand-painted clean lines, traditional temple border motifs, natural earthy mineral palette (terracotta, indigo, turmeric yellow, conch shell white). Cultural dignity without clutter.';
        break;
      case 'nature':
        styleGuidance = 'Aesthetic Style: Peaceful rural Odisha nature photography. Cinematic golden hour or quiet twilight, serene river ghat or village path, lush green landscape, peaceful water reflections, clean and contemplative.';
        break;
      case 'devotional':
        styleGuidance = 'Aesthetic Style: Sacred Odisha temple twilight. Majestic stone temple silhouette, warm golden clay diya oil lamp glow, quiet sanctum atmosphere, spiritual peace and reverent simplicity.';
        break;
      case 'poetic':
      default:
        styleGuidance = 'Aesthetic Style: Clean poetic album cover with a single compelling symbolic focal point. Warm cinematic lighting, elegant minimalist composition, soft blurred background, emotional depth, visually understandable at a single glance.';
        break;
    }

    // Step 1: Curated thematic prompt synthesis
    let englishImagePrompt = buildThematicFallbackPrompt(title, lyrics, style, customHint);

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Active and available models in Google AI Studio
        const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-flash-latest'];
        
        const llmPrompt = `
You are a master visual art director for Odia music album covers.
Analyze the song title and lyrics carefully to design a stunning, prominent, iconic text-to-image prompt.

Odia Song Title: "${title}"
Odia Lyrics Sample:
"${lyrics ? lyrics.slice(0, 800) : ''}"
${customHint ? `Artist Direction: "${customHint}"` : ''}

Aesthetic Style: ${style} (${styleGuidance})

Art Direction Rules:
1. Identify the SINGLE CENTRAL ICONIC SUBJECT directly mentioned or symbolized in the song (e.g. if the song is about "Sajana Gacha", depict a magnificent leafy Sajana moringa tree in a rustic village courtyard; if "Nanda Ghare Ananda", depict joyful baby Krishna in Yashoda's arms with golden earthen lamps; if "Kataka Dasahara", depict the majestic silver filigree Chandi Medha Durga idol).
2. The central subject must be PROMINENT, BOLD, and CLEARLY UNDERSTANDABLE at a single glance.
3. Rich cinematic lighting: warm golden hour, temple oil lamp glow, or morning mist.
4. Compose in 2 vivid English sentences describing the central subject, cultural details of Odisha, lighting, and composition.
5. STRICT AVOIDANCE: NO text, NO letters, NO words, NO collage, NO split screen, NO blurry objects, NO watermark.

Write ONLY the final English text-to-image prompt.
        `.trim();

        // 6.5s timeout gives Gemini plenty of time while preventing request hangs
        const geminiPromise = (async () => {
          for (const modelName of candidateModels) {
            try {
              const model = genAI.getGenerativeModel({ model: modelName });
              const result = await model.generateContent(llmPrompt);
              const text = result.response.text().trim();
              if (text && text.length > 20) {
                return text;
              }
            } catch {
              // try next model
            }
          }
          return null;
        })();

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6500));
        const fastestPrompt = await Promise.race([geminiPromise, timeoutPromise]);

        if (fastestPrompt) {
          englishImagePrompt = fastestPrompt;
        }
      } catch (llmError) {
        console.warn('Gemini text translation bypassed, using thematic fallback prompt:', llmError);
      }
    }

    // Step 2: Generate artwork using Pollinations with high-definition native models
    let imageBuffer: ArrayBuffer | null = null;
    const seed = Math.floor(Math.random() * 9999999);
    // Models to try in sequence: default free endpoint first, then sana, turbo, flux
    const candidateModels = isTurbo ? ['', 'sana', 'turbo', 'flux'] : ['', 'sana', 'flux', 'turbo'];
    const apiKeyParam = process.env.POLLINATIONS_API_KEY ? `&key=${process.env.POLLINATIONS_API_KEY}` : '';

    // Try primary and fallback models with 9-second individual timeouts
    for (const modelCandidate of candidateModels) {
      const pollUrl = modelCandidate
        ? `https://image.pollinations.ai/prompt/${encodeURIComponent(englishImagePrompt)}?model=${modelCandidate}&seed=${seed}${apiKeyParam}`
        : `https://image.pollinations.ai/prompt/${encodeURIComponent(englishImagePrompt)}?seed=${seed}${apiKeyParam}`;
      
      try {
        const imgRes = await fetch(pollUrl, {
          signal: AbortSignal.timeout(9000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          }
        });
        if (imgRes.status === 200) {
          const contentType = imgRes.headers.get('content-type') || '';
          if (contentType.includes('image')) {
            imageBuffer = await imgRes.arrayBuffer();
            break;
          }
        }
      } catch (err) {
        console.warn(`Attempt with ${modelCandidate || 'default'} failed/timed out, rotating...`);
      }
    }

    // Fast adaptive retry: Wait 2s if initial attempt hit temporary network congestion
    if (!imageBuffer) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const retryUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishImagePrompt)}?seed=${seed}${apiKeyParam}`;
      try {
        const retryRes = await fetch(retryUrl, {
          signal: AbortSignal.timeout(8000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          }
        });
        if (retryRes.status === 200) {
          imageBuffer = await retryRes.arrayBuffer();
        }
      } catch (retryErr) {
        console.error('Fallback retry error:', retryErr);
      }
    }

    if (!imageBuffer) {
      return NextResponse.json({
        error: 'AI image generator is cooling down. Please wait 10-15 seconds before regenerating, or upload your own image.'
      }, { status: 429 });
    }

    let finalBuffer = Buffer.from(imageBuffer);
    
    // Step 3: Trim only the tiny 20px edge watermark cleanly while preserving 100% of the artwork subject
    try {
      const metadata = await sharp(finalBuffer).metadata();
      if (metadata.width && metadata.height) {
        // Only trim 30 pixels (preserving 96%+ of the full scene, avoiding chopped subjects or pedestals)
        const cropHeight = Math.max(1, metadata.height - 30);
        finalBuffer = await sharp(finalBuffer)
          .extract({ width: metadata.width, height: cropHeight, left: 0, top: 0 })
          .jpeg({ quality: 88, mozjpeg: true })
          .toBuffer();
      } else {
        finalBuffer = await sharp(finalBuffer)
          .jpeg({ quality: 88, mozjpeg: true })
          .toBuffer();
      }
    } catch (cropError) {
      console.error('Sharp processing error, proceeding with original:', cropError);
    }

    // Step 4: Storage Hygiene - Delete previous orphaned artwork from Supabase Storage if regenerating
    if (previousUrl && previousUrl.includes('/song-artwork/')) {
      try {
        const urlParts = previousUrl.split('/song-artwork/');
        if (urlParts.length > 1) {
          const oldFileName = urlParts[1].split('?')[0];
          if (oldFileName) {
            await supabaseAdmin.storage.from('song-artwork').remove([oldFileName]);
          }
        }
      } catch (cleanupErr) {
        console.error('Failed to cleanup previous artwork:', cleanupErr);
      }
    }

    // Step 5: Upload optimized JPEG to Supabase Storage
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('song-artwork')
      .upload(fileName, finalBuffer, { contentType: 'image/jpeg', upsert: false });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: `Supabase Storage Upload Error: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage
      .from('song-artwork')
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      url: publicData.publicUrl,
      prompt: englishImagePrompt,
      durationMs: Date.now() - startTime,
    });
  } catch (err: any) {
    console.error('Unexpected artwork generation error:', err);
    return NextResponse.json({ error: `Internal server error: ${err.message}` }, { status: 500 });
  }
}
