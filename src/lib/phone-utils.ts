/**
 * Utility functions for Ugandan phone numbers.
 * Ugandan phone numbers can be:
 * - Local format: 07XX XXX XXX, 03XX XXX XXX, 04XX XXX XXX
 * - International format: +256 7XX XXX XXX, +256 3XX XXX XXX, +256 4XX XXX XXX
 */

export function formatUgPhone(value: string): string {
  // Strip all non-digit characters except '+'
  let cleaned = value.replace(/[^\d+]/g, '');

  // If it starts with '256' but has no '+', prefix with '+'
  if (cleaned.startsWith('256') && !value.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  if (cleaned.startsWith('+256')) {
    const digits = cleaned.slice(4).replace(/\D/g, ''); // digits after +256
    if (digits.length === 0) return '+256';
    if (digits.length <= 3) {
      return `+256 ${digits}`;
    }
    if (digits.length <= 6) {
      return `+256 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    return `+256 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  } else {
    let digits = cleaned.replace(/\D/g, '');
    if (digits.length === 0) return '';
    
    // Auto prepend 0 if the user starts typing a common mobile prefix (7, 3, 4) without a leading 0
    if (digits.length > 0 && digits[0] !== '0' && (digits[0] === '7' || digits[0] === '3' || digits[0] === '4')) {
      digits = '0' + digits;
    }
    
    if (digits.length <= 4) {
      return digits;
    }
    if (digits.length <= 7) {
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  }
}

export function validateUgPhone(value: string): boolean {
  // Remove spaces
  const cleaned = value.replace(/\s+/g, '');
  
  // Pattern 1: +256 followed by 7, 3, 4, or 2, followed by 8 digits
  const intlPattern = /^\+256[2347]\d{8}$/;
  
  // Pattern 2: 0 followed by 7, 3, 4, or 2, followed by 8 digits
  const localPattern = /^0[2347]\d{8}$/;
  
  return intlPattern.test(cleaned) || localPattern.test(cleaned);
}
