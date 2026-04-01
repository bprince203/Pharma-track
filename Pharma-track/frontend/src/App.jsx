import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";

// ✅ IMPORT ADD KAR
import Dashboard from "./pages/manufacturer/Dashboard";
import Register from "./pages/manufacturer/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* ✅ Manufacturer Routes */}
      <Route path="/manufacturer" element={<Dashboard />} />
      <Route path="/manufacturer/register" element={<Register />} />
    </Routes>
  );
}