import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MetricsPage from "./pages/MetricsPage";
import DashboardLayout from "./components/Layout/DashboardLayout";
import AgentConsole from "./pages/Dashboard/AgentConsole";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    {/* <Route path="/deployments" element={<Deployments />} />
    <Route path="/metrics" element={<MetricsPage />} /> */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <DashboardLayout>
          <AgentConsole />
        </DashboardLayout>
      </ProtectedRoute>
    } />
    <Route path="/dashboard/metrics" element={<MetricsPage />} />
  </Routes>
);

export default AppRouter;
