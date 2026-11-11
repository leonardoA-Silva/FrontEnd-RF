import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Search, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  X, 
  Check, 
  ShieldAlert, 
  AlertCircle, 
  Building2, 
  UserCheck, 
  Shield 
} from "lucide-react";
import { listarUsuariosAdmin, atualizarUsuarioAdmin, excluirUsuarioAdmin, type UsuarioPerfil } from "../../api/services";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";

const filters = [
  { id: "all", label: "Todos" },
  { id: "user", label: "Comprador / Usuário" },
  { id: "company", label: "Empresa" },
  { id: "admin", label: "Administrador" },
];

export default function AdminUsersPage() {
  const { user: currentUser } = useLoggedUser();
  const [users, setUsers] = useState<UsuarioPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Edição
  const [editing, setEditing] = useState<{ id: string; name: string; cellphone: string } | null>(null);
  
  // Confirmação de exclusão
  const [deletingUser, setDeletingUser] = useState<UsuarioPerfil | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const response = await listarUsuariosAdmin();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  }

  function getInitials(name: string) {
    const parts = (name || "").trim().split(" ");
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase() || "U";
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "admin":
        return { label: "Admin", bg: "bg-purple-100 text-purple-800 border-purple-200", Icon: Shield };
      case "company":
        return { label: "Empresa", bg: "bg-blue-100 text-blue-800 border-blue-200", Icon: Building2 };
      default:
        return { label: "Comprador", bg: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: UserCheck };
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || saving) return;

    const cleanPhone = editing.cellphone.replace(/\D/g, "");
    if (!editing.name.trim()) {
      alert("Por favor, preencha o nome do usuário.");
      return;
    }
    if (!/^\d{10,11}$/.test(cleanPhone)) {
      alert("Informe um telefone válido com DDD (10 ou 11 dígitos).");
      return;
    }

    try {
      setSaving(true);
      await atualizarUsuarioAdmin(editing.id, {
        name: editing.name.trim(),
        cellphone: cleanPhone,
      });

      setUsers((prev) =>
        prev.map((item) =>
          item.id === editing.id
            ? { ...item, name: editing.name.trim(), cellphone: cleanPhone }
            : item
        )
      );
      setEditing(null);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      alert(msg || "Não foi possível atualizar o usuário.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingUser || saving) return;

    if (deletingUser.id === currentUser?.id) {
      alert("Você não pode excluir sua própria conta por aqui.");
      setDeletingUser(null);
      return;
    }

    try {
      setSaving(true);
      await excluirUsuarioAdmin(deletingUser.id);
      setUsers((prev) => prev.filter((item) => item.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      alert(msg || "Não foi possível excluir o usuário. Ele pode possuir anúncios ou registros vinculados.");
    } finally {
      setSaving(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchRole = filter === "all" || u.role === filter;
      const matchSearch =
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.cellphone || "").includes(q);
      return matchRole && matchSearch;
    });
  }, [users, filter, search]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/dashboardUsuario"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 hover:text-emerald-950 transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Voltar ao Painel
          </Link>
          <h1 className={s.title}>Gerenciar Usuários</h1>
          <p className={s.copy}>Encontre, altere e organize as contas cadastradas na plataforma.</p>
        </div>
        <Link to="/admin/novo-admin" className={`${s.button} self-start`}>
          + Novo Administrador
        </Link>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className={`${s.panel} space-y-4`}>
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          {/* Tabs de Filtro */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-papel-suave border border-cinza-linha rounded-xl">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  filter === f.id
                    ? "bg-white text-emerald-900 shadow-sm font-semibold"
                    : "text-tinta-suave hover:text-tinta"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Campo de Busca */}
          <div className="relative min-w-[260px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta-suave" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${s.input} pl-10 h-10 py-1 text-sm`}
            />
          </div>
        </div>

        {/* Totalizador */}
        <div className="text-xs text-tinta-suave flex items-center justify-between border-t border-cinza-linha pt-3">
          <span>Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> contas</span>
          {loading && <span className="text-emerald-700 animate-pulse">Atualizando lista...</span>}
        </div>
      </div>

      {/* Grid de Usuários */}
      {filteredUsers.length === 0 && !loading ? (
        <div className={`${s.panel} text-center py-12 space-y-3`}>
          <Users size={36} className="mx-auto text-tinta-suave opacity-40" />
          <h3 className="font-semibold text-tinta">Nenhum usuário encontrado</h3>
          <p className="text-sm text-tinta-suave">Tente ajustar seus termos de pesquisa ou filtros.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((item) => {
            const badge = getRoleBadge(item.role);
            const BadgeIcon = badge.Icon;
            const isSelf = item.id === currentUser?.id;

            return (
              <div
                key={item.id}
                className={`${s.panel} flex flex-col justify-between hover:border-emerald-700/40 transition-all border border-cinza-linha`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {getInitials(item.name)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-semibold text-base text-tinta truncate" title={item.name}>
                          {item.name}
                        </h2>
                        <p className="text-xs text-tinta-suave truncate" title={item.email}>
                          {item.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-tinta-suave mt-3 pt-3 border-t border-cinza-linha">
                    <p className="flex justify-between">
                      <span>Telefone:</span>
                      <strong className="text-tinta font-mono">{item.cellphone || "Não informado"}</strong>
                    </p>
                    {item.cpf && (
                      <p className="flex justify-between">
                        <span>CPF:</span>
                        <strong className="text-tinta font-mono">{item.cpf}</strong>
                      </p>
                    )}
                    {item.cnpj && (
                      <p className="flex justify-between">
                        <span>CNPJ:</span>
                        <strong className="text-tinta font-mono">{item.cnpj}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-cinza-linha flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${badge.bg}`}>
                    <BadgeIcon size={12} />
                    {badge.label}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Editar dados"
                      onClick={() =>
                        setEditing({
                          id: item.id,
                          name: item.name || "",
                          cellphone: item.cellphone || "",
                        })
                      }
                      className="p-1.5 rounded-lg text-tinta-suave hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                    >
                      <Edit3 size={17} />
                    </button>

                    <button
                      type="button"
                      title={isSelf ? "Não é possível excluir seu próprio usuário" : "Excluir conta"}
                      disabled={isSelf}
                      onClick={() => setDeletingUser(item)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSelf
                          ? "opacity-30 cursor-not-allowed text-tinta-suave"
                          : "text-tinta-suave hover:text-red-700 hover:bg-red-50"
                      }`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Edição */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-cinza-linha animate-in fade-in">
            <div className="flex items-center justify-between border-b border-cinza-linha pb-3">
              <h3 className="font-semibold text-lg text-tinta">Editar Usuário</h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-tinta-suave hover:text-tinta p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className={s.label}>Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className={s.input}
                  disabled={saving}
                />
              </div>

              <div>
                <label className={s.label}>Telefone (com DDD)</label>
                <input
                  type="tel"
                  required
                  value={editing.cellphone}
                  onChange={(e) => setEditing({ ...editing, cellphone: e.target.value })}
                  className={s.input}
                  placeholder="Ex: 16999998888"
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                  className={s.secondary}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`${s.button} flex items-center gap-2`}
                >
                  <Check size={16} />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-100 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-700">
              <div className="p-3 rounded-full bg-red-100">
                <ShieldAlert size={24} />
              </div>
              <h3 className="font-semibold text-lg">Confirmar Exclusão</h3>
            </div>

            <p className="text-sm text-tinta-suave">
              Tem certeza que deseja excluir a conta de{" "}
              <strong className="text-tinta">{deletingUser.name}</strong> ({deletingUser.email})?
              Esta ação removerá permanentemente o acesso desse usuário à plataforma.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={saving}
                className={s.secondary}
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-red-700 hover:bg-red-800 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                {saving ? "Excluindo..." : "Sim, Excluir Conta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
