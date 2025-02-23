import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(username, password);
    } catch (error: any) {
      setError('Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-lg w-96">
        <h1 className="text-2xl text-white font-bold mb-6">Login</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-slate-700 text-white border-slate-600"
              required
              placeholder="Ex: afonsopena"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-slate-700 text-white border-slate-600"
              required
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
          >
            Entrar
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-400">
          <p>Usuários disponíveis:</p>
          <ul className="list-disc list-inside mt-2">
            <li>afonsopena</li>
            <li>juliodecastilho</li>
            <li>prime</li>
            <li>nortesul</li>
            <li>maracaju</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 