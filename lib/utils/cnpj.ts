export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj?.replace(/\D/g, '') ?? '';
  
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  const calcDigit = (base: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(base[i] ?? '0') * (weights[i] ?? 0);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  const digit1 = calcDigit(cleaned.substring(0, 12), weights1);
  const digit2 = calcDigit(cleaned.substring(0, 12) + digit1, weights2);
  
  return cleaned.endsWith(`${digit1}${digit2}`);
}

export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj?.replace(/\D/g, '') ?? '';
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

export function cleanCNPJ(cnpj: string): string {
  return cnpj?.replace(/\D/g, '') ?? '';
}

export function maskCNPJ(value: string): string {
  const cleaned = value?.replace(/\D/g, '') ?? '';
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
}
