import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/auth-context';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/constants/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

interface Orcamento {
  id: string;
  created_at: string;
  vendedor: string;
  descricao: string;
}

export default function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loja } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const carregarOrcamentos = async () => {
    if (!loja) return;

    try {
      const { data, error } = await supabase
        .from(TABLES.ORCAMENTOS(loja))
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrcamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportarParaExcel = () => {
    const dadosFormatados = orcamentos.map(orcamento => ({
      'Data/Hora': format(new Date(orcamento.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      'Vendedor': orcamento.vendedor,
      'Descrição': orcamento.descricao
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orçamentos");
    XLSX.writeFile(wb, `orcamentos_${loja}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
  };

  const exportarParaPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const autoTable = (await import('jspdf-autotable')).default;
      
      const dadosFormatados = orcamentos.map(orcamento => [
        format(new Date(orcamento.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
        orcamento.vendedor,
        orcamento.descricao
      ]);

      autoTable(doc, {
        head: [['Data/Hora', 'Vendedor', 'Descrição']],
        body: dadosFormatados,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 66, 66] }
      });

      doc.save(`orcamentos_${loja}_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  useEffect(() => {
    carregarOrcamentos();

    // Inscrever para atualizações em tempo real
    const channel = supabase
      .channel('orcamentos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.ORCAMENTOS(loja || '')
        },
        () => carregarOrcamentos()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [loja]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Orçamentos</h1>
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
                      <th className="px-6 py-3 text-left">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-600">
                    {orcamentos.map((orcamento) => (
                      <tr key={orcamento.id} className="hover:bg-slate-700">
                        <td className="px-6 py-4">
                          {format(new Date(orcamento.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4">{orcamento.vendedor}</td>
                        <td className="px-6 py-4">{orcamento.descricao}</td>
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