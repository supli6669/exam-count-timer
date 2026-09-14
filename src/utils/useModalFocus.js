import { useEffect, useRef } from 'react';

export function useModalFocus(open) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open || !ref.current) return;
    const previous = document.activeElement;
    const modal = ref.current;
    const controls = () => [...modal.querySelectorAll('button, input, textarea, select, [tabindex="0"]')]
      .filter(element => !element.disabled && element.getClientRects().length > 0);
    (controls()[0] || modal).focus();
    const trap = event => {
      if (event.key !== 'Tab') return;
      const items = controls();
      if (!items.length) { event.preventDefault(); modal.focus(); return; }
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault(); items.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault(); items[0].focus();
      }
    };
    modal.addEventListener('keydown', trap);
    return () => {
      modal.removeEventListener('keydown', trap);
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  return ref;
}
