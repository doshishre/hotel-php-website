// utils/validators.js

export const validateAadhaar = (val = '') => {
  const clean = val.replace(/\D/g, '');
  return clean.length === 12;
};

export const validateMobile = (val = '') => {
  const clean = val.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(clean);
};

export const validateEmail = (val = '') => {
  if (!val) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
};

export const maskAadhaar = (val = '') => {
  const clean = val.replace(/\D/g, '');
  if (clean.length < 4) return clean.replace(/./g, '●');
  const last4 = clean.slice(-4);
  return '●●●● ●●●● ' + last4;
};

export const encryptAadhaar = async (plain) => {
  const encoder = new TextEncoder();
  const keyMat  = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode('HotelCheckin2024SecureKey!@#$%^&'),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  const iv        = window.crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMat,
    encoder.encode(plain)
  );
  const combined = new Uint8Array(iv.byteLength + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
};