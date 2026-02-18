export function validateBrazilianPhone(phone: string): boolean {
  const cleaned = phone?.replace(/\D/g, '') ?? '';
  return /^[1-9]{2}[2-9]\d{7,8}$/.test(cleaned);
}

export function formatPhone(phone: string): string {
  const cleaned = phone?.replace(/\D/g, '') ?? '';
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone ?? '';
}

export function cleanPhone(phone: string): string {
  return phone?.replace(/\D/g, '') ?? '';
}

export function maskPhone(value: string): string {
  const cleaned = value?.replace(/\D/g, '') ?? '';
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}
