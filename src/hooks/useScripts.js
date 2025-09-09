import { useState, useEffect } from "react";
import api from "../services/api";

export function useScripts(name) {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //TODO clean up abort controllers on unmount and parameter name
  // --- Fetch scripts ---
  const fetchScripts = async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/scripts", { signal });
      setScripts(response.data);
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(err.message || "Failed to fetch scripts");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchScriptByName = async (name, signal) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/scripts/${encodeURIComponent(name)}`, {
        signal,
      });
      setScripts([response.data]); // always an array
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(err.message || `Failed to fetch script "${name}"`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    if (name) {
      fetchScriptByName(name, controller.signal);
    } else {
      fetchScripts(controller.signal);
    }

    return () => controller.abort(); // ✅ proper cleanup
  }, [name]);
  // run only once on mount

  // --- Delete a script ---
  const deleteScript = async (name) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      setScripts((prev) => prev.filter((s) => s.name !== name)); // optimistic
      await api.delete(`/scripts/${encodeURIComponent(name)}`, {
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(err.message || "Failed to delete script");
        await fetchScripts(); // rollback
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  // --- Create a new script ---
  const createScript = async (script) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/scripts", script, {
        signal: controller.signal,
      });
      setScripts((prev) => [...prev, response.data]); // optimistic
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(err.message || "Failed to create script");
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  // --- Update an existing script ---
  const updateScript = async (name, updatedFields) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(
        `/scripts/${encodeURIComponent(name)}`,
        updatedFields,
        { signal: controller.signal }
      );
      setScripts((prev) =>
        prev.map((s) => (s.name === name ? { ...s, ...response.data } : s))
      );
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(err.message || "Failed to update script");
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  return {
    scripts,
    loading,
    error,
    fetchScripts,
    fetchScriptByName,
    deleteScript,
    createScript,
    updateScript,
  };
}
