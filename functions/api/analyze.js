/**
 * ============================================================================
 * CLOUDFLARE PAGES FUNCTION — /api/analyze
 * Executa verificação com Inteligência Artificial no Cloudflare (Workers AI
 * ou Google Gemini via variável de ambiente GEMINI_API_KEY).
 * ============================================================================
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const text = (body.text || '').trim().slice(0, 2500);
    const category = body.category || 'auto';
    const channel = body.channel || 'Qualquer canal';
    const heuristicScore = typeof body.heuristicScore === 'number' ? body.heuristicScore : 50;

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Texto vazio para análise.' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const systemPrompt = `Você é o motor de IA de cibersegurança do aplicativo brasileiro "Escudo Digital".
Sua missão é proteger cidadãos contra golpes de PIX, links falsos (phishing), arquivos com vírus (.apk, .exe), falsas centrais de banco, falsos parentes no WhatsApp e lojas falsas no Instagram.
Responda SEMPRE em JSON puro com o formato:
{
  "riskScore": 0 a 100,
  "aiVerdict": "Explicação curta, acolhedora e direta em português (máximo 3 frases) explicando o risco encontrado.",
  "extraTip": {
    "title": "Título curto da recomendação principal",
    "desc": "Orientação prática do que a pessoa deve fazer agora para não cair no golpe."
  }
}`;

    const userPrompt = `Canal: ${channel} | Categoria: ${category} | Score Heurístico Preliminar: ${heuristicScore}%
Conteúdo informado pelo usuário:
"""
${text}
"""`;

    // 1. Se houver binding do Cloudflare Workers AI (env.AI) configurado no painel do Cloudflare
    if (context.env && context.env.AI) {
      const aiResp = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 350,
        temperature: 0.2
      });

      const rawText = aiResp?.response || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify({
            riskScore: parsed.riskScore,
            aiVerdict: parsed.aiVerdict,
            extraTip: parsed.extraTip,
            engine: 'Cloudflare Workers AI (Llama 3.1)'
          }),
          { status: 200, headers: CORS_HEADERS }
        );
      }
    }

    // 2. Se houver GEMINI_API_KEY nas variáveis de ambiente do Cloudflare Pages
    if (context.env && context.env.GEMINI_API_KEY) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${context.env.GEMINI_API_KEY}`;
      const gRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
        })
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        const replyText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          const parsed = JSON.parse(replyText);
          return new Response(
            JSON.stringify({
              riskScore: parsed.riskScore,
              aiVerdict: parsed.aiVerdict,
              extraTip: parsed.extraTip,
              engine: 'Cloudflare Edge + Google Gemini AI'
            }),
            { status: 200, headers: CORS_HEADERS }
          );
        }
      }
    }

    // 3. Resposta Edge Inteligente quando nenhum binding externo estiver ativo
    return new Response(
      JSON.stringify({
        riskScore: heuristicScore,
        aiVerdict: null,
        engine: 'Cloudflare Edge Heuristic Engine'
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Falha ao processar requisição na Edge Function.' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
