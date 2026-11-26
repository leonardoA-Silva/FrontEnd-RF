import { useEffect, useState } from "react";
import { resourceError } from "./companyResourceApi";

export function useCompanyResource<T>(load: (signal: AbortSignal) => Promise<T[]>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(data => { if (!controller.signal.aborted) { setRows(data); setLoading(false); } }).catch(cause => { if (!controller.signal.aborted) { setError(resourceError(cause)); setLoading(false); } });
    return () => controller.abort();
  }, [load, attempt]);
  useEffect(() => {
    const onFocus = () => setAttempt(value => value + 1);
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => setAttempt(value => value + 1), 10000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, []);
  return { rows, loading, error, reload: () => { setError(""); setLoading(true); setAttempt(value => value + 1); } };
}
