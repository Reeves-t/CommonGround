
export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-950 text-white p-4 flex justify-between items-center">
        <div className="text-xl font-bold">🌍 CommonGround</div>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white">🔔</button>
          <img src="https://i.pravatar.cc/40" className="w-8 h-8 rounded-full" alt="User" />
        </div>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="bg-gray-800 rounded-2xl p-4 h-[80vh] overflow-y-auto">{children[0]}</div>
        <div className="bg-gray-800 rounded-2xl p-4 h-[80vh] overflow-hidden">{children[1]}</div>
        <div className="bg-gray-800 rounded-2xl p-4 h-[80vh] overflow-y-auto">{children[2]}</div>
      </main>
    </div>
  );
}
