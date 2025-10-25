/**
 * Backend genérico que utiliza settings.json generado por la app (si existe)
 * para decidir a qué proveedor llamar (OpenAI o genérico).
 *
 * If no settings.json exists, it falls back to environment variables (.env).
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

function loadSettings() {
  // Try to load settings from Electron userData path if present
  const possible = [
    path.join(process.env.APPDATA || '', 'GhostAssist', 'settings.json'),
    path.join(process.env.HOME || '', '.config', 'ghostassist', 'settings.json'),
    path.join(__dirname, 'settings.json')
  ];
  for (const p of possible) {
    try {
      if (p && fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const s = JSON.parse(raw);
        return s;
      }
    } catch (e) { /* ignore */ }
  }
  // fallback to env
  return {
    provider: process.env.PROVIDER || 'generic',
    providerUrl: process.env.PROVIDER_URL || '',
    apiKey: process.env.API_KEY || '',
    model: process.env.OPENAI_MODEL || ''
  };
}

app.post('/api/ai', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  const settings = loadSettings();
  const provider = (settings.provider || 'generic').toLowerCase();
  const providerUrl = settings.providerUrl || process.env.PROVIDER_URL || '';
  const apiKey = settings.apiKey || process.env.API_KEY || '';

  if (!providerUrl || !apiKey) {
    return res.status(500).json({ error: 'Provider URL or API key not configured' });
  }

  try {
    if (provider === 'openai') {
      const body = {
        model: settings.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      };
      const r = await fetch(providerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || JSON.stringify(data);
      return res.json({ result: text });
    } else {
      // Generic provider expects { prompt } => { result }
      const r = await fetch(providerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ prompt })
      });
      const data = await r.json();
      const text = data?.result || data?.output || JSON.stringify(data);
      return res.json({ result: text });
    }
  } catch (err) {
    console.error('Error calling provider', err);
    return res.status(500).json({ error: 'Error calling provider', detail: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API escuchando en http://localhost:${PORT}`);
});
