import { useEffect, useState } from "react";
import { companyError } from "../pages/dashboard/companyApi";

export function useRemoteData<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string }>({ data: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(data => {
      if (!controller.signal.aborted) setState({ data, loading: false, error: "" });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ data: null, loading: false, error: companyError(error) });
    });
    return () => controller.abort();
  }, [load, revision]);
  function reload() {
    setState({ data: null, loading: true, error: "" });
    setRevision(value => value + 1);
  }
  return { ...state, reload };
}
