import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PasswordForm from "../dashboard/comprador/PasswordForm";

export default function FirstAccess() {
  return <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-[#1B4B3A]"><Header variant="marketplace" /><main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12"><h1 className="mb-6 text-3xl font-bold">Primeiro acesso</h1><PasswordForm firstAccess /></main><Footer /></div>;
}
