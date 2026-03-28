export const fundlyMoneyDataUpdatedEvent = 'fundly:money-data-updated';

export function emitMoneyDataUpdated(detail = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(fundlyMoneyDataUpdatedEvent, { detail }));
}

export function subscribeMoneyDataUpdated(handler) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(fundlyMoneyDataUpdatedEvent, handler);

  return () => {
    window.removeEventListener(fundlyMoneyDataUpdatedEvent, handler);
  };
}
