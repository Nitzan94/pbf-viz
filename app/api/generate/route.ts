// ABOUTME: API route for Gemini image generation with PBF context
// ABOUTME: Handles generation, editing, and context injection

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { buildPromptWithContext } from '@/lib/context';

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      apiKey,
      includeContext = true,
      customContext,
      aspectRatio = '16:9',
      imageSize = '2K',
      editImage,
      referenceImage,
    } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }

    const clientAI = new GoogleGenerativeAI(apiKey);
    const model = clientAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
    });

    // Build prompt with optional context injection
    // When reference image provided, skip text context to avoid conflicts
    const shouldIncludeContext = includeContext && !referenceImage;
    const finalPrompt = buildPromptWithContext(prompt, shouldIncludeContext, customContext);

    // Build content parts
    const contents: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // Add reference/edit image first if provided
    if (editImage) {
      contents.push({ text: 'Edit this image based on the following instructions:' });
      const base64Data = editImage.split(',')[1];
      contents.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Data,
        },
      });
    } else if (referenceImage) {
      // Only process if it's a base64 data URL
      if (referenceImage.startsWith('data:')) {
        contents.push({ text: 'CRITICAL: Follow this architectural floor plan EXACTLY. Match the exact layout, position of tanks, walls, and structure shown in this blueprint:' });
        const mimeMatch = referenceImage.match(/data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        const base64Data = referenceImage.split(',')[1];
        contents.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }
      // Skip non-base64 URLs - they can't be sent to Gemini
    }

    // Add the prompt
    contents.push({ text: finalPrompt });

    // Generate image
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: contents }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio,
          imageSize,
        },
      },
    } as any);

    const response = result.response;
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    const parts = candidates[0].content.parts;
    let imageData = null;
    let textResponse = '';

    for (const part of parts) {
      if (part.text) {
        textResponse = part.text;
      }
      if (part.inlineData) {
        imageData = part.inlineData.data;
      }
    }

    if (!imageData) {
      return NextResponse.json({ error: 'No image in response' }, { status: 500 });
    }

    return NextResponse.json({
      image: `data:image/png;base64,${imageData}`,
      text: textResponse,
    });

  } catch (error: unknown) {
    console.error('Generation error:', error);
    let message = 'Failed to generate image';

    if (error instanceof Error) {
      message = error.message;
      if (message.includes('503') || message.toLowerCase().includes('overload')) {
        message = 'Gemini API is overloaded. Please try again in a few seconds.';
      } else if (message.includes('401') || message.toLowerCase().includes('invalid')) {
        message = 'Invalid API key. Please check your Gemini API key.';
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
