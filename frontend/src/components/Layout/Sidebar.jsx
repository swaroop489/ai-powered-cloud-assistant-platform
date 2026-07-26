import { motion } from "framer-motion";
import { Home, BarChart3, Layers, Settings } from "lucide-react";
import SidebarItem from "./SidebarItem";

const navItems = [
  { name: "Home", path: "/", icon: <Home size={18} /> },
  { name: "Deployments", path: "/dashboard", icon: <Layers size={18} /> },
  { name: "Metrics", path: "/dashboard/metrics", icon: <BarChart3 size={18} /> },
  { name: "Settings", path: "/settings", icon: <Settings size={18} /> },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 18 }}
      className="w-64 h-screen bg-white border-r border-gray-200 fixed top-0 left-0 p-6"
    >
      {/* LOGO */}
      <div className="text-2xl font-semibold mb-10 tracking-tight">
        CloudAssist
      </div>

      {/* NAV ITEMS */}
      <div className="space-y-2">
        {navItems.map((item) => (
          <SidebarItem key={item.name} item={item} />
        ))}
      </div>
    </motion.aside>
  );
}
