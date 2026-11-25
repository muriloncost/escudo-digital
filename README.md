# 🛡️ Escudo Digital — Detector Inteligente de Golpes & Vírus

Aplicação web **mobile-first** (otimizada para celular e computador) que analisa **links suspeitos, arquivos maliciosos (`.apk`, `.exe`), conversas de WhatsApp/SMS, perfis/lojas em redes sociais e cobranças via PIX**, calculando o risco de golpe e oferecendo dicas práticas e personalizadas de prevenção.

Projetada para rodar simultaneamente no **GitHub Pages** e no **Cloudflare Pages / Workers**.

---

## ✨ Funcionalidades Principais

1. **Análise Multi-Canal Completa**:
   - 🔗 **Links, Sites e Arquivos**: Detecta falsificação de marcas famosas (bancos, Correios, Gov.br, grandes varejistas), domínios descartáveis (`.xyz`, `.top`, `.click`, `.site`), encurtadores ocultos, conexões sem HTTPS e downloads de vírus/trojans bancários (`.apk`, `.exe`, `.scr`, `.bat`).
   - 💬 **Conversas e Mensagens (WhatsApp, SMS, E-mail)**: Identifica engenharia social, *"Oi mãe, troquei de número"*, falsa central de segurança de banco, roubo de código de 6 dígitos (clonagem de WhatsApp), falsa taxa alfandegária e acesso remoto (AnyDesk/TeamViewer).
   - 🛍️ **Perfil / Loja em Redes Sociais (Instagram, TikTok, Marketplace)**: Avalia sinais de lojas fantasmas (preços irreais, pagamento exclusivo via PIX antecipado, comentários bloqueados, ausência de CNPJ).
   - 💸 **PIX, Boletos e Renda Extra**: Detecta esquemas de *"tarefas remuneradas / curtir vídeos"*, *"Robô/Urubu do PIX"* e inspeciona payloads de PIX Copia e Cola.
2. **Motor Duplo (Heurística Local + Inteligência Artificial)**:
   - Funciona 100% offline/estático no navegador (ideal para GitHub Pages).
   - Integra função serverless `functions/api/analyze.js` para rodar **Cloudflare Workers AI** (`@cf/meta/llama-3.1-8b-instruct`) ou **Google Gemini API** na borda da Cloudflare.
   - Permite também inserir uma chave gratuita do **Google Gemini** direto na interface.
3. **Prevenção e Resposta a Incidentes**:
   - Gera recomendações práticas personalizadas para cada tipo de ameaça.
   - Botão de **Alertar Alguém no WhatsApp** (ótimo para avisar familiares sobre um golpe).
   - Guia de emergência passo a passo (como acionar o **MED - Mecanismo Especial de Devolução do PIX** no Banco Central).

---

## 🚀 Como Hospedar no GitHub Pages

1. Crie um repositório no GitHub (ex: `escudo-digital`) e envie todos os arquivos desta pasta:
   ```bash
   git init
   git add .
   git commit -m "feat: Escudo Digital anti-golpes"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/escudo-digital.git
   git push -u origin main
   ```
2. No GitHub, acesse **Settings → Pages**.
3. Em **Build and deployment → Source**, selecione **GitHub Actions** (o workflow `.github/workflows/deploy-github-pages.yml` fará o deploy automaticamente) ou selecione **Deploy from a branch** (`main` / `/(root)`).
4. Seu app ficará disponível em: `https://SEU_USUARIO.github.io/escudo-digital/`

---

## ☁️ Como Hospedar no Cloudflare Pages (com IA)

### Opção 1: Conectando o mesmo repositório GitHub (Recomendado)
1. Acesse o painel da [Cloudflare](https://dash.cloudflare.com/) e vá em **Workers & Pages → Create → Pages → Connect to Git**.
2. Selecione o repositório `escudo-digital`.
3. Em **Build settings**, deixe:
   - **Build command**: *(vazio)*
   - **Build output directory**: `.` (ou `/`)
4. Clique em **Save and Deploy**. O Cloudflare detectará automaticamente a pasta `functions/api/analyze.js` e ativará o endpoint `/api/analyze`!
5. *(Opcional — Ativar IA na Cloudflare)*:
   - Vá em **Settings → Functions → Workers AI Bindings** e adicione um binding chamado `AI`, **ou**
   - Vá em **Settings → Environment variables** e adicione `GEMINI_API_KEY` com sua chave do Google Gemini.

### Opção 2: Deploy direto via terminal com Wrangler
```bash
npx wrangler pages deploy . --project-name=escudo-digital
```
