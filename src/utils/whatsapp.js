export function whatsappLink(phone, message) {
  // Ensure phone is digits only and in international format (expects country code present)
  const clean = String(phone || '').replace(/[^0-9+]/g, '');
  const text = encodeURIComponent(message || '');
  // wa.me expects no plus sign in the number
  const number = clean.replace(/^\+/, '');
  return `https://wa.me/${number}?text=${text}`;
}
