import { useState } from "react";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({
    name: "",
    batchNumber: "",
    manufacturer: "",
    manufactureDate: "",
    expiryDate: ""
  });

  const [qr, setQr] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/add-product", form);
      setQr(res.data.product.qrCode);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#1f2937] flex items-center justify-center text-white">

      <div className="w-[420px] p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

        <h2 className="text-2xl font-semibold text-center mb-6">
          🏭 Register Medicine
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            placeholder="Product Name"
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="batchNumber"
            placeholder="Batch Number"
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 placeholder-gray-300 focus:outline-none"
          />

          <input
            name="manufacturer"
            placeholder="Manufacturer Name"
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20 placeholder-gray-300 focus:outline-none"
          />

          <input
            type="date"
            name="manufactureDate"
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20"
          />

          <input
            type="date"
            name="expiryDate"
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-white/20"
          />

          <button className="w-full bg-blue-500 hover:bg-blue-600 transition p-2 rounded-lg font-semibold">
            Generate QR Code
          </button>

        </form>

        {qr && (
          <div className="mt-6 text-center">
            <p className="mb-2 text-sm text-gray-300">Generated QR</p>
            <div className="bg-white p-3 rounded-lg inline-block">
              <img src={qr} alt="QR" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Register;