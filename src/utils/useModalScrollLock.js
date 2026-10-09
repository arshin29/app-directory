import { useEffect } from 'react';

let activeModalLocks = 0;
let previousBodyOverflow = '';
let previousBodyPaddingRight = '';
let previousDocumentOverflow = '';

function lockPageScroll() {
  if (activeModalLocks === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    previousBodyOverflow = document.body.style.overflow;
    previousBodyPaddingRight = document.body.style.paddingRight;
    previousDocumentOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  activeModalLocks += 1;
}

function unlockPageScroll() {
  activeModalLocks = Math.max(0, activeModalLocks - 1);

  if (activeModalLocks === 0) {
    document.documentElement.style.overflow = previousDocumentOverflow;
    document.body.style.overflow = previousBodyOverflow;
    document.body.style.paddingRight = previousBodyPaddingRight;
  }
}

export function useModalScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return undefined;

    lockPageScroll();
    return unlockPageScroll;
  }, [isOpen]);
}
