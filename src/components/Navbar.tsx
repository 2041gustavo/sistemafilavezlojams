import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const LOJA_NOMES = {
  'afonso_pena': 'AFONSO PENA',
  'julio': 'JULIO DE CASTILHO',
  'prime': 'PRIME',
  'norte_sul': 'NORTE SUL',
  'maracaju': 'MARACAJU'
} as const;

export default function Navbar() {
  const { signOut, loja } = useAuth();
  const [theme, setTheme] = useState('dark');
  const router = useRouter();

  const getNomeLoja = () => {
    if (!loja) return '';
    return LOJA_NOMES[loja as keyof typeof LOJA_NOMES] || '';
  };

  const getPreposicao = () => {
    return loja === 'norte_sul' ? 'ao' : 'à';
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    // Implementar a lógica de mudança de tema aqui
  };

  return (
    <nav className="bg-slate-800 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-white">
            Bem-vindo {getPreposicao()} {getNomeLoja()}
          </h1>
          
          <div className="flex gap-6">
            <Link 
              href="/dashboard" 
              className={`text-blue-400 hover:text-blue-300 ${
                router.pathname === '/dashboard' ? 'text-blue-300' : ''
              }`}
            >
              Gerenciamento de Fila
            </Link>
            <Link 
              href="/orcamentos" 
              className={`text-blue-400 hover:text-blue-300 ${
                router.pathname === '/orcamentos' ? 'text-blue-300' : ''
              }`}
            >
              Orçamentos
            </Link>
            <Link 
              href="/historico" 
              className={`text-blue-400 hover:text-blue-300 ${
                router.pathname === '/historico' ? 'text-blue-300' : ''
              }`}
            >
              Histórico
            </Link>
            <Link 
              href="/geral-mes" 
              className={`text-blue-400 hover:text-blue-300 ${
                router.pathname === '/geral-mes' ? 'text-blue-300' : ''
              }`}
            >
              Geral Mês
            </Link>
            <Link 
              href="/vendedores" 
              className={`text-blue-400 hover:text-blue-300 ${
                router.pathname === '/vendedores' ? 'text-blue-300' : ''
              }`}
            >
              Lista de Vendedores
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="text-yellow-400 hover:text-yellow-300"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button 
            onClick={handleSignOut}
            className="text-red-400 hover:text-red-300"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
} 