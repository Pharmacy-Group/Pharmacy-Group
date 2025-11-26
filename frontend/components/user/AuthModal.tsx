"use client";
import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { Transition } from "@headlessui/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");

  useEffect(() => {
    if (isOpen) setMode("login");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Transition show={isOpen} as={React.Fragment}>
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Transition.Child
        enter="transition duration-200 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition duration-150 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div
          className="relative w-[700px] max-w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {mode === "login" && <LoginForm onChangeMode={setMode} onClose={onClose} />}
          {mode === "register" && <RegisterForm onChangeMode={setMode} onClose={onClose} />}
          {mode === "forgot" && <ForgotPasswordForm onChangeMode={setMode} onClose={onClose} />}
        </div>
      </Transition.Child>
    </div>
  </Transition>
  );
}
