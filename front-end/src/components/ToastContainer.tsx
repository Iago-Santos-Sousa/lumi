import React from "react";
import Toast from "./Toast";
import { useToast } from "../context/ToastContext";

const ToastContainer: React.FC = () => {
  const { toast, hideToast, isVisible } = useToast();

  if (!toast) return null;

  return (
    <Toast
      type={toast.type}
      message={toast.message}
      isVisible={isVisible}
      onClose={hideToast}
    />
  );
};

export default ToastContainer;
