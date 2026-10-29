import { createContext, useContext } from "react";
import type { CompanyIdentity, CompanyProduct } from "./companyTypes";

export interface CompanyState {
  preview: boolean; base: string; identity: CompanyIdentity | null; products: CompanyProduct[];
  loading: boolean; error: string; notice: string; reload: () => void;
  saveDemo: (product: CompanyProduct) => void; deleteDemo: (id: string) => void;
  updateIdentity: (identity: CompanyIdentity) => void; setNotice: (notice: string) => void;
}
export const CompanyContext = createContext<CompanyState | null>(null);
export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) throw new Error("Company provider missing");
  return context;
}
