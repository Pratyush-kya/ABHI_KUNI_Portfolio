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
You are an expert AI image prompt engineer creating stunning, high-definition (HD) album cover art/poster designs for Odia devotional or folk songs.
I am providing you with the title and lyrics of a song.
Read the Odia text, understand its core spiritual, cultural, or emotional meaning, and write a highly descriptive, visually breathtaking prompt in ENGLISH.

Odia Title: "${title}"
Odia Lyrics: "${lyrics ? lyrics.slice(0, 500) : ''}..."

Write ONLY the english image generation prompt. Do not add any introductory text.
Requirements:
1. Make it incredibly beautiful, photorealistic, HD poster quality (8k resolution style).
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

    // Step 2: Pass the translated English prompt to Pollinations
    let imageBuffer: ArrayBuffer;
    let mimeType = 'image/jpeg';
    
    try {
      const seed = Math.floor(Math.random() * 9999999);
      // Generate HD landscape poster (1920x1080) using the 'flux' model for incredible quality
      const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishImagePrompt)}?width=1920&height=1080&nologo=true&seed=${seed}&model=flux`;
      
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
