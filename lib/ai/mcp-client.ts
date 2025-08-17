import { randomUUID } from 'crypto';

export class OpenSeaMCPClient {
  private mcpUrl: string;
  private mcpToken: string;
  private requestId: number = 1;
  private sessionId: string | null = null;
  private initialized: boolean = false;
  private configValid: boolean = false;

  constructor() {
    this.mcpToken = process.env.OPENSEA_MCP_TOKEN || '';
    
    // Use OpenSea's recommended embedded token URL format
    // https://mcp.opensea.io/ACCESS_TOKEN/mcp
    if (this.mcpToken) {
      this.mcpUrl = `https://mcp.opensea.io/${this.mcpToken}/mcp`;
      this.configValid = true;
    } else {
      this.mcpUrl = '';
      this.configValid = false;
    }
    
    if (!this.configValid) {
      console.warn('OpenSea MCP token not configured - tools will be unavailable');
    }
  }

  private getHeaders(includeSessionId: boolean = true) {
    // No Authorization header needed when using embedded token URL
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };

    if (this.sessionId && includeSessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }

    return headers;
  }

  private parseSSEResponse(text: string, expectedId: number): any {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          if (data.id === expectedId) {
            return data;
          }
        } catch (parseError) {
          // Skip malformed JSON lines
        }
      }
    }
    return null;
  }

  async connect(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!this.configValid) {
      throw new Error('OpenSea MCP token not configured');
    }

    try {
      console.log('Initializing OpenSea MCP connection...');

      // Initialize the MCP connection WITHOUT session ID
      const response = await fetch(this.mcpUrl, {
        method: 'POST',
        headers: this.getHeaders(false), // Don't include session ID for initialization
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          id: this.requestId++,
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
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Extract session ID from response headers
      const sessionIdFromHeaders = response.headers.get('mcp-session-id');
      if (sessionIdFromHeaders) {
        this.sessionId = sessionIdFromHeaders;
        console.log('Extracted session ID from server:', this.sessionId);
      } else {
        console.warn('No session ID found in response headers');
      }

      // Handle the response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/event-stream')) {
        // Handle Server-Sent Events response
        const text = await response.text();
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.result && data.id === (this.requestId - 1)) {
                this.initialized = true;
                console.log('OpenSea MCP initialized successfully');
                return;
              }
              if (data.error) {
                throw new Error(`MCP Initialize Error: ${data.error.message}`);
              }
            } catch (parseError) {
              // Skip malformed JSON lines
            }
          }
        }
        // If we got here, assume initialization was successful
        this.initialized = true;
        console.log('OpenSea MCP initialized successfully (streaming)');
      } else {
        // Handle regular JSON response
        const result = await response.json();
        if (result.error) {
          throw new Error(`MCP Initialize Error: ${result.error.message}`);
        }
        this.initialized = true;
        console.log('OpenSea MCP initialized successfully');
      }
    } catch (error) {
      console.error('Failed to connect to OpenSea MCP:', error);
      this.sessionId = null;
      this.initialized = false;
      
      // Re-throw with more context for better debugging
      if (error instanceof Error) {
        throw new Error(`OpenSea MCP connection failed: ${error.message}`);
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.sessionId = null;
    this.initialized = false;
    return;
  }

  async listTools(): Promise<any[]> {
    if (!this.configValid) {
      return this.getKnownTools();
    }

    if (!this.initialized) {
      await this.connect();
    }

    try {
      const response = await fetch(this.mcpUrl, {
        method: 'POST',
        headers: this.getHeaders(), // Include session ID for tool listing
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          id: this.requestId++,
          params: {}
        }),
      });

      if (!response.ok) {
        console.warn(`Failed to list tools: HTTP ${response.status}`);
        return this.getKnownTools();
      }

      const result = await response.json();
      if (result.error) {
        console.warn(`Failed to list tools: ${result.error.message}`);
        return this.getKnownTools();
      }

      return result.result?.tools || this.getKnownTools();
    } catch (error) {
      console.error('Failed to list MCP tools:', error);
      return this.getKnownTools();
    }
  }

  private getKnownTools(): any[] {
    // Return known OpenSea MCP tools as fallback
    return [
      { name: 'search', description: 'Search OpenSea marketplace' },
      { name: 'fetch', description: 'Fetch entity details' },
      { name: 'search_collections', description: 'Search NFT collections' },
      { name: 'get_collection', description: 'Get collection details' },
      { name: 'search_items', description: 'Search NFT items' },
      { name: 'get_item', description: 'Get item details' },
      { name: 'search_tokens', description: 'Search tokens' },
      { name: 'get_token', description: 'Get token details' },
      { name: 'get_token_swap_quote', description: 'Get swap quote' },
      { name: 'get_token_balances', description: 'Get token balances' },
    ];
  }

  async callTool(name: string, arguments_?: Record<string, any>): Promise<any> {
    if (!this.configValid) {
      throw new Error('OpenSea MCP not configured');
    }

    // Ensure we're connected
    if (!this.initialized) {
      await this.connect();
    }

    try {
      const requestId = this.requestId++;
      const response = await fetch(this.mcpUrl, {
        method: 'POST',
        headers: this.getHeaders(), // Include session ID for tool calls
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          id: requestId,
          params: {
            name: name,
            arguments: arguments_ || {}
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/event-stream')) {
        // Handle Server-Sent Events response
        const text = await response.text();
        const data = this.parseSSEResponse(text, requestId);
        
        if (data) {
          if (data.error) {
            throw new Error(`MCP Tool Error: ${data.error.message}`);
          }
          return data.result;
        } else {
          throw new Error('No valid response found in SSE stream');
        }
      } else {
        // Handle regular JSON response
        const result = await response.json();
        
        if (result.error) {
          throw new Error(`MCP Tool Error: ${result.error.message}`);
        }

        return result.result;
      }
    } catch (error) {
      console.error(`Failed to call MCP tool ${name}:`, error);
      throw error;
    }
  }
}

// Global instance
let openSeaMCPClient: OpenSeaMCPClient | null = null;

export function getOpenSeaMCPClient(): OpenSeaMCPClient {
  if (!openSeaMCPClient) {
    openSeaMCPClient = new OpenSeaMCPClient();
  }
  return openSeaMCPClient;
}