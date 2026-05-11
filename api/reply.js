export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { review, stars, name, tone } = req.body;

  const toneGuide = {
    'Warm & Friendly': 'warm, friendly and personal',
    'Professional': 'professional and polished',
    'Apologetic': 'sincere and apologetic',
    'Enthusiastic': 'enthusiastic and energetic'
  };

  const nameText = name ? `The reviewer's name is ${name}.` : '';
  const toneText = toneGuide[tone] || 'warm and friendly';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: `You are a warm, friendly reply assistant for Cake o'clock, a boutique fresh cream cake shop in Launceston, Tasmania, Australia. Write genuine, human, concise Google review replies (2-5 sentences). Reference specific details from the review. If a reviewer name is provided, address them by name. Be ${toneText}. Sign off with "Cake o'clock Team". No corporate language. Occasional emoji OK. Output reply text only.`,
      messages: [{ role: 'user', content: `${stars}-star review. ${nameText}\n\nReview: "${review}"` }]
    })
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  res.status(200).json({ reply: text });
}
