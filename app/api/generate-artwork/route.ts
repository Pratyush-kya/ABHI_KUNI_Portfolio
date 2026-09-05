import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { title, category } = await req.json();
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);

    // Build a culturally rich prompt for Odia music
    const categoryStyle: Record<string, string> = {
      ଗୀତ: 'modern Indian music artwork, vibrant colors, musical notes, abstract',
      ଭଜନ: 'devotional Indian painting style, temple, oil lamp (diya), lotus flowers, saffron colors, spiritual atmosphere',
      ଲୋକ: 'Odisha folk art style, rural village, nature, paddy fields, traditional Odia patterns, earthy tones',
    };
    const style = categoryStyle[category] ?? 'Odia cultural artwork, traditional Indian painting';
    const prompt = `Beautiful artwork for an Odia song titled "${title}". Style: ${style}. High quality, artistic, no text, no watermarks.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-preview-image-generation' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as never,
    });

    // Extract the image data
    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData);
    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    const { mimeType, data } = imagePart.inlineData;
    const buffer = Buffer.from(data, 'base64');
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('song-artwork')
      .upload(fileName, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage
      .from('song-artwork')
      .getPublicUrl(uploadData.path);

    return NextResponse.json({ url: publicData.publicUrl });
  } catch (err) {
    console.error('Artwork generation error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
