export const computeScore = (uomType: 'min' | 'max' | 'timeline' | 'zero', target: number, actual: number | null | undefined): number => {
  if (actual === null || actual === undefined) return 0;

  switch (uomType) {
    case 'min':
      if (target === 0) return actual > 0 ? 100 : 0;
      return Math.min(100, Math.max(0, (actual / target) * 100));
    case 'max':
      if (actual === 0) return 100;
      if (target === 0) return actual > 0 ? 0 : 100;
      return Math.min(100, Math.max(0, (target / actual) * 100));
    case 'timeline':
      return actual <= target ? 100 : 0;
    case 'zero':
      return actual === 0 ? 100 : 0;
    default:
      return 0;
  }
};
