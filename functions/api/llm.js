export async function onRequest(context) {
  console.log('[llm] 请求进入，method =', context.request.method);   // ⭐ 加这行
  const { request, env } = context;

  /* ---------- 1. CORS 预检 ---------- */
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  /* ---------- 2. 只接受 POST ---------- */
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  /* ---------- 3. 转发到智谱 ---------- */
  const body = await request.text();

  let response;
  try {
    response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.ZHIPU_API_KEY}`
      },
      body
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: '上游请求失败',
      detail: e.message
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}