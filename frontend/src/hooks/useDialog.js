import { useState } from 'react';

export function useDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('create');

  function open(m = 'create') {
    setMode(m);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return { isOpen, mode, open, close };
}
