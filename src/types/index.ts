// Criar arquivo para tipos compartilhados
export interface Vendedor {
  id: string;
  nome: string;
  status: 'na_fila' | 'em_atendimento' | 'fora_da_fila';
  atendimentos: number;
  ordem_fila?: number;
}

export interface Estatistica {
  vendedor: string;
  atendimentos: number;
  status: 'na_fila' | 'em_atendimento' | 'fora_da_fila';
} 