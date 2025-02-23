Requirements for Sales Queue Management Page

Objective

To create a sales queue management page similar to the provided image with interactive sections for managing sales staff in and out of a queue, as well as tracking daily statistics. The page will include a clear layout for sales reps in three states (in queue, in service, out of queue), various interactive buttons for moving sales reps between these states, and a section for daily performance tracking.

Page Layout Structure

1. Top Navigation Bar

Title: 'Pamela' on the left side, as a brand or system name.

Menu Options:

Gerenciamento de Fila

Orçamentos

Histórico

Geral Mês

Lista de Vendedores

Logout Icon (Sair) on the right with a sun/moon icon for light/dark mode toggle.

2. Sales Queue Management Section

Dropdown Menu (top-left): Allows the user to select a sales rep from a list.

Button (Adicionar à Fila): Adds the selected sales rep to the queue.

3. Queue Display Area

Columns: Three primary columns, each with a title and list of sales reps.

Na Fila (left column): Sales reps waiting for service.

Em Atendimento (middle column): Sales reps currently in service.

Fora da Fila (right column): Sales reps not in service and not in queue.

Highlighted Sales Reps: Currently active sales reps should be displayed in colored boxes (e.g., purple for those in service).

4. Daily Statistics Section

Statistics Box: Shows stats for the selected sales rep. Includes:

Sales rep's name.

Number of service sessions (X atendimento(s)).

Current status (Status: Na Fila).

Status Indicators: The box should visually indicate the current status of the sales rep (green for active).

5. Action Buttons (Bottom Section)

A series of action buttons along the bottom of the screen to move sales reps between different states. These include:

Mover para Atendimento (Move to Service)

Voltar para Fila (Último) (Return to Queue - Last Position)

1º da Vez (Move to First in Queue)

Criar Orçamento (Create Budget)

Mover para Fora da Fila (Move Out of Queue)

Retornar para Fila (Return to Queue from Out)

Button Colors and Visuals: Buttons should be styled with a mix of gray and purple to match the visual from the image. The active state for buttons should reflect with hover/click effects.

Technical Requirements

Frontend Framework: React.js

CSS Framework: Tailwind CSS for styling consistency.

State Management: Redux or Context API to manage the state of sales reps across the columns.

Backend Requirements:

Node.js server or equivalent.

RESTful API for fetching, updating, and managing sales rep data.

Database (e.g., MongoDB or SQL) to store sales rep statuses and statistics.

Daily Statistics: A counter system that resets daily and updates whenever a sales rep completes a service session.

Responsive Design: Page should be fully responsive across desktop and mobile platforms.

Page Flow and User Interactions

When the user selects a sales rep from the dropdown and clicks 'Adicionar à Fila', the selected sales rep should appear in the 'Na Fila' column.

Clicking Mover para Atendimento moves the sales rep from 'Na Fila' to 'Em Atendimento' with their name highlighted.

Once a sales rep finishes the service, the user clicks 'Mover para Fora da Fila' to shift the rep to the 'Fora da Fila' column.

The Criar Orçamento button generates a justification input field and records the sales rep's session in a new list box showing the session details (e.g., date, rep name, and reason).

Additional Notes

Ensure real-time updates for the sales reps between columns without requiring page reload.

Incorporate form validation for adding sales reps to prevent duplicates in the queue.

Future Enhancements

Add reporting capabilities for monthly and weekly statistics.

Implement a search or filter functionality to quickly locate sales reps in any column.

Option to export the daily statistics as CSV or PDF.

