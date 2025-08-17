import { NextResponse } from 'next/server';
import { getOpenSeaMCPClient } from '@/lib/ai/mcp-client';
import { connectOpenSeaMCP, listOpenSeaTools, callOpenSeaTool } from '@/lib/ai/opensea-mcp-helper';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Testing OpenSea MCP integration...');
    
    // Test 1: Check environment variables
    const hasUrl = !!process.env.OPENSEA_MCP_URL;
    const hasToken = !!process.env.OPENSEA_MCP_TOKEN;
    
    console.log('Environment check:', { hasUrl, hasToken });
    
    if (!hasUrl || !hasToken) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          hasUrl,
          hasToken,
          url: process.env.OPENSEA_MCP_URL ? 'configured' : 'missing',
          token: process.env.OPENSEA_MCP_TOKEN ? 'configured' : 'missing'
        }
      }, { status: 400 });
    }

    // Test 2: Try direct connection
    let connectionResult = null;
    try {
      connectionResult = await connectOpenSeaMCP();
      console.log('Direct connection successful:', connectionResult);
    } catch (error) {
      console.log('Direct connection failed:', error);
      connectionResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test 3: List tools
    let toolsResult = null;
    try {
      toolsResult = await listOpenSeaTools();
      console.log('Tools listing successful:', toolsResult);
    } catch (error) {
      console.log('Tools listing failed:', error);
      toolsResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test 4: Test tool call
    let toolCallResult = null;
    try {
      toolCallResult = await callOpenSeaTool('search', {
        query: 'ethereum',
        limit: 3
      });
      console.log('Tool call successful:', toolCallResult);
    } catch (error) {
      console.log('Tool call failed:', error);
      toolCallResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test 5: Test using the client wrapper
    let clientTestResult = null;
    try {
      const client = getOpenSeaMCPClient();
      await client.connect();
      const tools = await client.listTools();
      const searchResult = await client.callTool('search', { query: 'test', limit: 1 });
      await client.disconnect();
      
      clientTestResult = {
        tools: tools.length,
        searchResult: searchResult
      };
    } catch (error) {
      console.log('Client test failed:', error);
      clientTestResult = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return NextResponse.json({
      success: true,
      tests: {
        environment: { hasUrl, hasToken },
        connection: connectionResult,
        tools: toolsResult,
        toolCall: toolCallResult,
        clientTest: clientTestResult
      },
      message: 'OpenSea MCP integration test completed'
    });

  } catch (error) {
    console.error('OpenSea MCP test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'OpenSea MCP integration test failed'
    }, { status: 500 });
  }
} 