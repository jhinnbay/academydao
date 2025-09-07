// Farcaster webhook handler for mini-app interactions
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Webhook received:', {
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    // Handle different webhook events
    if (req.method === 'POST') {
      const { type, data } = req.body || {};
      
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

      res.status(200).json({ 
        success: true, 
        message: 'Webhook received successfully',
        timestamp: new Date().toISOString()
      });
    } else if (req.method === 'GET') {
      // Health check endpoint
      res.status(200).json({ 
        status: 'healthy',
        service: 'Azura Webhook',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
