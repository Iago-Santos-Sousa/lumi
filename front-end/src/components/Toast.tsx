import React, { memo } from "react";
import { ToastType } from "../types/toast";

interface ToastProps {
  type: ToastType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = memo(
  ({ type, message, isVisible, onClose }) => {
    const getToastConfig = () => {
      switch (type) {
        case "success":
          return {
            bgColor: "bg-green-100",
            textColor: "text-green-500",
            icon: (
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            ),
          };
        case "error":
          return {
            bgColor: "bg-red-100",
            textColor: "text-red-500",
            icon: (
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            ),
          };
        default:
          return {
            bgColor: "bg-gray-100",
            textColor: "text-gray-500",
            icon: null,
          };
      }
    };

    const config = getToastConfig();

    return (
      <div
        className={`fixed top-4 right-4 z-50 transform transition-all duration-200 ease-in-out ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800">
          <div
            className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${config.textColor} ${config.bgColor} rounded-lg`}
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {config.icon}
            </svg>
            <span className="sr-only">Status icon</span>
          </div>
          <div className="ml-3 text-sm font-normal">{message}</div>
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  },
);

Toast.displayName = "Toast";

export default Toast;
