import { useCallback, useEffect, useState } from "react";
import type { Project } from "./content";

// Loads published + visible projects from MySQL through the public API.
// Refetches when the window regains focus, so edits made in the Admin Panel show up without a code change.
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/public/projects", { cache: "no-store" });
      if (!response.ok) throw new Error(`Projects request failed (${response.status})`);
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError("Projects could not be loaded right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  return { projects, loading, error, reload: load };
}
