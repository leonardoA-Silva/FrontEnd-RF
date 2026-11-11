import ProductCatalog from "./ProductCatalog";
import { useSearchParams } from "react-router-dom";

export default function Marketplace() { const [params] = useSearchParams(); return <main className="flex flex-1 flex-col"><ProductCatalog companyId={params.get("empresa") ?? undefined} /></main>; }
