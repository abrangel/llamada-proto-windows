# Cluely-style Prototype (Generic Provider) - Windows-ready (with Win32 helper & installer)

This updated repository includes:
- Win32 native helper (via ffi-napi) to call SetWindowDisplayAffinity for better screen-capture exclusion on Windows.
- Settings modal in the app to select provider (OpenAI or Generic) and store settings.
- Backend will read settings.json (if present) and call the configured provider.
- electron-builder config to create a Windows installer (NSIS).

## Important notes about native calls
- The module `ffi-napi` + `ref-napi` is used to call `user32.dll`.
- Building native modules may require Windows build tools (Python 3, Visual Studio Build Tools). If you get errors installing, run:
  - `npm install --global --production windows-build-tools` (or install via Visual Studio Installer).
- The helper uses `WDA_MONITOR (1)` affinity which is widely supported. You can experiment with affinity flags.

## How to use
1. Install dependencies:
   ```
   npm install
   ```
   Note: on Windows you may need additional build tools for `ffi-napi`/`ref-napi`.

2. Start the local backend:
   ```
   npm run server
   ```

3. Start the app:
   ```
   npm start
   ```

4. Open Settings (⚙) in the overlay:
   - Choose provider (OpenAI).
   - Fill `Provider URL` (for OpenAI: `https://api.openai.com/v1/chat/completions`)
   - Paste API key (`sk-...`)
   - Optionally set model (e.g. `gpt-4o-mini`)
   - Click `Guardar`.

5. To build an installer:
   ```
   npm run dist
   ```
   The NSIS installer will be produced (requires electron-builder prerequisites).

## Security
- Do not commit API keys to public repos. The app stores settings in the user's data directory.
- This is a prototype — test carefully before production.

