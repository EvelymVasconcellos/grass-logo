// Página privada: tudo (site e arquivos) só abre depois do código de acesso.
// O código vem da variável de ambiente ACCESS_CODE do Cloudflare Pages (padrão: GRASS2026).
// Maiúsculas e minúsculas não fazem diferença.

const COOKIE = 'grass_delivery'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 dias

const norm = (s) => String(s || '').trim().toUpperCase()

async function token(env) {
  const code = norm(env.ACCESS_CODE || 'GRASS2026')
  const salt = env.SESSION_SECRET || 'grass-brand-delivery'
  const data = new TextEncoder().encode(code + '|' + salt)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function readCookie(request) {
  const raw = request.headers.get('Cookie') || ''
  const m = raw.match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'))
  return m ? m[1] : null
}

function gate(error) {
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow"><title>Entrega privada da marca · EV</title>
<link rel="icon" type="image/webp" href="/brand/ev-mark.webp">
<style>
@font-face{font-family:SG;font-weight:400;src:url(/fonts/space-grotesk-400.woff2) format("woff2")}
@font-face{font-family:SG;font-weight:600;src:url(/fonts/space-grotesk-600.woff2) format("woff2")}
@font-face{font-family:JM;font-weight:400;src:url(/fonts/jetbrains-mono-400.woff2) format("woff2")}
*{box-sizing:border-box;margin:0}
body{min-height:100vh;display:grid;place-items:center;padding:24px;background:#14120f radial-gradient(ellipse at top,rgba(255,138,78,.14),transparent 60%);color:#fff;font-family:SG,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{width:100%;max-width:440px;border:1px solid #ffffff14;border-radius:24px;background:#1b1815cc;padding:36px 32px}
img{height:34px;width:auto}
.k{margin-top:22px;font:11px/1.4 JM,monospace;letter-spacing:.2em;text-transform:uppercase;color:#ff8a4e}
h1{margin-top:10px;font-size:30px;line-height:1.12;font-weight:600;letter-spacing:-.02em}
p.t{margin-top:12px;color:#a8a296;line-height:1.55}
label{display:block;margin-top:26px;font-size:14px;font-weight:600}
input{margin-top:8px;width:100%;height:48px;border-radius:12px;border:1px solid #ffffff26;background:#0d0c0a;color:#fff;padding:0 14px;font:16px JM,monospace;letter-spacing:.08em}
input:focus{outline:2px solid #ff8a4e;outline-offset:2px}
button{margin-top:16px;width:100%;height:48px;border:0;border-radius:999px;background:#ff8a4e;color:#16110c;font:600 15px SG,system-ui,sans-serif;cursor:pointer}
button:hover{background:#ff9d6a}
.e{margin-top:14px;border-radius:12px;border:1px solid #f8717166;background:#f871711a;color:#fecaca;padding:10px 12px;font-size:14px}
.h{margin-top:22px;font-size:12px;color:#7a7469}
</style></head>
<body><main>
<img src="/brand/ev-mark.webp" alt="EV" width="196" height="113">
<p class="k">Entrega privada da marca</p>
<h1>Boas-vindas à entrega da sua identidade visual.</h1>
<p class="t">Esta página é privada. Digite o código de acesso que a EV enviou para continuar. Maiúsculas e minúsculas não fazem diferença.</p>
<form method="POST" action="/__access">
<label for="code">Código de acesso</label>
<input id="code" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" required autofocus aria-invalid="${error ? 'true' : 'false'}"${error ? ' aria-describedby="err"' : ''}>
${error ? '<p class="e" id="err" role="alert">Código incorreto. Confira e tente de novo.</p>' : ''}
<button type="submit">Abrir minha entrega</button>
</form>
<p class="h">Precisa de ajuda? Fale com a EV | Design, Technology &amp; Digital Solutions.</p>
</main></body></html>`
  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  })
}

const PUBLIC = /^\/(fonts\/|brand\/ev-mark\.webp$)/ // só o necessário para desenhar a tela de acesso

export async function onRequest(context) {
  const { request, env, next } = context
  const url = new URL(request.url)
  const expected = await token(env)

  if (url.pathname === '/__access' && request.method === 'POST') {
    const form = await request.formData()
    if (norm(form.get('code')) === norm(env.ACCESS_CODE || 'GRASS2026')) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: '/',
          'Set-Cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
          'Cache-Control': 'no-store',
        },
      })
    }
    return gate(true)
  }

  if (PUBLIC.test(url.pathname) || readCookie(request) === expected) {
    const res = await next()
    const out = new Response(res.body, res)
    out.headers.set('X-Robots-Tag', 'noindex')
    if (!PUBLIC.test(url.pathname)) out.headers.set('Cache-Control', 'private, no-store')
    return out
  }
  return gate(false)
}
