import { useState, useEffect } from "react";

export function useScripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController(); // for cleanup
    const signal = controller.signal;

    async function fetchScripts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3000/api/scripts/", {
          signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setScripts(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch scripts:", err);
          setError(err.message || "Unknown error");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchScripts();

    // cleanup function in case component unmounts
    return () => controller.abort();
  }, []);

  return { scripts, loading, error };
}
