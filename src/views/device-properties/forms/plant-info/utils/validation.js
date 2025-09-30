export const required = (v) => !(v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0));

export const isEmail = (v = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isUrl = (v = '') => /^https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:[\/?#].*)?$/i.test(v);
export const isPhone10 = (v = '') => /^[6-9]\d{9}$/.test(v);
// billing day 1–28 (safe)
export const isDay = (n) => Number.isInteger(Number(n)) && Number(n) >= 1 && Number(n) <= 28;

export const validateField = (field, value) => {
  if (field.required && !required(value)) return `${field.label || field.id} is required.`;

  if (field.type === 'email' && value && !isEmail(value)) return 'Enter a valid email.';
  if (field.type === 'url' && value && !isUrl(value)) return 'Enter a valid URL (http/https).';
  if (field.type === 'phone' && value && !isPhone10(value)) return 'Enter a valid 10-digit mobile.';
  if (field.id === 'billing_cycle_start_day' && !isDay(value)) return 'Day must be between 1 and 28.';

  // light validation for repeater emails/phones
  if (field.type === 'repeater-list' && Array.isArray(value)) {
    if (field.itemType === 'phone' && value.some((v) => v && !isPhone10(v))) return 'One or more phone numbers are invalid.';
    if (field.itemType === 'email' && value.some((v) => v && !isEmail(v))) return 'One or more emails are invalid.';
  }

  return null;
};
