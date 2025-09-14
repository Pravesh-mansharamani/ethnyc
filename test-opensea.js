// Simple test script for OpenSea MCP
const { getOpenSeaMCPClient } = require('./lib/ai/mcp-client');

async function testOpenSeaMCP() {
  try {
    console.log('Testing OpenSea MCP integration...');
    
    // Check if environment variables are set
    const token = process.env.OPENSEA_MCP_TOKEN;
    if (!token) {
      console.error('OPENSEA_MCP_TOKEN environment variable is not set');
      return;
    }
    
    console.log('OpenSea MCP token is configured');
    
    const client = getOpenSeaMCPClient();
    console.log('OpenSea MCP client created');
    
    // Try to connect
    await client.connect();
    console.log('Successfully connected to OpenSea MCP');
    
    // List available tools
    const tools = await client.listTools();
    console.log('Available tools:', tools.map(t => t.name));
    
    // Test the get_token_balances tool with the address you provided
    const address = '0xc44Dd010C13F63B96d9457674db07a82Caf3E03e';
    console.log(`\nQuerying wallet: ${address}`);
    
    try {
      const result = await client.callTool('get_token_balances', { 
        address: address,
        chain: 'ethereum',
        include_nfts: true
      });
      
      console.log('\nWallet balance result:');
      console.log(JSON.stringify(result, null, 2));
      
      // Calculate total value if available
      if (result && result.tokens) {
        let totalValue = 0;
        result.tokens.forEach(token => {
          if (token.usd_value) {
            totalValue += parseFloat(token.usd_value);
          }
        });
        console.log(`\nTotal USD Value: $${totalValue.toFixed(2)}`);
      }
      
    } catch (toolError) {
      console.error('Tool call failed:', toolError.message);
    }
    
    await client.disconnect();
    console.log('\nDisconnected from OpenSea MCP');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testOpenSeaMCP(); 