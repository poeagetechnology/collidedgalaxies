export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
};

export const isGoogleSignInPending = (): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('googleSignInPending') === 'true';
};

export const setGoogleSignInPending = (pending: boolean): void => {
  if (typeof window === 'undefined') return;
  if (pending) {
    sessionStorage.setItem('googleSignInPending', 'true');
  } else {
    sessionStorage.removeItem('googleSignInPending');
  }
};