import React from "react";
import Navbar from "./components/Layout/Navbar";
import AppRouter from "./router";
import { BrowserRouter } from "react-router-dom";

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AppRouter />
    </div>
  </BrowserRouter>
);

export default App;
