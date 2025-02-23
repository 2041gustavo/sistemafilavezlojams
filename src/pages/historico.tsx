import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/auth-context';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/constants/database';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';

interface HistoricoItem {
  id: string;
  created_at: string;
  vendedor: string;
  acao: string;
  descricao?: string;
}

export default function Historico() {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loja } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const carregarHistorico = async () => {
    if (!loja) return;

    try {
      const { data, error } = await supabase
        .from(TABLES.HISTORICO(loja))
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistorico(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, [loja]);

  const formatarAcao = (acao: string) => {
    const acoes: { [key: string]: string } = {
      'movido_para_atendimento': 'Movido para Atendimento',
      'retornado_para_fila': 'Retornado para Fila',
      'primeiro_da_vez': 'Primeiro da Vez',
      'movido_para_fora_da_fila': 'Movido para Fora da Fila',
      'saiu_da_fila': 'Saiu da Fila',
      'orcamento_criado': 'Orçamento Criado'
    };
    return acoes[acao] || acao;
  };

  const exportarParaExcel = () => {
    const dadosFormatados = historico.map(item => ({
      'Data/Hora': format(new Date(item.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      'Vendedor': item.vendedor,
      'Ação': formatarAcao(item.acao),
      'Descrição': item.descricao || ''
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Histórico");
    XLSX.writeFile(wb, `historico_${loja}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
  };

  const exportarParaPDF = async () => {
    const doc = new jsPDF();
    const autoTable = (await import('jspdf-autotable')).default;
    
    const dadosFormatados = historico.map(item => [
      format(new Date(item.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      item.vendedor,
      formatarAcao(item.acao),
      item.descricao || ''
    ]);

    autoTable(doc, {
      head: [['Data/Hora', 'Vendedor', 'Ação', 'Descrição']],
      body: dadosFormatados,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    doc.save('historico.pdf');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Histórico de Movimentações</h1>
            <div className="space-x-4">
              <button
                onClick={exportarParaExcel}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
              >
                Exportar Excel
              </button>
              <button
                onClick={exportarParaPDF}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
              >
                Exportar PDF
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-white">Carregando...</div>
          ) : (
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left">Data/Hora</th>
                      <th className="px-6 py-3 text-left">Vendedor</th>
                      <th className="px-6 py-3 text-left">Ação</th>
                      <th className="px-6 py-3 text-left">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-600">
                    {historico.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700">
                        <td className="px-6 py-4">
                          {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4">{item.vendedor}</td>
                        <td className="px-6 py-4">{formatarAcao(item.acao)}</td>
                        <td className="px-6 py-4">{item.descricao || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 