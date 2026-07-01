import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Lock, Shield, Mail, LogOut, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  // Dados do formulário de perfil (apenas visualização, sem edição por enquanto)
  const [profileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
    roles: user?.roles || [],
  });

  // Estado para alteração de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('error', 'As senhas não conferem');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      addToast('error', 'A nova senha deve ter no mínimo 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      // Endpoint de alteração de senha (precisa ser criado no backend, mas simularemos aqui)
      // await api.put('/api/auth/change-password', {
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword,
      // });
      addToast('success', 'Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      addToast('error', 'Erro ao alterar senha', err.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const rolesMap: Record<string, { label: string; color: string }> = {
    ROLE_ADMIN: { label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
    ROLE_MANAGER: { label: 'Gerente', color: 'bg-blue-100 text-blue-700' },
    ROLE_USER: { label: 'Usuário', color: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="p-6 animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Meu Perfil</h1>

      {/* Avatar e nome */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{profileData.fullName || profileData.username}</h2>
            <p className="text-slate-500 flex items-center gap-1 mt-1">
              <Mail className="h-4 w-4" /> {profileData.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {profileData.roles.map((role) => (
                <span
                  key={role}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${rolesMap[role]?.color || 'bg-gray-100 text-gray-600'}`}
                >
                  {rolesMap[role]?.label || role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="h-4 w-4" />
            Informações
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Lock className="h-4 w-4" />
            Alterar Senha
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Nome completo</label>
                <p className="text-slate-800 font-medium">{profileData.fullName || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Nome de usuário</label>
                <p className="text-slate-800 font-medium">@{profileData.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                <p className="text-slate-800 font-medium">{profileData.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Permissões</label>
                <div className="flex flex-wrap gap-2">
                  {profileData.roles.map((role) => (
                    <span
                      key={role}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${rolesMap[role]?.color || 'bg-gray-100 text-gray-600'}`}
                    >
                      <Shield className="h-3 w-3" />
                      {rolesMap[role]?.label || role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha atual</label>
                <input
                  type="password"
                  required
                  className="input"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nova senha</label>
                <input
                  type="password"
                  required
                  className="input"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar nova senha</label>
                <input
                  type="password"
                  required
                  className="input"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Alterar Senha'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="btn btn-ghost text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}