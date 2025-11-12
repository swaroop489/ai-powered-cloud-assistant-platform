import React from "react";
import Navbar from "./components/Layout/Navbar";
import AppRouter from "./router";

const App = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <AppRouter />
  </div>
);

export default App;
