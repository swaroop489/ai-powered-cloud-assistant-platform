import React from "react";
import Navbar from "./components/Layout/Navbar";
import AppRouter from "./router";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AppRouter />
      </div>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
