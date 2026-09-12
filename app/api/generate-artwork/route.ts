import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { title, lyrics } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'Song title is required for artwork generation' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY') {
      return NextResponse.json({ error: 'Supabase Service Role Key is not configured for storage upload' }, { status: 500 });
    }

    if (!hfApiKey) {
      return NextResponse.json({ error: 'HUGGINGFACE_API_KEY is not configured' }, { status: 500 });
    }

    // Step 1: Use Gemini Text model to understand the Odia lyrics and generate a visual English prompt
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    
    const llmPrompt = `
You are an expert AI image prompt engineer creating stunning, high-definition (HD) album cover art/poster designs for Odia devotional or folk songs.
I am providing you with the title and lyrics of a song.
Read the Odia text, understand its core spiritual, cultural, or emotional meaning, and write a highly descriptive, visually breathtaking prompt in ENGLISH.

Odia Title: "${title}"
Odia Lyrics: "${lyrics ? lyrics.slice(0, 500) : ''}..."

Write ONLY the english image generation prompt. Do not add any introductory text.
Requirements:
1. Make it incredibly beautiful, photorealistic, HD poster quality.
2. Deeply link the visual elements directly to the specific meaning of the title and lyrics.
3. Include dynamic lighting, vibrant colors, cinematic composition.
4. Culturally accurate to Odisha/India but with a modern, highly attractive aesthetic to captivate viewers immediately.
5. If it's a devotional song, depict the divine elements beautifully and respectfully without making it look like a cheap cartoon. Use surreal, majestic, and glowing aesthetics.
    `.trim();

    let englishImagePrompt = "A breathtaking, ultra-HD cinematic poster of Indian spirituality, golden hour lighting, highly detailed traditional Indian aesthetic, glowing particles, 8k resolution, masterpiece.";
    
    try {
      const result = await model.generateContent(llmPrompt);
      const generatedText = result.response.text().trim();
      if (generatedText && generatedText.length > 20) {
        englishImagePrompt = generatedText;
      }
    } catch (llmError) {
      console.error('Gemini text translation failed, using fallback prompt:', llmError);
    }

    // Step 2: Generate HD image via Hugging Face Inference API (FLUX.1-schnell)
    let imageBuffer: ArrayBuffer;
    
    try {
      const hfRes = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: englishImagePrompt,
          parameters: {
            width: 1280,
            height: 720
          }
        })
      });
      
      if (!hfRes.ok) {
        const errText = await hfRes.text();
        throw new Error(`Hugging Face API failed: ${hfRes.status} ${errText}`);
      }
      
      imageBuffer = await hfRes.arrayBuffer();
    } catch (genError: any) {
      console.error('Image generation error:', genError);
      return NextResponse.json({ error: `AI Image API Error: ${genError.message}` }, { status: 500 });
    }

    const finalBuffer = Buffer.from(imageBuffer);
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

    return NextResponse.json({ url: publicData.publicUrl });
  } catch (err: any) {
    console.error('Unexpected artwork generation error:', err);
    return NextResponse.json({ error: `Internal server error: ${err.message}` }, { status: 500 });
  }
}
