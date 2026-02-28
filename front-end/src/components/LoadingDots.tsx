const LoadingDots: React.FC = () => {
  return (
    <div>
      <div className="flex gap-2 mx-auto w-min">
        <div className="w-4 h-4 rounded-full animate-pulse bg-white"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-white"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-white"></div>
      </div>
    </div>
  );
};

export default LoadingDots;
