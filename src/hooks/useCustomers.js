import { useState, useEffect } from "react";
import api from "../services/api";

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, fetchCustomers };
}
