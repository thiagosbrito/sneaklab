const CategoryLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center min-h-screen pt-28 bg-gray-100">
      <div className="w-full max-w-6xl p-6">
        {children}
      </div>
    </div>
  );
}
export default CategoryLayout;