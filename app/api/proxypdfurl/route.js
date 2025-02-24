// app/api/proxy/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

// URL validation helper function
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Configure cors headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Main GET handler
export async function GET(request) {
  try {
    // Get URL from searchParams
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'URL parameter is required and must be valid' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch PDF
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: { 'User-Agent': 'SecurePDFProxy/1.0' },
    });

    // Return PDF data with appropriate headers
    const headers = {
      ...corsHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Content-Length': response.data.length,
    };

    return new NextResponse(response.data, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Invalid or unreachable URL',
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Health check endpoint
export async function GET_health() {
  return NextResponse.json(
    { status: 'ok' },
    { status: 200, headers: corsHeaders }
  );
}
