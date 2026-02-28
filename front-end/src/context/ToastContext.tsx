import React, { createContext, useCallback, useContext, useState } from "react";
import { ToastMessage, ToastType } from "../types/toast";

interface ToastContextData {
  showToast: (type: ToastType, message: string) => void;
  hideToast: () => void;
  toast: ToastMessage | null;
  isVisible: boolean;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setToast(null), 200); // Delay para animação de saída
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      // Se já existe um toast, limpa ele primeiro
      if (toast) {
        hideToast();
        setTimeout(() => {
          setToast({ type, message });
          setIsVisible(true);
        }, 200);
      } else {
        setToast({ type, message });
        setIsVisible(true);
      }

      // Auto-hide(desaparece) após 3 segundos
      setTimeout(hideToast, 5000);
    },
    [toast, hideToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toast, isVisible }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
