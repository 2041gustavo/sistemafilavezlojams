import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/constants/database';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Navbar from '@/components/Navbar';

interface EstatisticaMensal {
  vendedor: string;
  total_atendimentos: number;
}

export default function GeralMes() {
  const { user, loja } = useAuth();
  const router = useRouter();
  const [ano, setAno] = useState(2025);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [estatisticas, setEstatisticas] = useState<EstatisticaMensal[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);

  // Lista de anos (2025 até 2099)
  const anos = Array.from(
    { length: 75 }, // 75 anos (2025 até 2099)
    (_, i) => 2025 + i
  );

  // Lista de meses
  const meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
  ];

  // Adicionar verificação de autenticação
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const carregarEstatisticas = async () => {
    if (!loja) return;
    
    setLoading(true);
    try {
      // Formatar datas para o início e fim do mês
      const dataInicio = `${ano}-${mes.toString().padStart(2, '0')}-01`;
      const dataFim = `${ano}-${mes.toString().padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`;

      // Buscar estatísticas do período
      const { data, error } = await supabase
        .from(TABLES.ESTATISTICAS(loja))
        .select('vendedor, atendimentos')
        .gte('data', dataInicio)
        .lte('data', dataFim);

      if (error) throw error;

      // Agrupar atendimentos por vendedor
      const estatisticasAgrupadas = data?.reduce((acc, curr) => {
        const vendedor = curr.vendedor;
        if (!acc[vendedor]) {
          acc[vendedor] = { vendedor, total_atendimentos: 0 };
        }
        acc[vendedor].total_atendimentos += curr.atendimentos;
        return acc;
      }, {} as Record<string, EstatisticaMensal>);

      // Converter para array e ordenar por total de atendimentos
      const estatisticasOrdenadas = Object.values(estatisticasAgrupadas || {})
        .sort((a, b) => b.total_atendimentos - a.total_atendimentos);

      setEstatisticas(estatisticasOrdenadas);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas quando mudar ano, mês ou loja
  useEffect(() => {
    carregarEstatisticas();
  }, [ano, mes, loja]);

  // Exportar para Excel
  const exportarParaExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(estatisticas);
      XLSX.utils.book_append_sheet(wb, ws, 'Estatísticas');
      XLSX.writeFile(wb, `estatisticas_${loja}_${mes}_${ano}.xlsx`);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      // Adicionar notificação de erro para o usuário
    }
  };

  // Exportar para PDF
  const exportarParaPDF = async () => {
    try {
      const doc = new jsPDF();
      const autoTable = (await import('jspdf-autotable')).default;
      
      autoTable(doc, {
        head: [['Vendedor', 'Total de Atendimentos']],
        body: estatisticas.map(est => [
          est.vendedor,
          est.total_atendimentos
        ]),
        styles: { fontSize: 8 }, // Melhorar formatação
        headStyles: { fillColor: [66, 66, 66] }
      });

      doc.save(`estatisticas_${loja}_${mes}_${ano}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      // Adicionar notificação de erro para o usuário
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Relatório Geral por Mês</h1>
          <div className="flex gap-4">
            <button
              onClick={async () => {
                setExportando(true);
                await exportarParaExcel();
                setExportando(false);
              }}
              disabled={exportando || loading || estatisticas.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition-colors disabled:opacity-50"
            >
              {exportando ? 'Exportando...' : 'Exportar Excel'}
            </button>
            <button
              onClick={async () => {
                setExportando(true);
                await exportarParaPDF();
                setExportando(false);
              }}
              disabled={exportando || loading || estatisticas.length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {exportando ? 'Exportando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <div className="flex gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ano
              </label>
              <select
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className="bg-slate-700 text-white p-2 rounded w-32"
              >
                {anos.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mês
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="bg-slate-700 text-white p-2 rounded w-40"
              >
                {meses.map(m => (
                  <option key={m.valor} value={m.valor}>{m.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white">Carregando...</div>
            </div>
          ) : estatisticas.length === 0 ? (
            <div className="text-center text-gray-400 italic py-8">
              Nenhum atendimento registrado neste mês
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {estatisticas.map((estatistica) => (
                <div 
                  key={estatistica.vendedor}
                  className="bg-slate-700 p-6 rounded-lg shadow transition-all hover:bg-slate-600"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">
                      {estatistica.vendedor}
                    </h3>
                    <span className="text-white font-bold text-lg">
                      {estatistica.total_atendimentos} atendimento(s)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 