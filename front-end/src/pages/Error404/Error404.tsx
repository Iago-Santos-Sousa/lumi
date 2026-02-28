import React from "react";
import { useNavigate } from "react-router-dom";

const Error404: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navega para a página anterior
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>

        <p className="text-xl text-gray-600 mb-6">Ops! Page not found!</p>

        <button
          onClick={handleGoBack}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 ease-in-out flex items-center justify-center mx-auto space-x-2"
        >
          <span>Return to previous page</span>
        </button>
      </div>
    </div>
  );
};

export default Error404;
