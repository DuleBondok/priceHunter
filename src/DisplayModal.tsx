import React, { ReactNode, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./Category.css";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  isOpen: boolean;
}

export default function Modal({ children, onClose, isOpen }: ModalProps) {
  const [visible, setVisible] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setAnimate(true);  // play open animation
    } else if (visible) {
      setAnimate(false); // play close animation
      const timer = setTimeout(() => setVisible(false), 300); // match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div
      className={`modalOverlay ${animate ? "show" : "hide"}`}
      onClick={onClose}
    >
      <div
        className={`modalContent ${animate ? "show" : "hide"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}