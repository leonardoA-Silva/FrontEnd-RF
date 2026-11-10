import { buyerStyles as s } from "./buyerStyles";

export default function RequestState({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) {
  if (loading) return <p role="status" className={s.copy}>Carregando...</p>;
  if (error) return <div role="alert" className={`${s.error} space-y-4`}><p>{error}</p><button type="button" onClick={retry} className={s.secondary}>Tentar novamente</button></div>;
  return null;
}
