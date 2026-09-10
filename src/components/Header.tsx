import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Repeat2, UserRound, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { useLoggedUser } from "../hooks/useLoggedUser";

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, role, displayName, photoSrc, logout } = useLoggedUser({
    fallbackName: "Roberto de Oliveira",
  });

  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const [menuMovelAberto, setMenuMovelAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuUsuarioAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  function handleLogout() {
    logout();
    setMenuUsuarioAberto(false);
    navigate("/login");
  }

  // Verifica se o usuário está logado (role de usuário ou empresa)
  const isUsuarioLogado = isLoggedIn || Boolean(role);

  return (
    <header className="w-full border-b border-[#E7E4DA] bg-white sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        {/* Marca / Logo */}
        <Link
          to={isUsuarioLogado ? (role === "company" ? "/dashboardEmpresa" : "/dashboardUsuario") : "/"}
          className="flex items-center gap-3 no-underline shrink-0"
        >
          <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <Repeat2 className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.4} />
          </span>
          <div className="leading-tight">
            <p className="text-base sm:text-lg font-bold text-[#1B4B3A]">Reaproveita</p>
            <p className="text-xs sm:text-sm font-bold tracking-wide text-orange-500">FRANCA</p>
          </div>
        </Link>

        {/* ============================================================== */}
        {/* OPERADOR TERNÁRIO: RENDERIZAÇÃO CONDICIONAL POR TIPO DE CONTA */}
        {/* ============================================================== */}
        {isUsuarioLogado ? (
          /* ============================================================ */
          /* 1. HEADER DO USUÁRIO LOGADO (IGUAL À IMAGEM)                 */
          /* ============================================================ */
          <>
            {/* Links Centrais: Início | Marketplace | Sobre Nós */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to={role === "company" ? "/dashboardEmpresa" : "/dashboardUsuario"}
                className="text-sm font-medium text-[#4B5A55] hover:text-[#1B4B3A] transition"
              >
                Início
              </Link>
              <Link
                to="/dashboardUsuario"
                className="text-sm font-medium text-[#4B5A55] hover:text-[#1B4B3A] transition"
              >
                Marketplace
              </Link>
              <Link
                to="/#sobre"
                className="text-sm font-medium text-[#4B5A55] hover:text-[#1B4B3A] transition"
              >
                Sobre Nós
              </Link>
            </nav>

            {/* Lado Direito: Pílula de Perfil do Usuário */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuUsuarioAberto((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-full bg-[#EBF6F2] hover:bg-[#E0F0EA] border border-[#D5EADB] py-1.5 pl-1.5 pr-3.5 transition cursor-pointer"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-300">
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={`Foto de ${displayName}`}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-4 w-4 text-[#1B4B3A]" strokeWidth={2.2} />
                    )}
                  </span>
                  <span className="text-sm font-semibold text-[#1B4B3A] max-w-[160px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#1B4B3A] opacity-70" />
                </button>

                {/* Dropdown do Usuário */}
                {menuUsuarioAberto && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#E7E4DA] bg-white p-2 shadow-lg z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Logado como</p>
                      <p className="text-sm font-bold text-[#1B4B3A] truncate">{displayName}</p>
                    </div>
                    <Link
                      to={role === "company" ? "/dashboardEmpresa" : "/dashboardUsuario"}
                      onClick={() => setMenuUsuarioAberto(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#4B5A55] hover:bg-[#F3F1EA] hover:text-[#1B4B3A] transition mt-1"
                    >
                      <UserRound className="h-4 w-4" />
                      Minha Conta
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair da conta
                    </button>
                  </div>
                )}
              </div>

              {/* Botão Hambúrguer Mobile */}
              <button
                type="button"
                onClick={() => setMenuMovelAberto((prev) => !prev)}
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-[#E7E4DA] text-[#1B4B3A] hover:bg-[#F3F1EA]"
                aria-label="Abrir menu"
              >
                {menuMovelAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </>
        ) : (
          /* ============================================================ */
          /* 2. HEADER PÚBLICO (NÃO LOGADO / VISITANTE EM TODAS AS PÁGINAS)*/
          /* ============================================================ */
          <>
            {/* Links Centrais Públicos: Início | Sobre Nós */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
              >
                Início
              </Link>
              <Link
                to="/#sobre"
                className="text-sm font-medium text-[#6B7670] hover:text-[#1B4B3A] transition"
              >
                Sobre Nós
              </Link>
            </nav>

            {/* Lado Direito Público: Entrar e Cadastrar */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-lg border border-[#D9D5C8] px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-[#1B4B3A] transition hover:bg-[#F3F1EA] no-underline"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="rounded-lg bg-emerald-500 px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 no-underline shadow-sm"
              >
                Cadastrar
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Menu Mobile quando logado */}
      {isUsuarioLogado && menuMovelAberto && (
        <div className="md:hidden border-t border-[#E7E4DA] bg-white px-4 py-3 space-y-2">
          <Link
            to={role === "company" ? "/dashboardEmpresa" : "/dashboardUsuario"}
            onClick={() => setMenuMovelAberto(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-[#4B5A55] hover:bg-[#F3F1EA] hover:text-[#1B4B3A]"
          >
            Início
          </Link>
          <Link
            to="/dashboardUsuario"
            onClick={() => setMenuMovelAberto(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-[#4B5A55] hover:bg-[#F3F1EA] hover:text-[#1B4B3A]"
          >
            Marketplace
          </Link>
          <Link
            to="/#sobre"
            onClick={() => setMenuMovelAberto(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-[#4B5A55] hover:bg-[#F3F1EA] hover:text-[#1B4B3A]"
          >
            Sobre Nós
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </header>
  );
}

