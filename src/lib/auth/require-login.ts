import { clientStore } from '@/lib/store';

export function isUserLoggedIn(): boolean {
  if (clientStore.isLoggedIn) return true;
  if (typeof document !== 'undefined' && document.cookie.includes('bz_session=')) {
    return true;
  }
  return false;
}

export function redirectToLogin(
  pendingAction: Record<string, unknown>,
  nextPath: string,
  toastFn?: (msg: string, type?: 'success' | 'error' | 'info') => void,
  message = 'Please log in to continue.'
): void {
  try {
    sessionStorage.setItem('bz_pending_action', JSON.stringify(pendingAction));
  } catch {
    // ignore storage quota errors
  }
  if (toastFn) {
    toastFn(message, 'info');
  }
  if (typeof window !== 'undefined') {
    window.location.href = `/login?next=${encodeURIComponent(nextPath)}`;
  }
}
