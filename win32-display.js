/*
 Windows display affinity helper using ffi-napi.
 This attempts to call SetWindowDisplayAffinity to reduce the chance
 the Electron window is captured by screen capture utilities.

 Notes:
 - Requires 'ffi-napi' and 'ref-napi'.
 - getNativeWindowHandle() returns a Buffer; pass it directly to the native call.
 - The commonly used affinity values:
    WDA_NONE = 0
    WDA_MONITOR = 1
    // Newer Windows 10+ may include WDA_EXCLUDEFROMCAPTURE = 0x11 but not universally available.
 - Using WDA_MONITOR (1) is widely supported; you can experiment with other flags.
*/

const ffi = require('ffi-napi');
const ref = require('ref-napi');

let user32 = null;
try {
  user32 = ffi.Library('user32', {
    'SetWindowDisplayAffinity': ['bool', ['pointer', 'uint32']],
    'GetLastError': ['uint32', []]
  });
} catch (e) {
  console.warn('ffi user32 load failed:', e);
}

function setWindowAffinity(nativeHandleBuffer, affinity = 1) {
  if (!user32) return { ok: false, error: 'user32 not available' };
  try {
    // nativeHandleBuffer is the Buffer from win.getNativeWindowHandle()
    const result = user32.SetWindowDisplayAffinity(nativeHandleBuffer, affinity);
    if (result) return { ok: true };
    const err = user32.GetLastError();
    return { ok: false, error: 'SetWindowDisplayAffinity failed', code: err };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

module.exports = {
  setWindowAffinity
};
