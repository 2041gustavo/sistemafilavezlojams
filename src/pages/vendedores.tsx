import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

interface Vendedor {
  id: string;
  nome: string;
}

export default function ListaVendedores() {
  const router = useRouter();
  const { user, loja } = useAuth();
  const [novoVendedor, setNovoVendedor] = useState('');
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);

  // Proteção da rota
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Carregar vendedores ao montar o componente
  const carregarVendedores = async () => {
    if (!loja) return;

    try {
      const { data, error } = await supabase
        .from(`vendedores_${loja}`)
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setVendedores(data || []);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
    }
  };

  // Adicionar novo vendedor
  const handleAdicionarVendedor = async () => {
    if (!loja || !novoVendedor.trim()) return;
    
    // Validar nome duplicado
    const vendedorExistente = vendedores.find(
      v => v.nome.toLowerCase() === novoVendedor.trim().toLowerCase()
    );
    
    if (vendedorExistente) {
      alert('Vendedor já cadastrado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from(`vendedores_${loja}`)
        .insert([{ 
          nome: novoVendedor.trim(),
          status: 'fora_da_fila'
        }])
        .select();

      if (error) throw error;
      
      setNovoVendedor('');
      await carregarVendedores();
    } catch (error) {
      console.error('Erro ao adicionar vendedor:', error);
    }
  };

  // Remover vendedor
  const handleRemoverVendedor = async () => {
    if (!loja || !selectedVendedor) return;

    try {
      const { error } = await supabase
        .from(`vendedores_${loja}`)
        .delete()
        .eq('id', selectedVendedor.id);

      if (error) throw error;
      
      setSelectedVendedor(null);
      await carregarVendedores();
    } catch (error) {
      console.error('Erro ao remover vendedor:', error);
    }
  };

  // Carregar vendedores ao montar o componente
  useEffect(() => {
    carregarVendedores();
  }, [loja]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl text-white font-bold mb-6">Lista de Vendedores</h1>
          
          {/* Formulário para adicionar vendedor */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="flex gap-4">
              <input
                type="text"
                value={novoVendedor}
                onChange={(e) => setNovoVendedor(e.target.value)}
                placeholder="Nome do vendedor"
                className="flex-1 p-2 rounded bg-slate-700 text-white border-slate-600"
              />
              <button
                onClick={handleAdicionarVendedor}
                disabled={!novoVendedor.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista de vendedores */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl text-white font-semibold mb-4">Vendedores Cadastrados</h2>
            <div className="space-y-2">
              {vendedores.map(vendedor => (
                <div
                  key={vendedor.id}
                  className={`p-3 rounded cursor-pointer flex justify-between items-center ${
                    selectedVendedor?.id === vendedor.id
                      ? 'bg-blue-600'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  onClick={() => setSelectedVendedor(vendedor)}
                >
                  <span className="text-white">{vendedor.nome}</span>
                  {selectedVendedor?.id === vendedor.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoverVendedor();
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 