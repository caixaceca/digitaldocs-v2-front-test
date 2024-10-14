import { useState } from 'react';

// ----------------------------------------------------------------------

export default function useToggle(defaultChecked) {
  const [toggle, setToggle] = useState(defaultChecked || false);
  return { toggle, onOpen: () => setToggle(true), onClose: () => setToggle(false) };
}

export function useToggle1(defaultChecked) {
  const [toggle1, setToggle1] = useState(defaultChecked || false);
  return { toggle1, onOpen1: () => setToggle1(true), onClose1: () => setToggle1(false) };
}

export function useToggle2(defaultChecked) {
  const [toggle2, setToggle2] = useState(defaultChecked || false);
  return { toggle2, onOpen2: () => setToggle2(true), onClose2: () => setToggle2(false) };
}
