const SharedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <main className="min-h-[calc(100vh-168px)] pt-10 pb-10 relative">
      {children}
    </main>
  );
};

export default SharedLayout;
