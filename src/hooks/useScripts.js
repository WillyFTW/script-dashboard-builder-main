import { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "@/hooks/use-toast";

export function useScripts(name) {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // --- Fetch scripts ---
  const fetchScripts = async (overrideName, signal) => {
    setLoading(true);
    setError(null);

    try {
      const url = overrideName
        ? `/scripts/${encodeURIComponent(overrideName)}`
        : "/scripts";

      const options = signal ? { signal } : {};
      const response = await api.get(url, options);

      setScripts(overrideName ? [response.data] : response.data);
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(
          err.message ||
            (overrideName
              ? `Failed to fetch script "${overrideName}"`
              : "Failed to fetch scripts")
        );
        toast({
          title: "Fehler beim Laden der Skripte",
          description: `${err.response?.data?.error || err.message}`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchScripts(name, controller.signal);

    return () => controller.abort();
  }, [name]);

  // --- Delete a script ---
  const deleteScript = async (name) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      setScripts((prev) => prev.filter((s) => s.name !== name)); // optimistic
      const response = await api.delete(
        `/scripts/${encodeURIComponent(name)}`,
        {
          signal: controller.signal,
        }
      );

      toast({
        title: "Skript gelöscht",
        description: `${response.data.message}`,
      });
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(err.message || "Failed to delete script");
        console.error(err);
        toast({
          title: "Fehler beim Löschen des Skripts",
          description: `${err.response?.data?.error || err.message}`,
        });
        await fetchScripts(); // rollback
      }
    } finally {
      setLoading(false);
    }
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

      setScripts((prev) => [...prev, script]);
      toast({
        title: "Skript erstellt",
        description: `${response.data.message}`,
      });
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(err.message || "Failed to create script");
        toast({
          title: "Fehler beim Erstellen des Skripts",
          description: `${err.response?.data?.error || err.message}`,
        });
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
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
        prev.map((s) => (s.name === name ? { ...s, ...updatedFields } : s))
      );
      toast({
        title: "Skript aktualisiert",
        description: `${response.data.message}`,
      });
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(err.message || "Failed to update script");
        console.error(err);
        toast({
          title: "Fehler beim Aktualisieren des Skripts",
          description: `${err.response?.data?.error || err.message}`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    scripts,
    loading,
    error,
    fetchScripts,
    deleteScript,
    createScript,
    updateScript,
  };
}
