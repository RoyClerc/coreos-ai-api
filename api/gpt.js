// api/gpt.js

export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    console.log('🔍 Prompt received:', prompt);
    console.log('🔑 Using API key:', process.env.OPENAI_API_KEY ? 'YES' : 'MISSING');

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      console.error('❌ OpenAI Error:', data);
      return res.status(openaiRes.status).json({ error: data });
    }

    return res.status(200).json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error('💥 Server Crash:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
