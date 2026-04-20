// api/checkin.js
import { encryptAadhaar } from '../utils/validators';

//const BASE_URL =  'http://localhost/hotel-checkin';

const BASE_URL =  'https://hotel-checkin-api-g8gwbqcnhsazd9b8.centralindia-01.azurewebsites.net';

// ── Mock hotel data (replace with real API) ────────────────
const MOCK_HOTELS = {
  'hotel-demo-001': {
    hotelId:  'hotel-demo-001',
    name:     'The Grand Rajputana Palace',
    address:  'MI Road, Jaipur, Rajasthan 302001',
    contact:  '+91-141-2345678',
    logoUrl:  null,
  },
  'hotel-demo-002': {
    hotelId:  'hotel-demo-002',
    name:     'Seaside Retreat & Spa',
    address:  '42 Marine Drive, Mumbai 400020',
    contact:  '+91-22-9876543',
    logoUrl:  null,
  },
};

export const fetchHotel = async (hotelId) => {
  // Try real API first, fall back to mock
  try {
    const res = await fetch(`${BASE_URL}/api/hotel.php?id=${hotelId}`);
    if (res.ok) {
      const data = await res.json();
      return data.hotel;
    }
  } catch (_) { /* offline / dev mode — use mock */ }

  // Mock fallback
  await new Promise(r => setTimeout(r, 800)); // simulate network
  const hotel = MOCK_HOTELS[hotelId];
  if (!hotel) throw new Error('Hotel not found');
  return hotel;
};

// ── Encrypt sensitive fields before sending ────────────────
const sanitizePayload = async (payload) => {
  const encPrimary = await encryptAadhaar(payload.primaryGuest.aadhaar);
  const members    = await Promise.all(
    (payload.members || []).map(async (m) => ({
      ...m,
      aadhaar: await encryptAadhaar(m.aadhaar),
    }))
  );

  return {
    ...payload,
    primaryGuest: {
      ...payload.primaryGuest,
      aadhaar: encPrimary,            // encrypted
    },
    members,
  };
};

export const submitCheckinRequest = async (payload) => {
  const safePayload = await sanitizePayload(payload);

  try {
    const res = await fetch(`${BASE_URL}/api/checkin-request.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(safePayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Submission failed');
    }

    return await res.json();
  } catch (err) {
    
    throw err;
  }
};
