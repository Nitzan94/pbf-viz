// ABOUTME: API route for reading and writing specification documents
// ABOUTME: Handles GET (read) and PUT (write) operations for facility specs, company context, and AI context

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DOCS = {
  facility: {
    path: path.join(process.cwd(), '..', 'pbf_facility_spec.md'),
    name: 'Facility Specification (Hebrew)',
  },
  company: {
    path: path.join(process.cwd(), '..', '..', 'PBF_COMPANY_CONTEXT.md'),
    name: 'Company Context (English)',
  },
  context: {
    path: path.join(process.cwd(), 'lib', 'context.ts'),
    name: 'AI Generation Context (Code)',
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const docId = searchParams.get('doc');

  if (!docId || !DOCS[docId as keyof typeof DOCS]) {
    return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
  }

  const doc = DOCS[docId as keyof typeof DOCS];

  try {
    const content = await fs.readFile(doc.path, 'utf-8');
    return NextResponse.json({ content, name: doc.name });
  } catch (error) {
    console.error(`Error reading ${doc.name}:`, error);
    return NextResponse.json({ error: `Failed to read ${doc.name}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const docId = searchParams.get('doc');

  if (!docId || !DOCS[docId as keyof typeof DOCS]) {
    return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
  }

  const doc = DOCS[docId as keyof typeof DOCS];

  try {
    const { content } = await request.json();

    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Content must be a string' }, { status: 400 });
    }

    await fs.writeFile(doc.path, content, 'utf-8');
    return NextResponse.json({ success: true, message: `${doc.name} saved successfully` });
  } catch (error) {
    console.error(`Error writing ${doc.name}:`, error);
    return NextResponse.json({ error: `Failed to save ${doc.name}` }, { status: 500 });
  }
}
