import React from 'react';

const ActionButtons = () => {
  return (
    <div className="flex gap-4 flex-wrap">
      <button className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600">
        Mover para Atendimento
      </button>
      <button className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500">
        Voltar para Fila (Último)
      </button>
      <button className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500">
        1º da Vez
      </button>
      <button className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500">
        Criar Orçamento
      </button>
      <button className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500">
        Mover para Fora da Fila
      </button>
      <button className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600">
        Retornar para Fila
      </button>
    </div>
  );
};

export default ActionButtons; 