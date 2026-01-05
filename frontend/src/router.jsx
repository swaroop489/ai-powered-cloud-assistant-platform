import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import Deployments from "./pages/Deployments";
// import MetricsPage from "./pages/MetricsPage";
import DashboardLayout from "./components/Layout/DashboardLayout";


const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    {/* <Route path="/deployments" element={<Deployments />} />
    <Route path="/metrics" element={<MetricsPage />} /> */}
    <Route path="/dashboard" element={<DashboardLayout />} />
  </Routes>
);

export default AppRouter;
