const PageLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-75">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-4 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xl text-gray-700 font-semibold">
          Carregando...
        </p>
      </div>
    </div>
  );
};

export default PageLoading;
