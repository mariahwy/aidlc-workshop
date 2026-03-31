/**
 * 금액을 원화 포맷으로 변환
 * @example formatCurrency(12000) => "₩12,000"
 */
export function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

/**
 * ISO 날짜 문자열을 한국어 날짜/시간으로 변환
 * @example formatDateTime('2026-03-31T10:30:00Z') => "2026. 3. 31. 오전 10:30"
 */
export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('ko-KR');
}

/**
 * ISO 날짜 문자열을 한국어 날짜로 변환
 * @example formatDate('2026-03-31T10:30:00Z') => "2026. 3. 31."
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ko-KR');
}

/**
 * ISO 날짜 문자열을 한국어 시간으로 변환
 * @example formatTime('2026-03-31T10:30:00Z') => "오전 10:30"
 */
export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
