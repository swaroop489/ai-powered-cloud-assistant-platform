import { Link, useLocation } from "react-router-dom";
import { Cloud } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Deployments", path: "/deployments" },
    { name: "Metrics", path: "/metrics" },
    { name: "Docs", path: "/docs" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto h-full px-6 flex justify-between items-center">

        {/* BRAND / LOGO */}
        <div className="flex items-center gap-2">
          <Cloud className="w-6 h-6 text-blue-600" />
          <span className="text-lg font-semibold">CloudAssist</span>
        </div>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-all ${
                  active
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* PROFILE */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300"></div>
        </div>
      </div>
    </nav>
  );
}
