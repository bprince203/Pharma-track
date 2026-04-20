import { Routes, Route, Navigate } from "react-router-dom";
import Landing     from "./pages/Landing";
import Onboarding  from "./pages/Onboarding";
import RoleGuard   from "./components/RoleGuard";

import ManufacturerDashboard from "./pages/manufacturer/Dashboard";
import Register              from "./pages/manufacturer/Register";
import RegisterBatch         from "./pages/manufacturer/RegisterBatch";

import DistributorDashboard from "./pages/distributor/Dashboard";
import ReceiveBatch         from "./pages/distributor/ReceiveBatch";

import PharmacyDashboard from "./pages/pharmacy/Dashboard";
import Inventory         from "./pages/pharmacy/Inventory";
import SellMedicine      from "./pages/pharmacy/SellMedicine";

import Scanner from "./pages/verify/Scanner";
import Result  from "./pages/verify/Result";

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/verify"    element={<Scanner />} />
      <Route path="/verify/:tokenId" element={<Result />} />

      <Route path="/manufacturer" element={
        <RoleGuard requiredRole="MANUFACTURER">
          <ManufacturerDashboard />
        </RoleGuard>
      } />
      <Route path="/manufacturer/register" element={
        <RoleGuard requiredRole="MANUFACTURER">
          <Register />
        </RoleGuard>
      } />
      <Route path="/manufacturer/register-batch" element={
        <RoleGuard requiredRole="MANUFACTURER">
          <RegisterBatch />
        </RoleGuard>
      } />

      <Route path="/distributor" element={
        <RoleGuard requiredRole="DISTRIBUTOR">
          <DistributorDashboard />
        </RoleGuard>
      } />
      <Route path="/distributor/receive" element={
        <RoleGuard requiredRole="DISTRIBUTOR">
          <ReceiveBatch />
        </RoleGuard>
      } />

      <Route path="/pharmacy" element={
        <RoleGuard requiredRole="PHARMACY">
          <PharmacyDashboard />
        </RoleGuard>
      } />
      <Route path="/pharmacy/inventory" element={
        <RoleGuard requiredRole="PHARMACY">
          <Inventory />
        </RoleGuard>
      } />
      <Route path="/pharmacy/sell" element={
        <RoleGuard requiredRole="PHARMACY">
          <SellMedicine />
        </RoleGuard>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}