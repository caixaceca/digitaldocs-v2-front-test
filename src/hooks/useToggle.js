import { useState } from 'react';

// ----------------------------------------------------------------------

export default function useToggle(defaultChecked) {
  const [toggle, setToggle] = useState(defaultChecked || false);

  return {
    toggle,
    onToggle: () => setToggle(!toggle),
    onOpen: () => setToggle(true),
    onClose: () => setToggle(false),
    setToggle,
  };
}

export function useToggle1(defaultChecked) {
  const [toggle1, setToggle1] = useState(defaultChecked || false);

  return {
    toggle1,
    onToggle1: () => setToggle1(!toggle1),
    onOpen1: () => setToggle1(true),
    onClose1: () => setToggle1(false),
    setToggle1,
  };
}

export function useToggle2(defaultChecked) {
  const [toggle2, setToggle2] = useState(defaultChecked || false);

  return {
    toggle2,
    onToggle2: () => setToggle2(!toggle2),
    onOpen2: () => setToggle2(true),
    onClose2: () => setToggle2(false),
    setToggle2,
  };
}

export function useToggle3(defaultChecked) {
  const [toggle3, setToggle3] = useState(defaultChecked || false);

  return {
    toggle3,
    onToggle3: () => setToggle3(!toggle3),
    onOpen3: () => setToggle3(true),
    onClose3: () => setToggle3(false),
    setToggle3,
  };
}

export function useToggle4(defaultChecked) {
  const [toggle4, setToggle4] = useState(defaultChecked || false);

  return {
    toggle4,
    onToggle4: () => setToggle4(!toggle4),
    onOpen4: () => setToggle4(true),
    onClose4: () => setToggle4(false),
    setToggle4,
  };
}

export function useToggle5(defaultChecked) {
  const [toggle5, setToggle5] = useState(defaultChecked || false);

  return {
    toggle5,
    onToggle5: () => setToggle5(!toggle5),
    onOpen5: () => setToggle5(true),
    onClose5: () => setToggle5(false),
    setToggle5,
  };
}

export function useToggle6(defaultChecked) {
  const [toggle6, setToggle6] = useState(defaultChecked || false);

  return {
    toggle6,
    onToggle6: () => setToggle6(!toggle6),
    onOpen6: () => setToggle6(true),
    onClose6: () => setToggle6(false),
    setToggle6,
  };
}
