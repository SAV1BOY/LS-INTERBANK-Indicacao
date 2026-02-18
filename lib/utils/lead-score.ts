interface LeadScoreInput {
  hasEmail: boolean;
  hasPhone: boolean;
  hasSegment: boolean;
  hasSize: boolean;
  hasNecessity: boolean;
  hasUrgency: boolean;
  hasConsent: boolean;
  urgency?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'IMEDIATA';
  segmentFit: boolean;
  sizeFit: boolean;
}

export function calculateLeadScore(input: LeadScoreInput): number {
  let score = 0;
  
  // Completude (0-40 pontos)
  if (input.hasPhone) score += 10;
  if (input.hasEmail) score += 5;
  if (input.hasSegment) score += 8;
  if (input.hasSize) score += 5;
  if (input.hasNecessity) score += 7;
  if (input.hasUrgency) score += 5;
  
  // Fit (0-40 pontos)
  if (input.segmentFit) score += 20;
  if (input.sizeFit) score += 15;
  if (input.hasConsent) score += 5;
  
  // Engajamento (0-20 pontos)
  switch (input.urgency) {
    case 'IMEDIATA': score += 20; break;
    case 'ALTA': score += 15; break;
    case 'MEDIA': score += 10; break;
    case 'BAIXA': score += 5; break;
  }
  
  return Math.min(score, 100);
}

export function getScoreClassification(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Hot (A)', color: 'text-red-600' };
  if (score >= 60) return { label: 'Warm (B)', color: 'text-orange-500' };
  if (score >= 40) return { label: 'Neutral (C)', color: 'text-yellow-500' };
  return { label: 'Cold (D)', color: 'text-blue-500' };
}
