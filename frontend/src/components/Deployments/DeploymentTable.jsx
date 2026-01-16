import { useEffect, useState } from "react";
import { getDeployments } from "../../api/deployService";
import { motion } from "framer-motion";
import { Badge } from "../UI/Badge";

export default function DeploymentTable() {
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDeployments();
        setDeployments(data);
      } catch (err) {
        console.error("Failed to fetch deployments:", err);
      }
    }
    load();
  }, []);
}