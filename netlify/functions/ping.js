// Netlify function for ping endpoint
export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const ping = process.env.PING_MESSAGE ?? "ping";
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: ping }),
  };
};
