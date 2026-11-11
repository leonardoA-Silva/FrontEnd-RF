import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Building2, ShieldCheck, UserPlus, Package, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { listarUsuariosAdmin, type UsuarioPerfil } from "../../api/services";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";

export default function AdminOverviewSection() {
  const [users, setUsers] = useState<UsuarioPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const response = await listarUsuariosAdmin();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("Não foi possível carregar os dados administrativos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const umMesAtras = Date.now() - 30 * 24 * 60 * 60 * 1000;

  function contar(role: string) {
    const lista = users.filter((u) => u.role === role);
    return {
      total: lista.length,
      novos: lista.filter((u) => {
        const d = u.createdIn || u.created_in;
        return d ? new Date(d).getTime() >= umMesAtras : false;
      }).length,
    };
  }

  const compradores = contar("user");
  const empresas = contar("company");
  const admins = contar("admin");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-block text-xs uppercase tracking-wider font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full mb-1">
            Painel do Administrador
          </span>
          <h2 className={s.subtitle}>Visão geral da plataforma</h2>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className={`${s.secondary} flex items-center gap-2 self-start`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Atualizar números
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 p-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Cards de Métricas Admin */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`${s.panel} relative overflow-hidden`}>
          <div className="flex items-center justify-between text-tinta-suave">
            <span className="text-sm font-medium">Compradores / Usuários</span>
            <Users size={20} className="text-emerald-700" />
          </div>
          <strong className="mt-2 block text-3xl font-semibold text-tinta">
            {loading ? "..." : compradores.total}
          </strong>
          <span className="mt-1 block text-xs text-tinta-suave">
            +{compradores.novos} nos últimos 30 dias
          </span>
        </div>

        <div className={`${s.panel} relative overflow-hidden`}>
          <div className="flex items-center justify-between text-tinta-suave">
            <span className="text-sm font-medium">Empresas Geradoras</span>
            <Building2 size={20} className="text-emerald-700" />
          </div>
          <strong className="mt-2 block text-3xl font-semibold text-tinta">
            {loading ? "..." : empresas.total}
          </strong>
          <span className="mt-1 block text-xs text-tinta-suave">
            +{empresas.novos} nos últimos 30 dias
          </span>
        </div>

        <div className={`${s.panel} relative overflow-hidden`}>
          <div className="flex items-center justify-between text-tinta-suave">
            <span className="text-sm font-medium">Administradores</span>
            <ShieldCheck size={20} className="text-emerald-700" />
          </div>
          <strong className="mt-2 block text-3xl font-semibold text-tinta">
            {loading ? "..." : admins.total}
          </strong>
          <span className="mt-1 block text-xs text-tinta-suave">
            +{admins.novos} nos últimos 30 dias
          </span>
        </div>
      </div>

      {/* Ações de Gestão */}
      <div className={`${s.panel} space-y-4`}>
        <h3 className="font-semibold text-lg text-tinta">Gestão do Reaproveita Franca</h3>
        <p className="text-sm text-tinta-suave">
          Acesse os módulos administrativos para gerenciar usuários, cadastrar novos admins ou monitorar anúncios de toda a plataforma.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 pt-2">
          <Link
            to="/admin/novo-admin"
            className="flex items-center justify-between p-4 rounded-xl border border-cinza-linha hover:border-emerald-700 bg-papel-suave transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                <UserPlus size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm text-tinta group-hover:text-emerald-800">Novo Admin</p>
                <span className="text-xs text-tinta-suave">Cadastrar administrador</span>
              </div>
            </div>
            <ArrowRight size={18} className="text-tinta-suave group-hover:text-emerald-800 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/usuarios"
            className="flex items-center justify-between p-4 rounded-xl border border-cinza-linha hover:border-emerald-700 bg-papel-suave transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Users size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm text-tinta group-hover:text-emerald-800">Gerenciar Usuários</p>
                <span className="text-xs text-tinta-suave">Editar e remover contas</span>
              </div>
            </div>
            <ArrowRight size={18} className="text-tinta-suave group-hover:text-emerald-800 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/anuncios"
            className="flex items-center justify-between p-4 rounded-xl border border-cinza-linha hover:border-emerald-700 bg-papel-suave transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Package size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm text-tinta group-hover:text-emerald-800">Gerenciar Anúncios</p>
                <span className="text-xs text-tinta-suave">Consultar todos materiais</span>
              </div>
            </div>
            <ArrowRight size={18} className="text-tinta-suave group-hover:text-emerald-800 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
