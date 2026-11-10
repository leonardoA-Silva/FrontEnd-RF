import { useCallback, useEffect, useState } from "react";
import { listarProdutos, type ProductBackend } from "../axios/Axios";
import { apiError } from "../axios/apiError";

export function useProducts() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ loading: boolean; products: ProductBackend[]; error: string }>({ loading: true, products: [], error: "" });
  useEffect(() => {
    const controller = new AbortController();
    listarProdutos(controller.signal).then(({ data }) => {
      if (!Array.isArray(data)) throw new Error("Resposta inválida.");
      if (!controller.signal.aborted) setState({ loading: false, products: data.filter(p => p && typeof p.id === "string" && typeof p.name === "string"), error: "" });
    }).catch(error => { if (!controller.signal.aborted) setState({ loading: false, products: [], error: apiError(error, "Não foi possível carregar os materiais.") }); });
    return () => controller.abort();
  }, [attempt]);
  const reload = useCallback(() => { setState({ loading: true, products: [], error: "" }); setAttempt(value => value + 1); }, []);
  return { ...state, reload };
}
