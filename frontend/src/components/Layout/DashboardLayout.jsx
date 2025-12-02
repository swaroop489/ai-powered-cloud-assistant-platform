import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="ml-64 p-10 w-full min-h-screen bg-gray-50"
      >
        {children}
      </motion.main>
    </div>
  );
}
