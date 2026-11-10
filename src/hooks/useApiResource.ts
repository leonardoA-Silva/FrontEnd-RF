import { useCallback, useEffect, useState } from "react";
import { apiError } from "../axios/apiError";

export class ResourceError extends Error {}

export function useApiResource<T>(loader: (signal: AbortSignal) => Promise<{ data: T }>) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ loader: typeof loader; data: T | null; loading: boolean; error: string }>({ loader, data: null, loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    loader(controller.signal).then(({ data }) => {
      if (!controller.signal.aborted) setState({ loader, data, loading: false, error: "" });
    }).catch(cause => {
      if (!controller.signal.aborted) setState({ loader, data: null, loading: false, error: cause instanceof ResourceError ? cause.message : apiError(cause, "Não foi possível carregar os dados. Tente novamente.") });
    });
    return () => controller.abort();
  }, [loader, revision]);
  const reload = useCallback(() => {
    setState(current => ({ ...current, loading: true, error: "" }));
    setRevision(value => value + 1);
  }, []);
  return { data: state.loader === loader ? state.data : null, loading: state.loader !== loader || state.loading, error: state.loader === loader ? state.error : "", reload };
}

export function requireArray<T>(data: T[]): T[] {
  if (!Array.isArray(data)) throw new Error("Resposta inválida.");
  return data;
}
