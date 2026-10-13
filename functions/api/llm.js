// api/llm.js — Vercel Serverless Function
export default async function handler(req, res) {
  // CORS 头（允许所有来源，方便调试）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 预检
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只接受 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 检查 API Key
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is not configured',
      hint: '请在 Vercel 项目设置里配置环境变量 ZHIPU_API_KEY'
    });
  }

  // 转发到智谱
  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      error: 'Upstream request failed',
      detail: error.message
    });
  }
}