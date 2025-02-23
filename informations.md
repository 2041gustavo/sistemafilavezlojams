Quero construir um aplicativo de fila da vez em next.js 

# 1. **Visão Geral do Aplicativo**

O aplicativo é uma ferramenta de gestão que permite controlar o fluxo de vendedores em um ambiente de atendimento. Ele possui 3 listas principais:

- **Na Fila**: Lista de vendedores aguardando para entrar em atendimento.
- **Em Atendimento**: Lista de vendedores que estão atualmente em atendimento.
- **Fora da Fila**: Lista de vendedores que não estão na fila nem em atendimento.

O aplicativo permite adicionar novos vendedores à Na Fila, selecionar vendedores específicos, mover vendedores entre as listas e gerenciar o status de cada um.

# 2. Componentes da Interface

## 1. Barra de Navegação (Navbar)
// Botões da barra de navegação
- "Gerenciamento de Fila" (Página inicial)
  • Função: Navega para a página principal de gerenciamento de fila

- "Orçamentos"
  • Função: Navega para a página de histórico de orçamentos

- "Histórico"
  • Função: Navega para a página de registro de todas as ações

- "Lista de Vendedores"
  • Função: Navega para a página de gerenciamento de vendedores

- "Geral Mês"
  • Função: Navega para a página de estatísticas mensais

- Botão Tema (Claro/Escuro)
  • Função: Alterna entre os temas claro e escuro

- Botão Logout
  • Função: Encerra a sessão do usuário

### 1.1 Página Principal: Gerenciamento de Fila
**Caixa de Seleção de Vendedores**:
**-Descrição**: Campo onde o usuário pode inserir o nome de um novo vendedor.
**-Função**: Captura o nome do vendedor a ser adicionado à Na Fila.
#### Lista "Na Fila":
**-Descrição**: Exibe os vendedores que estão aguardando atendimento.
**-Função**: Permite selecionar um vendedor para movimentação.
#### Lista "Em Atendimento": 
**-Descrição**: Exibe os vendedores que estão em atendimento.
**-Função**: Permite selecionar um vendedor para movimentação.
#### Lista "Fora da Fila"**:
-Descrição** : Exibe os vendedores que estão fora da fila.
**-Função**: Permite selecionar um vendedor para movimentação.
#### Quadro de: **Estatísticas Diárias**:
-Aparece o nome dos vendedores adicionados no dia com um contador ao lado do nome dele com a quantidade de atendimentos feitos no dia. Virou o dia esse quadro reseta . O vendedor so pode ser mostrado nesse quadro a partir do momento que ele fez 1 atendimento no dia.

A aba de Estatísticas Diárias mostra o desempenho dos vendedores no dia atual.

**Informações** **Exibidas**:
1. Por Vendedor:
	- Nome do vendedor
	- Número de atendimentos realizados hoje
	- Status atual (Na Fila/Em Atendimento/Fora da Fila)
	- Posição na fila (se estiver na fila)
2. Atualizações:
- Em tempo real quando:
	- Vendedor realiza atendimento
	- Muda de status
	- Muda de posição
- Reset:
	- Zera à meia-noite automaticamente
	- Mantém histórico no banco de dados

### 1.2 Página : Orçamentos
- Relacionada com o botão "Criar Orçamentos"
- Essa aba deve aparecer em forma de tabela as informações
	Data/Hora | Vendedor | Descrição
-  Permite Exportação para Excel/PDF
### 1.3 Página : Histórico
- Toda a movimentação dos botões deve ficar gravada da seguinte forma em forma de histórico. 
	Data/Hora | Vendedor | Ação do botão | Descrição
-  Permite Exportação para Excel/PDF
### 1.4 Página : Geral Mês
Tem um seletor de ANO e MÊS
Exibe o somatório de atendimentos dos vendedores no ano e mês selecionados
### 1.5 Página : Lista de Vendedores
- Caixa de texto para escrever o nome do vendedor e um botao adicionar 
- Exibe logo abaixo a lista de vendedores adicionados
- Lista completa de vendedores cadastrados
- Ao selecionar um vendedor já cadastrado posso remover esse vendedor

## 2. Regras
- Todas as movimentações que os botões que tiram o vendedor da lista "Em Atendimento" deve contar 1 atendimento para aquele vendedor e ser mostrado no quadro de ESTATÍSTICAS DIÁRIAS.  
	- Botões: Voltar para Fila(Último)  , 1 º da Vez, Criar Orçamento, Mover para Fora da Fila
-Nosso sistema possui lojas vinculadas ao usuário logado. Todas as movimentações devem ser inseridas no banco de dados referente a loja

## 3. Botões
**Botão "Mover Para Fila"**:
**-Descrição**: Botão que adiciona um novo vendedor à FILA.
**-Função**: Ao ser clicado, adiciona o vendedor inserido no campo de texto à lista Na Fila.

**Botão "Mover Para Atendimento"**:
**-Descrição**: Botão que move o vendedor selecionado da Na Fila para Em Atendimento.
**-Função**: Ao ser clicado, verifica se um vendedor está selecionado na Na Fila e o move para Em Atendimento.

**Botão "Voltar para Fila (Último)"**:
**-Descrição**: Botão que move o vendedor selecionado de Em Atendimento
 e coloca ele em primeiro da Na Fila. Abre uma caixa de dialogo para descrever o que aconteceu no atendimento.
**-Função**: Permite retirar um vendedor de Em Atendimento
 e coloca ele em primeiro da Na Fila. Abre uma caixa de dialogo para descrever o que aconteceu no atendimento. Adiciona +1 ao atendimento diario do vendedor selecionado. 

**Botão "1º da Vez"**:
**-Descrição**: Botão que move o vendedor selecionado de Em Atendimento e coloca ele em primeiro da Na Fila. Abre uma caixa de dialogo para descrever o que aconteceu no atendimento.
**-Função**: Permite retirar um vendedor de Em Atendimento
 e coloca ele em primeiro da Na Fila. Abre uma caixa de dialogo para descrever o que aconteceu no atendimento. Adiciona +1 ao atendimento diario do vendedor selecionado.

**Botão "Criar Orçamento"**:
**-Descrição**: Botão que move o vendedor selecionado de Em Atendimento
 e coloca ele em ultimo da Na Fila. As informações colocadas aqui fica em destaque em outra lista, chamada Orçamentos onde aparece data hora , nome vendedor e descrição.
**-Função**: Permite retirar um vendedor de Em Atendimento
 e coloca ele em ultimo da Na Fila. Abre uma caixa de dialogo para descrever o que aconteceu no atendimento. Adiciona +1 ao atendimento diario do vendedor selecionado.

**Botão "Mover Para Fora da Fila"**:
**-Descrição**: Botão que move o vendedor selecionado de Atendimento para Fora da Fila.
**-Função**: Permite retirar um vendedor de Em Atendimento
 para Fora da Fila. Abre uma caixa de dialogo para descrever o que aconteceu no atendimento. Adiciona +1 ao atendimento diario do vendedor selecionado.

**Botão "Retornar para Fila"**:
**-Descrição**: Botão que move o vendedor selecionado da Fora da Fila para Na Fila.
**-Função**: Permite retirar um vendedor da Fora da Fila e coloca-lo em Na Fila 

**Botão "Sair da Fila"**:  
**-Descrição**: Botão que move o vendedor selecionado de Na Fila para Fora da Fila  
**-Função**: Permite retirar um vendedor de Na Fila para Fora da Fila. Abre uma caixa de dialogo para descrever o que aconteceu.

## 4. Banco de dados
- Banco de Dados utilizado será o SUPABASE
- Nosso sistema possui lojas vinculadas ao usuário logado. Todas as movimentações devem ser inseridas no banco de dados referente a loja
- As lojas são as seguintes: DINIZ AFONSO PENA, DINIZ JULIO, DINIZ PRIME, DINIZ NORTE SUL, DINIZ MARACAJU
- Criar as seguintes tabelas para cada loja 
	DINIZ AFONSO PENA:
		vendedores_afonso_pena
		historico_afonso_pena
		orçamentos_afonso_pena
		estatisticas_afonso_pena
	DINIZ DINIZ JULIO:
		vendedores_julio
		historico_julio
		orçamentos_julio
		estatisticas_julio
	DINIZ  DINIZ PRIME:
		vendedores_prime
		historico_prime
		orçamentos_prime
		estatisticas_prime
	DINIZ DINIZ NORTE SUL:
		vendedores_norte_sul
		historico_norte_sul
		orçamentos_norte_sul
		estatisticas_norte_sul
	DINIZ DINIZ MARACAJU:
		vendedores_maracaju
		historico_maracaju
		orçamentos_maracaju
		estatisticas_maracaju
- Descrição genérica das tabelas
	vendedores: lista de vendedores adicionados na pagina "Lista de Vendedores"
	historico: exibe o histórico de movimentações da loja 
	orçamentos: exibe os orçamentos criados na loja
	estatisticas: grava informações do quadro de Estatísticas Diárias e server tambem para calculo da pagina Geral Mês


## 5. Login de Usuários 
Cada loja tem o seu login e senha
DINIZ AFONSO PENA
	login: afonsopena
	senha: afonsopena
DINIZ JULIO 
	login: juliodecastilho
	senha: juliodecastilho
DINIZ PRIME 
	login: prime
	senha: prime
DINIZ NORTE SUL 
	login: nortesul
	senha: nortesul
DINIZ MARACAJU
	login: maracaju
	senha: maracaju
### Regras para os usuários
Cada Loja faz alterações somente no banco de dados da sua loja



OUTRAS INFORMAÇÕES

Documento de Especificações de Requisitos (SRS) - Aplicativo de Gestão de Fila de Vendedores
Versão 1.0

1. Visão Geral
Aplicativo web para gerenciar filas de vendedores em lojas, com controle de status (Na Fila, Em Atendimento, Fora da Fila), estatísticas em tempo real, histórico de ações e integração com Supabase.
Público-alvo: Lojas da rede "DINIZ" (5 unidades cadastradas).

2. Requisitos Funcionais
2.1 Funcionalidades Principais
2.1.1 Gestão de Filas
Listas Dinâmicas:

Na Fila: Vendedores aguardando atendimento (ordem definida por inserção ou ações dos botões).

Em Atendimento: Vendedores ativos (máx. 1 por vez?).

Fora da Fila: Vendedores inativos.

Movimentação Entre Listas:

Botões específicos para cada transição (ex: "Mover Para Atendimento", "Retornar para Fila").

Ações registradas no histórico com descrição opcional (caixa de diálogo).

2.1.2 Estatísticas
Estatísticas Diárias:

Contador de atendimentos por vendedor (reset à meia-noite).

Exibição em tempo real de:

Nome do vendedor.

Nº de atendimentos.

Status atual.

Posição na fila (se aplicável).

Geral Mês:

Filtro por ano/mês.

Total de atendimentos por vendedor no período.

2.1.3 Histórico e Relatórios
Histórico de Ações:

Registro de todas as movimentações (Data/Hora, Vendedor, Ação, Descrição).

Orçamentos:

Lista de orçamentos criados (Data/Hora, Vendedor, Descrição).

Exportação:

Opção para exportar histórico e orçamentos em Excel/PDF.

2.2 Páginas e Componentes
2.2.1 Navbar
Botões de Navegação:

Gerenciamento de Fila | Orçamentos | Histórico | Lista de Vendedores | Geral Mês.

Tema Claro/Escuro | Logout.

2.2.2 Página: Gerenciamento de Fila
Componentes:

Caixa de texto para adicionar vendedores à fila.

3 listas interativas (drag-and-drop ou seleção + botões).

Quadro de estatísticas diárias atualizado em tempo real.

2.2.3 Página: Lista de Vendedores
CRUD de Vendedores:

Adicionar/Remover vendedores (persistidos no Supabase).

2.3 Regras de Negócio
Contagem de Atendimentos:

Incrementar +1 ao usar botões: Voltar para Fila (Último), 1º da Vez, Criar Orçamento, Mover para Fora da Fila.

Segurança por Loja:

Usuários só acessam dados da sua loja (ex: login "afonsopena" → tabelas *_afonso_pena).

Reset Diário:

Estatísticas diárias zeradas automaticamente às 00:00.

3. Requisitos Não Funcionais
Performance: Atualização em tempo real das listas e estatísticas.

Segurança: Autenticação obrigatória, dados isolados por loja.

Responsividade: Compatível com desktop e tablets.

Tecnologias:

Frontend: Next.js (React), TypeScript.

Banco de Dados: Supabase (PostgreSQL).

Autenticação: Supabase Auth.

4. Banco de Dados (Supabase)
4.1 Estrutura das Tabelas
Cada loja terá 4 tabelas:

vendedores_{loja}
Campo	Tipo	Descrição
id	SERIAL (PK)	ID único.
nome	VARCHAR	Nome do vendedor.
created_at	TIMESTAMP	Data de criação.
historico_{loja}
Campo	Tipo	Descrição
id	SERIAL (PK)	ID único.
data_hora	TIMESTAMP	Data/hora da ação.
vendedor	VARCHAR	Nome do vendedor.
acao	VARCHAR	Tipo de ação (ex: "Movido para Atendimento").
descricao	TEXT	Detalhes da ação.
orcamentos_{loja}
Campo	Tipo	Descrição
id	SERIAL (PK)	ID único.
data_hora	TIMESTAMP	Data/hora do orçamento.
vendedor	VARCHAR	Nome do vendedor.
descricao	TEXT	Detalhes do orçamento.
estatisticas_{loja}
Campo	Tipo	Descrição
id	SERIAL (PK)	ID único.
vendedor	VARCHAR	Nome do vendedor.
data	DATE	Data do registro.
atendimentos	INTEGER	Contador diário.
5. Fluxos de Trabalho
5.1 Autenticação
Usuário insere login/senha pré-definidos (ex: login: "afonsopena", senha: "afonsopena").

Sistema valida credenciais e redireciona para a página principal da loja correspondente.

5.2 Movimentação de Vendedores
Usuário seleciona um vendedor em uma lista.

Clica em um botão de ação (ex: "Mover Para Atendimento").

Sistema:

Atualiza a posição do vendedor no frontend.

Registra a ação no historico_{loja}.

Incrementa atendimentos em estatisticas_{loja} (se aplicável).

6. Protótipos de Interface (Esboço)
Página Principal:
Prototype

Tema Escuro: Cores em tons de cinza/azul escuro.

Caixas de Diálogo: Formulário simples para inserir descrição após ações críticas (ex: criar orçamento).
