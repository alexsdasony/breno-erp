import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// Função para formatar valores monetários no padrão brasileiro
export function formatCurrency(value) {
	if (value === null || value === undefined || isNaN(value)) {
		return 'R$ 0,00';
	}
	
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(parseFloat(value));
}

// Função para formatar datas no padrão brasileiro
export function formatDate(dateStr) {
	if (!dateStr) return '—';
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return '—';
	return d.toLocaleDateString('pt-BR');
}