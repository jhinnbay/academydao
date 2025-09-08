// Farcaster webhook handler for mini-app interactions
export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    console.log('Webhook received:', {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body
    });

    // Handle different webhook events
    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { type, data } = body;
      
      switch (type) {
        case 'user_joined':
          console.log('User joined mini-app:', data);
          break;
        case 'user_left':
          console.log('User left mini-app:', data);
          break;
        case 'interaction':
          console.log('User interaction:', data);
          break;
        default:
          console.log('Unknown webhook event:', type, data);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Webhook received successfully',
          timestamp: new Date().toISOString()
        }),
      };
    } else if (event.httpMethod === 'GET') {
      // Health check endpoint
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          status: 'healthy',
          service: 'Azura Webhook',
          timestamp: new Date().toISOString()
        }),
      };
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};
