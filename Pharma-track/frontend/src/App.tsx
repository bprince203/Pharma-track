import { Routes, Route, Navigate } from "react-router-dom";
import Landing     from "./pages/Landing";
import Onboarding  from "./pages/Onboarding";
import RoleGuard   from "./components/RoleGuard";

import ManufacturerDashboard from "./pages/manufacturer/Dashboard";
import ManufacturerInventory from "./pages/manufacturer/Inventory";
import ManufacturerLogistics from "./pages/manufacturer/Logistics";
import RegisterBatch         from "./pages/manufacturer/RegisterBatch";

import DistributorDashboard from "./pages/distributor/Dashboard";
import DistributorInventory from "./pages/distributor/Inventory";
import DistributorLogistics from "./pages/distributor/Logistics";

import PharmacyDashboard from "./pages/pharmacy/Dashboard";
import PharmacyInventory from "./pages/pharmacy/Inventory";
import PharmacyLogistics from "./pages/pharmacy/Logistics";
import SellMedicine      from "./pages/pharmacy/SellMedicine";

import Verification   from "./pages/shared/Verification";
import SmartContracts  from "./pages/shared/SmartContracts";
import Security        from "./pages/shared/Security";

import Scanner from "./pages/verify/Scanner";
import Result  from "./pages/verify/Result";

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/verify"    element={<Scanner />} />
      <Route path="/verify/:tokenId" element={<Result />} />

      {/* Manufacturer routes */}
      <Route path="/manufacturer" element={<RoleGuard requiredRole="MANUFACTURER"><ManufacturerDashboard /></RoleGuard>} />
      <Route path="/manufacturer/inventory" element={<RoleGuard requiredRole="MANUFACTURER"><ManufacturerInventory /></RoleGuard>} />
      <Route path="/manufacturer/logistics" element={<RoleGuard requiredRole="MANUFACTURER"><ManufacturerLogistics /></RoleGuard>} />
      <Route path="/manufacturer/register-batch" element={<RoleGuard requiredRole="MANUFACTURER"><RegisterBatch /></RoleGuard>} />
      <Route path="/manufacturer/verification" element={<RoleGuard requiredRole="MANUFACTURER"><Verification role="manufacturer" /></RoleGuard>} />
      <Route path="/manufacturer/smart-contracts" element={<RoleGuard requiredRole="MANUFACTURER"><SmartContracts role="manufacturer" /></RoleGuard>} />
      <Route path="/manufacturer/security" element={<RoleGuard requiredRole="MANUFACTURER"><Security role="manufacturer" /></RoleGuard>} />

      {/* Distributor routes */}
      <Route path="/distributor" element={<RoleGuard requiredRole="DISTRIBUTOR"><DistributorDashboard /></RoleGuard>} />
      <Route path="/distributor/inventory" element={<RoleGuard requiredRole="DISTRIBUTOR"><DistributorInventory /></RoleGuard>} />
      <Route path="/distributor/logistics" element={<RoleGuard requiredRole="DISTRIBUTOR"><DistributorLogistics /></RoleGuard>} />
      <Route path="/distributor/verification" element={<RoleGuard requiredRole="DISTRIBUTOR"><Verification role="distributor" /></RoleGuard>} />
      <Route path="/distributor/smart-contracts" element={<RoleGuard requiredRole="DISTRIBUTOR"><SmartContracts role="distributor" /></RoleGuard>} />
      <Route path="/distributor/security" element={<RoleGuard requiredRole="DISTRIBUTOR"><Security role="distributor" /></RoleGuard>} />

      {/* Pharmacy routes */}
      <Route path="/pharmacy" element={<RoleGuard requiredRole="PHARMACY"><PharmacyDashboard /></RoleGuard>} />
      <Route path="/pharmacy/inventory" element={<RoleGuard requiredRole="PHARMACY"><PharmacyInventory /></RoleGuard>} />
      <Route path="/pharmacy/logistics" element={<RoleGuard requiredRole="PHARMACY"><PharmacyLogistics /></RoleGuard>} />
      <Route path="/pharmacy/sell" element={<RoleGuard requiredRole="PHARMACY"><SellMedicine /></RoleGuard>} />
      <Route path="/pharmacy/verification" element={<RoleGuard requiredRole="PHARMACY"><Verification role="pharmacy" /></RoleGuard>} />
      <Route path="/pharmacy/smart-contracts" element={<RoleGuard requiredRole="PHARMACY"><SmartContracts role="pharmacy" /></RoleGuard>} />
      <Route path="/pharmacy/security" element={<RoleGuard requiredRole="PHARMACY"><Security role="pharmacy" /></RoleGuard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}