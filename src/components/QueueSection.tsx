import { useState } from 'react';
import { useVendedores } from '@/hooks/useVendedores';
import EstatisticasDiarias from './EstatisticasDiarias';

interface Vendedor {
  id: string;
  nome: string;
  status: 'na_fila' | 'em_atendimento' | 'fora_da_fila';
  atendimentos: number;
  ordem_fila?: number;
}

export default function QueueSection() {
  const [selectedSeller, setSelectedSeller] = useState('');
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);
  const [orcamentoDescricao, setOrcamentoDescricao] = useState('');
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false);
  const [showSairFilaModal, setShowSairFilaModal] = useState(false);
  const [sairFilaDescricao, setSairFilaDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoltarFilaModal, setShowVoltarFilaModal] = useState(false);
  const [voltarFilaDescricao, setVoltarFilaDescricao] = useState('');
  const [tipoRetorno, setTipoRetorno] = useState<'primeiro' | 'ultimo'>('ultimo');
  const [shouldUpdateStats, setShouldUpdateStats] = useState(0);
  const [showForaFilaModal, setShowForaFilaModal] = useState(false);
  const [foraFilaDescricao, setForaFilaDescricao] = useState('');
  
  const { 
    vendedores, 
    loading, 
    adicionarAFila,
    moverParaAtendimento,
    voltarParaFila,
    primeiroVez,
    moverParaForaDaFila,
    retornarParaFila,
    criarOrcamento,
    sairDaFila,
  } = useVendedores();

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    // Adicionar toast ou notificação visual
  };

  const handleAddToQueue = async () => {
    try {
      setIsLoading(true);
      await adicionarAFila(selectedSeller);
    } catch (error) {
      handleError(error, 'Erro ao adicionar à fila');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendedorClick = (vendedor: Vendedor) => {
    setSelectedVendedor(vendedor);
  };

  const forceUpdateStats = () => {
    setShouldUpdateStats(prev => prev + 1);
  };

  const handleCriarOrcamento = async () => {
    if (!selectedVendedor || !orcamentoDescricao) return;
    await criarOrcamento(selectedVendedor.nome, orcamentoDescricao);
    forceUpdateStats();
    setOrcamentoDescricao('');
    setShowOrcamentoModal(false);
  };

  const handleSairDaFila = async () => {
    if (!selectedVendedor || !sairFilaDescricao) return;
    await sairDaFila(selectedVendedor.nome, sairFilaDescricao);
    setSairFilaDescricao('');
    setShowSairFilaModal(false);
    setSelectedVendedor(null);
  };

  // Funções auxiliares para verificar o status do vendedor selecionado
  const isNaFila = selectedVendedor?.status === 'na_fila';
  const isEmAtendimento = selectedVendedor?.status === 'em_atendimento';
  const isForaDaFila = selectedVendedor?.status === 'fora_da_fila';

  // Botão "Voltar para Fila (Último)"
  const handleVoltarParaFila = async () => {
    if (selectedVendedor && voltarFilaDescricao) {
      await voltarParaFila(selectedVendedor.nome, voltarFilaDescricao);
      forceUpdateStats();
      setShowVoltarFilaModal(false);
      setVoltarFilaDescricao('');
    }
  };

  // Botão "1º da Vez"
  const handlePrimeiroVez = async () => {
    if (selectedVendedor && voltarFilaDescricao) {
      await primeiroVez(selectedVendedor.nome, voltarFilaDescricao);
      forceUpdateStats();
      setShowVoltarFilaModal(false);
      setVoltarFilaDescricao('');
    }
  };

  // Botão "Mover Para Fora da Fila"
  const handleMoverParaForaDaFila = async () => {
    if (selectedVendedor && foraFilaDescricao) {
      await moverParaForaDaFila(selectedVendedor.nome, foraFilaDescricao);
      forceUpdateStats();
      setShowForaFilaModal(false);
      setForaFilaDescricao('');
    }
  };

  if (loading) {
    return <div className="text-white">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Seção de Seleção de Vendedor */}
      <div className="flex gap-4">
        <select 
          className="bg-slate-800 p-2 rounded text-white"
          value={selectedSeller}
          onChange={(e) => setSelectedSeller(e.target.value)}
        >
          <option value="">Selecione um vendedor</option>
          {vendedores
            .filter(v => v.status === 'fora_da_fila')
            .map(vendedor => (
              <option key={vendedor.id} value={vendedor.nome}>
                {vendedor.nome}
              </option>
            ))
          }
        </select>
        
        <button 
          onClick={handleAddToQueue}
          className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600 text-white"
          disabled={!selectedSeller}
        >
          Adicionar à Fila
        </button>
      </div>

      {/* Grid de Filas */}
      <div className="grid grid-cols-1 gap-6">
        {/* Três colunas de filas */}
        <div className="grid grid-cols-3 gap-6">
          {/* Na Fila */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-white">Na Fila</h2>
            <div className="space-y-2 min-h-[280px] max-h-[600px] overflow-y-auto">
              {vendedores
                .filter(s => s.status === 'na_fila')
                .map((vendedor, index) => (
                  <div 
                    key={vendedor.id} 
                    className={`bg-slate-700 p-3 rounded text-white cursor-pointer ${
                      selectedVendedor?.id === vendedor.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleVendedorClick(vendedor)}
                  >
                    <span className="font-bold mr-2">{vendedor.ordem_fila}º</span>
                    {vendedor.nome}
                  </div>
                ))}
            </div>
          </div>

          {/* Em Atendimento */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-white">Em Atendimento</h2>
            <div className="space-y-2 min-h-[280px] max-h-[600px] overflow-y-auto">
              {vendedores
                .filter(s => s.status === 'em_atendimento')
                .map(vendedor => (
                  <div 
                    key={vendedor.id} 
                    className={`bg-purple-600 p-3 rounded text-white cursor-pointer ${
                      selectedVendedor?.id === vendedor.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleVendedorClick(vendedor)}
                  >
                    {vendedor.nome}
                  </div>
                ))}
            </div>
          </div>

          {/* Fora da Fila */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-white">Fora da Fila</h2>
            <div className="space-y-2 min-h-[280px] max-h-[600px] overflow-y-auto">
              {vendedores
                .filter(s => s.status === 'fora_da_fila')
                .map(vendedor => (
                  <div 
                    key={vendedor.id} 
                    className={`bg-slate-700 p-3 rounded text-white cursor-pointer ${
                      selectedVendedor?.id === vendedor.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleVendedorClick(vendedor)}
                  >
                    {vendedor.nome}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 flex-wrap">
        {/* Botões para vendedor Na Fila */}
        <button 
          className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600 text-white disabled:opacity-50"
          onClick={() => selectedVendedor && moverParaAtendimento(selectedVendedor.nome)}
          disabled={!isNaFila}
        >
          Mover para Atendimento
        </button>

        <button 
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-500 text-white disabled:opacity-50"
          onClick={() => {
            if (selectedVendedor) setShowSairFilaModal(true);
          }}
          disabled={!isNaFila}
        >
          Sair da Fila
        </button>

        {/* Botões para vendedor Em Atendimento */}
        <button 
          className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 text-white disabled:opacity-50"
          onClick={() => {
            if (selectedVendedor) {
              setShowVoltarFilaModal(true);
              setTipoRetorno('ultimo');
            }
          }}
          disabled={!isEmAtendimento}
        >
          Voltar para Fila (Último)
        </button>

        <button 
          className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 text-white disabled:opacity-50"
          onClick={() => {
            if (selectedVendedor) {
              setShowVoltarFilaModal(true);
              setTipoRetorno('primeiro');
            }
          }}
          disabled={!isEmAtendimento}
        >
          1º da Vez
        </button>

        <button 
          className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 text-white disabled:opacity-50"
          onClick={() => {
            if (selectedVendedor) setShowOrcamentoModal(true);
          }}
          disabled={!isEmAtendimento}
        >
          Criar Orçamento
        </button>

        <button 
          className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 text-white disabled:opacity-50"
          onClick={() => {
            if (selectedVendedor) setShowForaFilaModal(true);
          }}
          disabled={!isEmAtendimento}
        >
          Mover para Fora da Fila
        </button>

        {/* Botão para vendedor Fora da Fila */}
        <button 
          className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600 text-white disabled:opacity-50"
          onClick={() => selectedVendedor && retornarParaFila(selectedVendedor.nome)}
          disabled={!isForaDaFila}
        >
          Retornar para Fila
        </button>
      </div>

      {/* Estatísticas Diárias - Agora abaixo dos botões */}
      <div className="w-full">
        <EstatisticasDiarias updateTrigger={shouldUpdateStats} />
      </div>

      {/* Modal de Orçamento */}
      {showOrcamentoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Criar Orçamento</h3>
            <textarea
              className="w-full p-2 rounded bg-slate-700 text-white mb-4"
              value={orcamentoDescricao}
              onChange={(e) => setOrcamentoDescricao(e.target.value)}
              placeholder="Descrição do orçamento..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
                onClick={() => setShowOrcamentoModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
                onClick={handleCriarOrcamento}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sair da Fila */}
      {showSairFilaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Sair da Fila</h3>
            <textarea
              className="w-full p-2 rounded bg-slate-700 text-white mb-4"
              value={sairFilaDescricao}
              onChange={(e) => setSairFilaDescricao(e.target.value)}
              placeholder="Descreva o motivo..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
                onClick={() => setShowSairFilaModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
                onClick={handleSairDaFila}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Voltar para Fila */}
      {showVoltarFilaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold text-white mb-4">
              {tipoRetorno === 'primeiro' ? 'Voltar como 1º da Vez' : 'Voltar para Fila'}
            </h3>
            <textarea
              className="w-full p-2 rounded bg-slate-700 text-white mb-4"
              value={voltarFilaDescricao}
              onChange={(e) => setVoltarFilaDescricao(e.target.value)}
              placeholder="Descreva o que aconteceu no atendimento..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
                onClick={() => {
                  setShowVoltarFilaModal(false);
                  setVoltarFilaDescricao('');
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
                onClick={() => {
                  if (tipoRetorno === 'primeiro') {
                    handlePrimeiroVez();
                  } else {
                    handleVoltarParaFila();
                  }
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adicionar o novo Modal Fora da Fila */}
      {showForaFilaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold text-white mb-4">
              Mover para Fora da Fila
            </h3>
            <textarea
              className="w-full p-2 rounded bg-slate-700 text-white mb-4"
              value={foraFilaDescricao}
              onChange={(e) => setForaFilaDescricao(e.target.value)}
              placeholder="Descreva o motivo..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
                onClick={() => {
                  setShowForaFilaModal(false);
                  setForaFilaDescricao('');
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
                onClick={handleMoverParaForaDaFila}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 