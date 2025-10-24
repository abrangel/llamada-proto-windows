const statusEl = document.getElementById('status');
const responseEl = document.getElementById('response');
const sendBtn = document.getElementById('sendBtn');
const promptInput = document.getElementById('prompt');
const hideBtn = document.getElementById('hideBtn');

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');

const providerSelect = document.getElementById('providerSelect');
const providerUrl = document.getElementById('providerUrl');
const apiKey = document.getElementById('apiKey');
const modelInput = document.getElementById('model');

let SETTINGS = null;

hideBtn.addEventListener('click', () => {
  window.close?.();
});

window.electronAPI.onShowResponse((data) => {
  showResponse(data.text || 'Respuesta demo desde main');
});

settingsBtn.addEventListener('click', async () => {
  // load settings from main
  const r = await window.electronAPI.loadSettings();
  if (r.ok && r.settings) {
    SETTINGS = r.settings;
    providerSelect.value = SETTINGS.provider || 'generic';
    providerUrl.value = SETTINGS.providerUrl || '';
    apiKey.value = SETTINGS.apiKey || '';
    modelInput.value = SETTINGS.model || '';
  }
  settingsModal.classList.remove('hidden');
});

closeSettings.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

saveSettings.addEventListener('click', async () => {
  const s = {
    provider: providerSelect.value,
    providerUrl: providerUrl.value,
    apiKey: apiKey.value,
    model: modelInput.value
  };
  const r = await window.electronAPI.saveSettings(s);
  if (r.ok) {
    SETTINGS = s;
    statusEl.textContent = 'Ajustes guardados';
    settingsModal.classList.add('hidden');
  } else {
    statusEl.textContent = 'Error guardando ajustes';
  }
});

// Demo: sending prompt to local backend which reads settings.json for provider details
sendBtn.addEventListener('click', async () => {
  const text = promptInput.value.trim();
  if (!text) return;
  statusEl.textContent = 'Generando respuesta...';

  try {
    const res = await fetch('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text })
    });
    const json = await res.json();
    const aiText = json.result || json.error || 'Sin respuesta';
    showResponse(aiText);
    statusEl.textContent = 'Sugerencia recibida';
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error conectando al backend';
  }
});

function showResponse(text) {
  responseEl.textContent = text;
  responseEl.classList.remove('hidden');
  responseEl.animate([
    { transform: 'translateY(-10px)', opacity: 0 },
    { transform: 'translateY(0px)', opacity: 1 }
  ], { duration: 350, easing: 'cubic-bezier(.2,.9,.2,1)' });
}
