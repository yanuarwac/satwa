const RAPIDAPI_HOST = 'animals-by-api-ninjas.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const url = new URL(req.url, 'http://localhost');
  const animalName = url.searchParams.get('name')?.trim() || '';

  if (!animalName) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'Parameter name is required' }));
  }

  if (!RAPIDAPI_KEY) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: 'RAPIDAPI_KEY is not configured on the server.' }));
  }

  try {
    const upstreamUrl = `https://${RAPIDAPI_HOST}/v1/animals?name=${encodeURIComponent(animalName)}`;
    const apiResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    const data = await apiResponse.json();
    res.statusCode = apiResponse.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(data));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
  }
};
