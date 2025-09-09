import { useState, useCallback } from "react";
import api from "../services/api";

export function useDeleteScript() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function deleteScript(name) {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/scripts/${encodeURIComponent(name)}`, {
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === "CanceledError") {
        console.log("Delete request was canceled");
      } else {
        setError(err.message || "Failed to delete script");
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }

  return { deleteScript, loading, error };
}
