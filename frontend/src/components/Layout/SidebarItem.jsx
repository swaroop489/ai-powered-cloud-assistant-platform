import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function SidebarItem({ item }) {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <Link to={item.path} className="block">
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
          ${isActive ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-100"}
        `}
      >
        {item.icon}
        {item.name}

        {/* Active Indicator Bar */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="ml-auto h-full w-1 rounded bg-blue-600"
          />
        )}
      </div>
    </Link>
  );
}
