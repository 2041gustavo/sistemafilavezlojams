import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { TABLES } from '@/constants/database';

interface Vendedor {
  id: string;
  nome: string;
  status: 'na_fila' | 'em_atendimento' | 'fora_da_fila';
  atendimentos: number;
  ordem_fila?: number;
}

export function useVendedores() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const { loja } = useAuth();

  const carregarVendedores = async () => {
    if (!loja) return;
    
    try {
      const { data, error } = await supabase
        .from(TABLES.VENDEDORES(loja))
        .select('*')
        .order('ordem_fila', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setVendedores(data || []);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para registrar ação no histórico
  const registrarHistorico = async (vendedor: string, acao: string, descricao?: string) => {
    if (!loja) return;

    try {
      await supabase
        .from(`historico_${loja}`)
        .insert([{ vendedor, acao, descricao }]);
    } catch (error) {
      console.error('Erro ao registrar histórico:', error);
    }
  };

  // Função para atualizar estatísticas
  const atualizarEstatisticas = async (vendedor: string) => {
    if (!loja) return;

    const hoje = new Date().toISOString().split('T')[0];
    
    try {
      // 1. Primeiro, buscar estatística atual do dia
      const { data: estatisticaAtual } = await supabase
        .from(TABLES.ESTATISTICAS(loja))
        .select('atendimentos')
        .match({
          vendedor: vendedor,
          data: hoje
        })
        .single();

      // 2. Calcular novo valor de atendimentos
      const atendimentosAtuais = estatisticaAtual?.atendimentos || 0;
      const novosAtendimentos = atendimentosAtuais + 1;

      // 3. Atualizar ou inserir estatística
      const { error } = await supabase
        .from(TABLES.ESTATISTICAS(loja))
        .upsert({ 
          vendedor, 
          data: hoje,
          atendimentos: novosAtendimentos
        }, {
          onConflict: 'vendedor,data'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  };

  // Funções de movimentação
  const moverParaAtendimento = async (vendedor: string) => {
    if (!loja) return;

    try {
      await supabase
        .from(TABLES.VENDEDORES(loja))
        .update({ 
          status: 'em_atendimento',
          ordem_fila: null 
        })
        .eq('nome', vendedor);

      await registrarHistorico(vendedor, 'movido_para_atendimento');
      await reordenarFila();
      await carregarVendedores();
    } catch (error) {
      console.error('Erro ao mover para atendimento:', error);
    }
  };

  const voltarParaFila = async (vendedor: string, descricao: string) => {
    if (!loja) return;

    try {
      // Pegar a maior ordem atual
      const { data: maxOrdem } = await supabase
        .from(`vendedores_${loja}`)
        .select('ordem_fila')
        .eq('status', 'na_fila')
        .order('ordem_fila', { ascending: false })
        .limit(1);

      const novaOrdem = (maxOrdem?.[0]?.ordem_fila || 0) + 1;

      await supabase
        .from(`vendedores_${loja}`)
        .update({ 
          status: 'na_fila',
          ordem_fila: novaOrdem
        })
        .eq('nome', vendedor);

      await registrarHistorico(vendedor, 'retornado_para_fila', descricao);
      await atualizarEstatisticas(vendedor);
      await reordenarFila();
      await carregarVendedores();
    } catch (error) {
      console.error('Erro ao voltar para fila:', error);
    }
  };

  const primeiroVez = async (vendedor: string, descricao: string) => {
    if (!loja) return;

    try {
      // 1. Primeiro, pegar todos os vendedores na fila
      const { data: vendedoresNaFila } = await supabase
        .from(`vendedores_${loja}`)
        .select('*')
        .eq('status', 'na_fila')
        .order('ordem_fila', { ascending: true });

      if (vendedoresNaFila) {
        // 2. Incrementar a ordem de cada vendedor na fila
        for (const v of vendedoresNaFila) {
          await supabase
            .from(`vendedores_${loja}`)
            .update({ ordem_fila: (v.ordem_fila || 0) + 1 })
            .eq('id', v.id);
        }
      }

      // 3. Colocar o vendedor selecionado como primeiro
      await supabase
        .from(`vendedores_${loja}`)
        .update({ 
          status: 'na_fila',
          ordem_fila: 1 // será o primeiro da fila
        })
        .eq('nome', vendedor);

      // Registrar histórico
      await registrarHistorico(vendedor, 'primeiro_da_vez', descricao);
      
      // Atualizar atendimentos
      await atualizarEstatisticas(vendedor);
      
      // Reordenar para garantir sequência correta
      await reordenarFila();
      await carregarVendedores();
    } catch (error) {
      console.error('Erro ao marcar como primeiro da vez:', error);
    }
  };

  const moverParaForaDaFila = async (vendedor: string, descricao: string) => {
    if (!loja) return;

    try {
      await supabase
        .from(TABLES.VENDEDORES(loja))
        .update({ status: 'fora_da_fila' })
        .eq('nome', vendedor);

      await registrarHistorico(vendedor, 'movido_para_fora_da_fila', descricao);
      await atualizarEstatisticas(vendedor);
      await carregarVendedores();
    } catch (error) {
      console.error('Erro ao mover para fora da fila:', error);
    }
  };

  const retornarParaFila = async (vendedor: string) => {
    if (!loja) return;

    try {
      // 1. Pegar a maior ordem atual
      const { data: maxOrdem } = await supabase
        .from(`vendedores_${loja}`)
        .select('ordem_fila')
        .eq('status', 'na_fila')
        .order('ordem_fila', { ascending: false })
        .limit(1);

      const novaOrdem = (maxOrdem?.[0]?.ordem_fila || 0) + 1;

      // 2. Atualizar status e ordem do vendedor
      await supabase
        .from(`vendedores_${loja}`)
        .update({ 
          status: 'na_fila',
          ordem_fila: novaOrdem
        })
        .eq('nome', vendedor);

      await registrarHistorico(vendedor, 'retornado_para_fila');
      // 3. Reordenar a fila para garantir sequência correta
      await reordenarFila();
      await carregarVendedores();
    } catch (error) {
      console.error('Erro ao retornar para fila:', error);
    }
  };

  const criarOrcamento = async (vendedor: string, descricao: string) => {
    if (!loja) return;

    try {
      // 1. Criar o orçamento
      await supabase
        .from(TABLES.ORCAMENTOS(loja))
        .insert([{ 
          vendedor, 
          descricao,
          created_at: new Date().toISOString() // Adicionar data/hora
        }]);

      // 2. Pegar a maior ordem atual da fila
      const { data: maxOrdem } = await supabase
        .from(TABLES.VENDEDORES(loja))
        .select('ordem_fila')
        .eq('status', 'na_fila')
        .order('ordem_fila', { ascending: false })
        .limit(1);

      const novaOrdem = (maxOrdem?.[0]?.ordem_fila || 0) + 1;

      // 3. Mover vendedor para último da fila
      await supabase
        .from(TABLES.VENDEDORES(loja))
        .update({ 
          status: 'na_fila',
          ordem_fila: novaOrdem
        })
        .eq('nome', vendedor);

      // 4. Registrar no histórico
      await registrarHistorico(vendedor, 'orcamento_criado', descricao);
      
      // 5. Atualizar estatísticas (adicionar +1 atendimento)
      await atualizarEstatisticas(vendedor);
      
      // 6. Reordenar fila e atualizar
      await reordenarFila();
      await carregarVendedores();
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  };

  const adicionarAFila = async (nome: string) => {
    if (!loja || !nome) return;

    try {
      // 1. Pegar a maior ordem atual da fila
      const { data: maxOrdem } = await supabase
        .from(TABLES.VENDEDORES(loja))
        .select('ordem_fila')
        .eq('status', 'na_fila')
        .order('ordem_fila', { ascending: false })
        .limit(1);

      const novaOrdem = (maxOrdem?.[0]?.ordem_fila || 0) + 1;

      // 2. Atualizar o vendedor com a nova ordem
      const { error } = await supabase
        .from(TABLES.VENDEDORES(loja))
        .update({ 
          status: 'na_fila',
          ordem_fila: novaOrdem
        })
        .eq('nome', nome);

      if (error) throw error;

      // 3. Registrar no histórico
      await registrarHistorico(nome, 'adicionado_a_fila');
      
      // 4. Recarregar vendedores
      await carregarVendedores();

    } catch (error) {
      console.error('Erro ao adicionar vendedor à fila:', error);
      throw error;
    }
  };

  const sairDaFila = async (vendedor: string, descricao: string) => {
    if (!loja) return;

    try {
      await supabase
        .from(`vendedores_${loja}`)
        .update({ 
          status: 'fora_da_fila',
          ordem_fila: null
        })
        .eq('nome', vendedor);

      await registrarHistorico(vendedor, 'saiu_da_fila', descricao);
      // Reordenar após remover vendedor da fila
      await reordenarFila();
      await carregarVendedores();
    } catch (error) {
      console.error('Erro ao sair da fila:', error);
    }
  };

  const reordenarFila = async () => {
    if (!loja) return;
    
    try {
      const { data: vendedoresNaFila } = await supabase
        .from(`vendedores_${loja}`)
        .select('*')
        .eq('status', 'na_fila')
        .order('ordem_fila', { ascending: true });

      if (!vendedoresNaFila) return;

      // Reordena sequencialmente começando do 1
      for (let i = 0; i < vendedoresNaFila.length; i++) {
        await supabase
          .from(`vendedores_${loja}`)
          .update({ ordem_fila: i + 1 })
          .eq('id', vendedoresNaFila[i].id);
      }
    } catch (error) {
      console.error('Erro ao reordenar fila:', error);
    }
  };

  useEffect(() => {
    carregarVendedores();
  }, [loja]);

  return {
    vendedores,
    loading,
    adicionarAFila,
    moverParaAtendimento,
    voltarParaFila,
    primeiroVez,
    moverParaForaDaFila,
    retornarParaFila,
    criarOrcamento,
    carregarVendedores,
    sairDaFila,
    reordenarFila,
  };
} 