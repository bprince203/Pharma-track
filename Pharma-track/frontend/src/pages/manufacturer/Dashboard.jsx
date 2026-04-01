import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#1f2937] text-white flex flex-col items-center justify-center">

      <h1 className="text-3xl font-semibold mb-10">
        🏭 Manufacturer Panel
      </h1>

      <div className="flex gap-8">

        {/* Add Product Card */}
        <div
          onClick={() => navigate("/manufacturer/register")}
          className="cursor-pointer w-[260px] p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:scale-105 transition"
        >
          <h2 className="text-xl font-semibold mb-2">➕ Add Product</h2>
          <p className="text-gray-300 text-sm">
            Register medicine & generate QR code
          </p>
        </div>

        {/* Placeholder Card */}
        <div className="w-[260px] p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl opacity-70">
          <h2 className="text-xl font-semibold mb-2">📦 Products</h2>
          <p className="text-gray-400 text-sm">
            Coming soon...
          </p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;