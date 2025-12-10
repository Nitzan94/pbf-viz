// ABOUTME: Streaming chat API route for Gemini Pro 3
// ABOUTME: Agent-native architecture - receives 3 contexts, builds dynamic system prompt

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';
import { buildChatSystemPrompt } from '@/lib/prompts';
import {
  DEFAULT_FACILITY_SPECS,
  DEFAULT_DESIGN_GUIDELINES,
  DEFAULT_COMPANY_CONTEXT,
} from '@/lib/context';

export async function POST(request: NextRequest) {
  try {
    const { messages, apiKey, facilitySpecs, designGuidelines, companyContext } = await request.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt with all 3 contexts (use defaults if not provided)
    const systemPrompt = buildChatSystemPrompt(
      facilitySpecs || DEFAULT_FACILITY_SPECS,
      designGuidelines || DEFAULT_DESIGN_GUIDELINES,
      companyContext || DEFAULT_COMPANY_CONTEXT
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview',
      systemInstruction: systemPrompt,
    });

    // Convert messages to Gemini format, filtering out leading assistant messages
    // Gemini requires first message to be from user
    const allMessages = messages.slice(0, -1);

    // Find first user message index
    const firstUserIdx = allMessages.findIndex((msg: { role: string }) => msg.role === 'user');
    const validMessages = firstUserIdx >= 0 ? allMessages.slice(firstUserIdx) : [];

    const history = validMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });

    // Stream response
    const result = await chat.sendMessageStream(lastMessage.content);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Stream error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('Chat error:', error);
    let message = 'Failed to process chat';

    if (error instanceof Error) {
      message = error.message;
      if (message.includes('503') || message.toLowerCase().includes('overload')) {
        message = 'Gemini API is overloaded. Please try again.';
      } else if (message.includes('401') || message.toLowerCase().includes('invalid')) {
        message = 'Invalid API key.';
      }
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
