import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Deployments from "./pages/Deployments";
import MetricsPage from "./pages/MetricsPage";

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/deployments" element={<Deployments />} />
      <Route path="/metrics" element={<MetricsPage />} />
    </Routes>
  </Router>
);

export default AppRouter;
