import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/constants/database';

interface Estatistica {
  vendedor: string;
  atendimentos: number;
  status: 'na_fila' | 'em_atendimento' | 'fora_da_fila';
}

interface Props {
  updateTrigger?: number;
}

export default function EstatisticasDiarias({ updateTrigger = 0 }: Props) {
  const [estatisticas, setEstatisticas] = useState<Estatistica[]>([]);
  const { loja } = useAuth();

  const carregarEstatisticas = useCallback(async () => {
    if (!loja) return;

    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      // Buscar dados em paralelo para melhor performance
      const [statsResponse, vendedoresResponse] = await Promise.all([
        supabase
          .from(TABLES.ESTATISTICAS(loja))
          .select('vendedor, atendimentos')
          .eq('data', hoje),
        
        supabase
          .from(TABLES.VENDEDORES(loja))
          .select('nome, status')
      ]);

      if (statsResponse.error) throw statsResponse.error;
      if (vendedoresResponse.error) throw vendedoresResponse.error;

      const novasEstatisticas = vendedoresResponse.data.map(vendedor => ({
        vendedor: vendedor.nome,
        atendimentos: statsResponse.data?.find(s => s.vendedor === vendedor.nome)?.atendimentos || 0,
        status: vendedor.status
      }));

      novasEstatisticas.sort((a, b) => b.atendimentos - a.atendimentos);
      setEstatisticas(novasEstatisticas);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [loja]);

  // Atualizar quando o trigger mudar
  useEffect(() => {
    carregarEstatisticas();
  }, [updateTrigger, carregarEstatisticas]);

  // Manter a atualização em tempo real também
  useEffect(() => {
    carregarEstatisticas();

    const channel = supabase
      .channel('realtime_stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.ESTATISTICAS(loja || '')
        },
        () => carregarEstatisticas()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [loja, carregarEstatisticas]);

  if (!loja || estatisticas.length === 0) return null;

  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Estatísticas Diárias</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {estatisticas.map((estatistica) => (
          <div 
            key={estatistica.vendedor}
            className={`p-4 rounded-lg ${
              estatistica.status === 'em_atendimento' 
                ? 'bg-purple-600' 
                : 'bg-slate-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                {estatistica.vendedor}
              </h3>
              <span className="text-white font-bold">
                {estatistica.atendimentos} atendimento(s)
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              Status: {estatistica.status.replace(/_/g, ' ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 