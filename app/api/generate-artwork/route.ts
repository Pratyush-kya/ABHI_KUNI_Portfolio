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
    
    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY') {
      return NextResponse.json({ error: 'Supabase Service Role Key is not configured for storage upload' }, { status: 500 });
    }

    // Step 1: Use Gemini Text model to understand the Odia lyrics and generate a visual English prompt
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    
    const llmPrompt = `
You are an expert AI image prompt engineer. 
I am providing you with the title and lyrics of an Odia devotional/folk song. 
Since image generators do not understand Odia script, you must read the Odia text, understand its core spiritual, cultural, or emotional meaning (such as references to Lord Jagannath, Kalia, nature, devotion, or life philosophy), and write a highly descriptive visual prompt in ENGLISH.

Odia Title: "${title}"
Odia Lyrics: "${lyrics ? lyrics.slice(0, 400) : ''}..."

Write ONLY the english image generation prompt. Do not add any introductory text.
Make it visually stunning, culturally accurate to Odisha/India, and specify the style as "high quality, cinematic, highly detailed Indian painting aesthetic, vibrant colors". Do NOT include people's faces up close if it's anime-like, stick to traditional Indian art, silhouettes, or abstract spiritual concepts.
    `.trim();

    let englishImagePrompt = "Beautiful abstract modern Indian music artwork, vibrant saffron and gold colors, traditional Odisha cultural elements.";
    
    try {
      const result = await model.generateContent(llmPrompt);
      const generatedText = result.response.text().trim();
      if (generatedText && generatedText.length > 20) {
        englishImagePrompt = generatedText;
      }
    } catch (llmError) {
      console.error('Gemini text translation failed, using fallback prompt:', llmError);
    }

    // Step 2: Pass the translated English prompt to Pollinations
    let imageBuffer: ArrayBuffer;
    let mimeType = 'image/jpeg';
    
    try {
      const seed = Math.floor(Math.random() * 9999999);
      // Landscape aspect ratio (1280x720) looks much better on the song page
      const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishImagePrompt)}?width=1280&height=720&nologo=true&seed=${seed}`;
      
      const imgRes = await fetch(pollUrl);
      if (!imgRes.ok) throw new Error('Failed to fetch from free image generation API');
      imageBuffer = await imgRes.arrayBuffer();
      mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    } catch (genError: any) {
      console.error('Image generation fallback error:', genError);
      return NextResponse.json({ error: `AI Image API Error: ${genError.message}` }, { status: 500 });
    }

    const buffer = Buffer.from(imageBuffer);
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('song-artwork')
      .upload(fileName, buffer, { contentType: mimeType, upsert: false });

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
