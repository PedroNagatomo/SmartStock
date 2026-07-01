import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Package, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Senhas não conferem');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        fullName: form.fullName,
      });
      navigate('/login', { state: { message: 'Cadastro realizado com sucesso! Faça login.' } });
    } catch (err: any) {
      setError(err.response?.data || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Criar Conta</h1>
          <p className="text-slate-500 mt-1">SmartStock</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {error && (
            <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
              <input
                type="text"
                required
                className="input"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Usuário</label>
              <input
                type="text"
                required
                className="input"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                className="input"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <input
                type="password"
                required
                className="input"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar Senha</label>
              <input
                type="password"
                required
                className="input"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-6"
          >
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Já tem conta?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}