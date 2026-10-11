import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Security Guard: Only authenticated admins may invoke AI artwork generation
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 150) : '';
    const lyrics = typeof body.lyrics === 'string' ? body.lyrics.trim().slice(0, 4000) : '';
    const style = typeof body.style === 'string' ? body.style.trim() : 'poetic';
    const customHint = typeof body.customHint === 'string' ? body.customHint.trim().slice(0, 200) : '';
    const previousUrl = typeof body.previousUrl === 'string' ? body.previousUrl.trim() : '';

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

    // Step 1: Use Gemini to deeply understand the Odia lyrics and generate a simple, meaningful visual concept
    const apiKey = process.env.GEMINI_API_KEY;
    let englishImagePrompt = "A serene earthen oil lamp glowing peacefully on traditional stone at twilight, warm golden light, minimalist cinematic composition, clean and elegant spiritual aesthetic.";

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use the current active Gemini 3.8 Flash model
        const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
        
        const llmPrompt = `
You are an expert art director creating an album cover art design for an Odia song.
Read the song title and lyrics carefully. Understand its core emotional soul, philosophical meaning, or story.

Odia Title: "${title}"
Odia Lyrics Excerpt:
"${lyrics ? lyrics.slice(0, 600) : ''}..."
${customHint ? `Additional Creative Direction from Artist: "${customHint}"` : ''}

${styleGuidance}

Instructions:
1. Identify the SINGLE most meaningful physical visual metaphor or subject that tells the story of this song (for example: a lone earthen lamp in the breeze, a weathered boat resting on a calm riverbank, gentle working hands, footprints disappearing in coastal sand, sacred temple stairs at dawn).
2. Keep the scene SIMPLE, FOCUSED, and IMMEDIATELY UNDERSTANDABLE. Do not clutter the image with too many elements.
3. Describe the scene in 2-3 concise English sentences specifying the central subject, lighting, mood, and clean composition.
4. Hard Negative Constraints: NO text, NO letters, NO words, NO collage, NO chaotic crowd, NO distorted figures, NO cluttered background, NO watermarks.

Write ONLY the final English image generation prompt. No introductory or explanatory text.
        `.trim();

        const result = await model.generateContent(llmPrompt);
        const generatedText = result.response.text().trim();
        if (generatedText && generatedText.length > 20) {
          englishImagePrompt = generatedText;
        }
      } catch (llmError) {
        console.error('Gemini text translation failed, using fallback prompt:', llmError);
      }
    }

    // Step 2: Generate artwork using Pollinations with FLUX model and fallback models
    let imageBuffer: ArrayBuffer | null = null;
    const seed = Math.floor(Math.random() * 9999999);
    const candidateModels = ['flux', 'sana', 'turbo'];

    // Try primary and fallback models
    for (const modelCandidate of candidateModels) {
      const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishImagePrompt)}?width=1280&height=720&seed=${seed}&model=${modelCandidate}`;
      
      try {
        const imgRes = await fetch(pollUrl);
        if (imgRes.status === 200) {
          const contentType = imgRes.headers.get('content-type') || '';
          if (contentType.includes('image')) {
            imageBuffer = await imgRes.arrayBuffer();
            break;
          }
        }
      } catch (err) {
        console.warn(`Failed with model ${modelCandidate}:`, err);
      }
    }

    // If candidate models returned 402/rate-limited, wait 10s and retry with flux
    if (!imageBuffer) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const retryUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishImagePrompt)}?width=1280&height=720&seed=${seed}&model=flux`;
      try {
        const retryRes = await fetch(retryUrl);
        if (retryRes.status === 200) {
          imageBuffer = await retryRes.arrayBuffer();
        }
      } catch (retryErr) {
        console.error('Retry error:', retryErr);
      }
    }

    if (!imageBuffer) {
      return NextResponse.json({
        error: 'AI image generator is cooling down. Please wait 20-25 seconds before regenerating, or upload your own image.'
      }, { status: 429 });
    }

    let finalBuffer = Buffer.from(imageBuffer);
    
    // Step 3: Crop Pollinations watermark at the bottom and convert to high-quality JPEG using sharp
    try {
      const metadata = await sharp(finalBuffer).metadata();
      if (metadata.width && metadata.height) {
        const cropHeight = Math.max(1, metadata.height - 65);
        finalBuffer = await sharp(finalBuffer)
          .extract({ width: metadata.width, height: cropHeight, left: 0, top: 0 })
          .jpeg({ quality: 86, mozjpeg: true })
          .toBuffer();
      } else {
        finalBuffer = await sharp(finalBuffer)
          .jpeg({ quality: 86, mozjpeg: true })
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
    });
  } catch (err: any) {
    console.error('Unexpected artwork generation error:', err);
    return NextResponse.json({ error: `Internal server error: ${err.message}` }, { status: 500 });
  }
}
