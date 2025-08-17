// OpenSea MCP Helper with improved integration
export async function connectOpenSeaMCP() {
  const url = process.env.OPENSEA_MCP_URL;
  const token = process.env.OPENSEA_MCP_TOKEN;
  
  if (!url || !token) {
    throw new Error("Missing OPENSEA_MCP_URL or OPENSEA_MCP_TOKEN");
  }

  console.log('OpenSea MCP URL:', url);
  console.log('Token configured:', !!token);

  // Test connection with a simple ping
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        id: 1,
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: 'opensea-chatbot',
            version: '1.0.0'
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('MCP Initialize Response:', result);
    
    return {
      success: true,
      serverInfo: result.result
    };
  } catch (error) {
    console.error('Failed to connect to OpenSea MCP:', error);
    throw error;
  }
}

export async function listOpenSeaTools() {
  const url = process.env.OPENSEA_MCP_URL;
  const token = process.env.OPENSEA_MCP_TOKEN;
  
  if (!url || !token) {
    throw new Error("Missing OPENSEA_MCP_URL or OPENSEA_MCP_TOKEN");
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 2,
        params: {}
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Available tools:', result);
    return result.result?.tools || [];
  } catch (error) {
    console.error('Failed to list tools:', error);
    throw error;
  }
}

export async function callOpenSeaTool(toolName: string, args: Record<string, any>) {
  const url = process.env.OPENSEA_MCP_URL;
  const token = process.env.OPENSEA_MCP_TOKEN;
  
  if (!url || !token) {
    throw new Error("Missing OPENSEA_MCP_URL or OPENSEA_MCP_TOKEN");
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 3,
        params: {
          name: toolName,
          arguments: args
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`MCP Error: ${result.error.message}`);
    }
    
    return result.result;
  } catch (error) {
    console.error(`Failed to call tool ${toolName}:`, error);
    throw error;
  }
} 