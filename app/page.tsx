'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Wallet, 
  TrendingUp, 
  PlusCircle, 
  Calculator, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins,
  Filter,
  PieChart as PieIcon,
  BarChart3,
  Trash2,
  Edit2,
  X,
  Target,
  PiggyBank,
  RefreshCw,
  Scale,
  Plus,
  ChevronDown,
  ChevronUp,
  Info,
  Tag,
  Repeat
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';

// Nomes fixos do casal (pode alterar aqui a qualquer momento se precisar)
const COUPLE_NAMES = {
  HE: 'Bruno',
  SHE: 'Wilma'
};

// Interfaces TypeScript Estritas
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  paid_by: string;
  date: string;
  nature?: 'fixo' | 'variavel';
  is_recurring?: boolean;
}

interface InvestmentAsset {
  id: string;
  ticker: string;
  asset_class: string;
  quantity: number;
  average_price: number;
  current_price?: number;
  ceiling_price?: number;
  owner?: string;
}

interface Dividend {
  id: string;
  ticker: string;
  amount: number;
  payment_date: string;
}

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
}

interface Budget {
  id: string;
  category: string;
  type: string;
  expected_amount: number;
  month: number;
  year: number;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface BudgetChartItem {
  categoria: string;
  Previsto: number;
  Realizado: number;
}

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6', '#64748b'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dash' | 'finances' | 'investments' | 'dividends' | 'goals' | 'budgets' | 'tools' | 'add'>('dash');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<InvestmentAsset[]>([]);
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isUpdatingQuotes, setIsUpdatingQuotes] = useState(false);
  
  // Estado para controlar qual ativo está expandido (Acordeão)
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

  // Estado para controlar o Modal de Detalhes (Fixo vs Variável)
  const [modalNature, setModalNature] = useState<'fixo' | 'variavel' | null>(null);

  // Estados dos Filtros
  const currentDate = new Date();
  const [filterType, setFilterType] = useState<'month_year' | 'year' | 'range' | 'all'>('month_year');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [startDate, setStartDate] = useState<string>(`${currentDate.getFullYear()}-01-01`);
  const [endDate, setEndDate] = useState<string>(currentDate.toISOString().split('T')[0]);

  // Formulário Unificado (Inserção e Edição)
  const [entryType, setEntryType] = useState<'transaction' | 'investment' | 'dividend' | 'goal' | 'budget'>('transaction');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Transações Form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transType, setTransType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Mercado');
  const [paidBy, setPaidBy] = useState('Conjunto');
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expenseNature, setExpenseNature] = useState<'fixo' | 'variavel'>('variavel');
  
  // Estados para Recorrência (Gastos Fixos Repetidos)
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceMonths, setRecurrenceMonths] = useState('12');

  // Investimentos Form
  const [ticker, setTicker] = useState('');
  const [assetClass, setAssetClass] = useState('FIIs');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [ceilingPrice, setCeilingPrice] = useState('');

  // Metas Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Orçamento Form
  const [budgetCategory, setBudgetCategory] = useState('Mercado');
  const [budgetAmount, setBudgetAmount] = useState('');

  // Calculadora Proporcional Form
  const [incomeHe, setIncomeHe] = useState('');
  const [incomeShe, setIncomeShe] = useState('');
  const [totalBills, setTotalBills] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Buscar dados com base nos filtros
  async function loadData() {
    let transQuery = supabase.from('transactions').select('*').order('date', { ascending: false });

    if (filterType === 'month_year') {
      const startOfMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01T00:00:00.000Z`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endOfMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`;

      transQuery = transQuery.gte('date', startOfMonth).lte('date', endOfMonth);
    } else if (filterType === 'year') {
      const startOfYear = `${selectedYear}-01-01T00:00:00.000Z`;
      const endOfYear = `${selectedYear}-12-31T23:59:59.999Z`;

      transQuery = transQuery.gte('date', startOfYear).lte('date', endOfYear);
    } else if (filterType === 'range') {
      if (startDate && endDate) {
        transQuery = transQuery.gte('date', `${startDate}T00:00:00.000Z`).lte('date', `${endDate}T23:59:59.999Z`);
      }
    }

    const { data: transData } = await transQuery;
    if (transData) setTransactions(transData as Transaction[]);

    const { data: invData } = await supabase.from('investment_assets').select('*');
    if (invData) setInvestments(invData as InvestmentAsset[]);

    const { data: divData } = await supabase.from('dividends').select('*').order('payment_date', { ascending: false });
    if (divData) setDividends(divData as Dividend[]);

    const { data: goalsData } = await supabase.from('goals').select('*');
    if (goalsData) setGoals(goalsData as Goal[]);

    const { data: budgetsData } = await supabase.from('budgets').select('*')
      .eq('month', selectedMonth)
      .eq('year', selectedYear);
    if (budgetsData) setBudgets(budgetsData as Budget[]);
  }

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear, filterType, startDate, endDate]);

  // Atualizador de Cotações em Tempo Real (Brapi API)
  async function updateStockQuotes() {
    if (investments.length === 0) {
      alert('Nenhum ativo cadastrado para atualizar cotações.');
      return;
    }

    setIsUpdatingQuotes(true);
    try {
      const tickers = Array.from(new Set(investments.map(inv => inv.ticker.trim().toUpperCase()))).join(',');
      const response = await fetch(`https://brapi.dev/api/quote/${tickers}?fundamental=false`);
      const data = await response.json();

      if (data && data.results) {
        for (const stock of data.results) {
          const fetchedPrice = stock.regularMarketPrice;
          if (fetchedPrice && fetchedPrice > 0) {
            await supabase
              .from('investment_assets')
              .update({ current_price: fetchedPrice })
              .eq('ticker', stock.symbol);
          }
        }
        await loadData();
        alert('Cotações atualizadas em tempo real com sucesso!');
      } else {
        alert('Não foi possível obter as cotações no momento.');
      }
    } catch (err) {
      console.error('Erro ao buscar cotações:', err);
      alert('Erro ao consultar API de cotações.');
    } finally {
      setIsUpdatingQuotes(false);
    }
  }

  // Salvar / Atualizar Lançamento Unificado com Suporte a Recorrência
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (entryType === 'transaction') {
        const totalMonths = (isRecurring && transType === 'expense' && !editingId) ? parseInt(recurrenceMonths) || 1 : 1;
        const baseDate = new Date(entryDate);
        const transactionsToInsert = [];

        for (let i = 0; i < totalMonths; i++) {
          const targetDate = new Date(baseDate);
          targetDate.setMonth(baseDate.getMonth() + i);

          const year = targetDate.getFullYear();
          const month = String(targetDate.getMonth() + 1).padStart(2, '0');
          const day = String(targetDate.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}T00:00:00.000Z`;

          const customDescription = totalMonths > 1 
            ? `${description} (${i + 1}/${totalMonths})` 
            : description;

          transactionsToInsert.push({
            description: customDescription,
            amount: parseFloat(amount),
            type: transType,
            category,
            paid_by: paidBy,
            date: formattedDate,
            nature: transType === 'expense' ? expenseNature : null,
            is_recurring: totalMonths > 1
          });
        }

        if (editingId) {
          const { error } = await supabase.from('transactions').update(transactionsToInsert[0]).eq('id', editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('transactions').insert(transactionsToInsert);
          if (error) throw error;
        }

      } else if (entryType === 'investment') {
        const payload = {
          ticker: ticker.toUpperCase(),
          asset_class: assetClass,
          quantity: parseFloat(quantity),
          average_price: parseFloat(avgPrice),
          current_price: parseFloat(avgPrice),
          ceiling_price: ceilingPrice ? parseFloat(ceilingPrice) : 0,
          owner: paidBy
        };

        if (editingId) {
          const { error } = await supabase.from('investment_assets').update(payload).eq('id', editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('investment_assets').insert([payload]);
          if (error) throw error;
        }

      } else if (entryType === 'dividend') {
        const payload = {
          ticker: ticker.toUpperCase(),
          amount: parseFloat(amount),
          payment_date: entryDate
        };

        if (editingId) {
          const { error } = await supabase.from('dividends').update(payload).eq('id', editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('dividends').insert([payload]);
          if (error) throw error;
        }

      } else if (entryType === 'goal') {
        const payload = {
          title: goalTitle,
          target_amount: parseFloat(goalTarget),
          current_amount: goalCurrent ? parseFloat(goalCurrent) : 0,
          deadline: goalDeadline || null
        };

        if (editingId) {
          const { error } = await supabase.from('goals').update(payload).eq('id', editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('goals').insert([payload]);
          if (error) throw error;
        }

      } else if (entryType === 'budget') {
        const payload = {
          category: budgetCategory,
          type: 'expense',
          expected_amount: parseFloat(budgetAmount),
          month: selectedMonth,
          year: selectedYear
        };

        const existing = budgets.find(b => b.category === budgetCategory);
        if (existing) {
          const { error } = await supabase.from('budgets').update({ expected_amount: parseFloat(budgetAmount) }).eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('budgets').insert([payload]);
          if (error) throw error;
        }
      }

      resetForm();
      await loadData();
      setActiveTab('dash');
      alert(editingId ? 'Atualizado com sucesso!' : 'Salvo com sucesso!');

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Verifique a conexão.';
      console.error('Erro ao salvar:', err);
      alert(`Erro no banco de dados: ${errorMessage}`);
    }
  }

  // Edições
  function handleEditTransaction(t: Transaction) {
    setEntryType('transaction');
    setEditingId(t.id);
    setDescription(t.description);
    setAmount(String(t.amount));
    setTransType(t.type);
    setCategory(t.category);
    setPaidBy(t.paid_by);
    setExpenseNature(t.nature || 'variavel');
    setIsRecurring(false);
    setEntryDate(t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setActiveTab('add');
  }

  function handleEditInvestment(inv: InvestmentAsset) {
    setEntryType('investment');
    setEditingId(inv.id);
    setTicker(inv.ticker);
    setAssetClass(inv.asset_class);
    setQuantity(String(inv.quantity));
    setAvgPrice(String(inv.average_price));
    setCeilingPrice(inv.ceiling_price ? String(inv.ceiling_price) : '');
    setPaidBy(inv.owner || 'Conjunto');
    setActiveTab('add');
  }

  function handleEditDividend(d: Dividend) {
    setEntryType('dividend');
    setEditingId(d.id);
    setTicker(d.ticker);
    setAmount(String(d.amount));
    setEntryDate(d.payment_date);
    setActiveTab('add');
  }

  function handleEditGoal(g: Goal) {
    setEntryType('goal');
    setEditingId(g.id);
    setGoalTitle(g.title);
    setGoalTarget(String(g.target_amount));
    setGoalCurrent(String(g.current_amount || 0));
    setGoalDeadline(g.deadline || '');
    setActiveTab('add');
  }

  // Exclusões
  async function handleDeleteTransaction(id: string) {
    if (!confirm('Tem certeza que deseja apagar este lançamento?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert('Erro ao excluir.');
    else loadData();
  }

  async function handleDeleteInvestment(id: string) {
    if (!confirm('Tem certeza que deseja remover este ativo da carteira?')) return;
    const { error } = await supabase.from('investment_assets').delete().eq('id', id);
    if (error) alert('Erro ao excluir.');
    else loadData();
  }

  async function handleDeleteDividend(id: string) {
    if (!confirm('Tem certeza que deseja remover este dividendo?')) return;
    const { error } = await supabase.from('dividends').delete().eq('id', id);
    if (error) alert('Erro ao excluir.');
    else loadData();
  }

  async function handleDeleteGoal(id: string) {
    if (!confirm('Tem certeza que deseja remover esta meta?')) return;
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) alert('Erro ao excluir.');
    else loadData();
  }

  async function handleDeleteBudget(id: string) {
    if (!confirm('Tem certeza que deseja remover este limite orçamentário?')) return;
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) alert('Erro ao excluir.');
    else loadData();
  }

  function resetForm() {
    setEditingId(null);
    setDescription('');
    setAmount('');
    setTicker('');
    setQuantity('');
    setAvgPrice('');
    setCeilingPrice('');
    setGoalTitle('');
    setGoalTarget('');
    setGoalCurrent('');
    setGoalDeadline('');
    setBudgetAmount('');
    setExpenseNature('variavel');
    setIsRecurring(false);
    setRecurrenceMonths('12');
    setPaidBy('Conjunto');
    setEntryDate(new Date().toISOString().split('T')[0]);
  }

  // Cálculos Financeiros
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const monthlyBalance = totalIncome - totalExpense;

  // Cálculos de Fixos vs Variáveis
  const fixedTransactionsList = transactions.filter(t => t.type === 'expense' && t.nature === 'fixo');
  const variableTransactionsList = transactions.filter(t => t.type === 'expense' && (t.nature === 'variavel' || !t.nature));

  const totalFixedExpense = fixedTransactionsList.reduce((acc, t) => acc + Number(t.amount), 0);
  const totalVariableExpense = variableTransactionsList.reduce((acc, t) => acc + Number(t.amount), 0);

  const totalInvested = investments.reduce((acc, inv) => acc + (Number(inv.quantity) * Number(inv.average_price)), 0);
  const totalCurrentInvested = investments.reduce((acc, inv) => {
    const price = (inv.current_price && inv.current_price > 0) ? inv.current_price : inv.average_price;
    return acc + (Number(inv.quantity) * Number(price));
  }, 0);
  const totalDividends = dividends.reduce((acc, d) => acc + Number(d.amount), 0);
  const netWorth = monthlyBalance + totalCurrentInvested;

  // Gráfico 1: Gastos por Categoria
  const categoryChartData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: ChartDataItem[], t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) existing.value += Number(t.amount);
      else acc.push({ name: t.category, value: Number(t.amount) });
      return acc;
    }, []);

  // Gráfico 2: Receitas vs Despesas
  const comparisonChartData = [
    { name: 'Receitas', valor: totalIncome },
    { name: 'Despesas', valor: totalExpense },
  ];

  // Gráfico 3: Alocação por Classe de Ativos
  const assetClassChartData = investments.reduce((acc: ChartDataItem[], inv) => {
    const price = (inv.current_price && inv.current_price > 0) ? inv.current_price : inv.average_price;
    const totalValue = Number(inv.quantity) * Number(price);
    const existing = acc.find(item => item.name === inv.asset_class);
    if (existing) existing.value += totalValue;
    else acc.push({ name: inv.asset_class, value: totalValue });
    return acc;
  }, []);

  // Gráfico 4: Orçamento Previsto vs Realizado
  const budgetChartData: BudgetChartItem[] = budgets.map(b => {
    const totalRealized = transactions
      .filter(t => t.category === b.category && t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return {
      categoria: b.category,
      Previsto: Number(b.expected_amount),
      Realizado: totalRealized
    };
  });

  // Calculadora Proporcional
  const valHe = parseFloat(incomeHe) || 0;
  const valShe = parseFloat(incomeShe) || 0;
  const valBills = parseFloat(totalBills) || 0;
  const sumIncome = valHe + valShe;
  const pctHe = sumIncome > 0 ? (valHe / sumIncome) * 100 : 50;
  const pctShe = sumIncome > 0 ? (valShe / sumIncome) * 100 : 50;
  const payHe = (valBills * pctHe) / 100;
  const payShe = (valBills * pctShe) / 100;

  const categoriesList = [
    'Alimentação', 'Animais de Estimação', 'Assinaturas/Serviços', 'Casa/Moradia', 
    'Cuidados Pessoais', 'Despesas Pessoais', 'Dívidas/Empréstimos', 'Educação', 
    'Impostos/Taxas', 'Lazer', 'Mercado', 'Saúde', 'Transportes', 'Vestuário', 'Investimentos'
  ];

  const monthsList = [
    { value: 1, name: 'Janeiro' }, { value: 2, name: 'Fevereiro' }, { value: 3, name: 'Março' },
    { value: 4, name: 'Abril' }, { value: 5, name: 'Maio' }, { value: 6, name: 'Junho' },
    { value: 7, name: 'Julho' }, { value: 8, name: 'Agosto' }, { value: 9, name: 'Setembro' },
    { value: 10, name: 'Outubro' }, { value: 11, name: 'Novembro' }, { value: 12, name: 'Dezembro' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center pb-24 relative">
      {/* Topbar Fixo */}
      <header className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            FINANÇAS CASAL PRO
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Gestão & Patrimônio Consolidado</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30" title={COUPLE_NAMES.HE}>
            {COUPLE_NAMES.HE.charAt(0)}
          </span>
          <span className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/30" title={COUPLE_NAMES.SHE}>
            {COUPLE_NAMES.SHE.charAt(0)}
          </span>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="w-full max-w-md p-4 space-y-5">

        {/* BARRA DE FILTROS DE DATA */}
        {(activeTab === 'dash' || activeTab === 'finances' || activeTab === 'budgets') && (
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Filter size={13} className="text-emerald-400" /> Filtro de Período (Fluxo de Caixa)
              </span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[9px]">
                <button
                  type="button"
                  onClick={() => setFilterType('month_year')}
                  className={`px-2 py-0.5 rounded font-semibold ${filterType === 'month_year' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Mês/Ano
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('year')}
                  className={`px-2 py-0.5 rounded font-semibold ${filterType === 'year' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Ano
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('range')}
                  className={`px-2 py-0.5 rounded font-semibold ${filterType === 'range' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Intervalo
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-0.5 rounded font-semibold ${filterType === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Tudo
                </button>
              </div>
            </div>

            {filterType === 'month_year' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 focus:outline-none focus:border-emerald-500"
                >
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            )}

            {filterType === 'year' && (
              <div className="pt-1">
                <label className="text-[9px] text-slate-400 block mb-0.5">Selecione o Ano:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value={2025}>2025 (Ano Completo)</option>
                  <option value={2026}>2026 (Ano Completo)</option>
                  <option value={2027}>2027 (Ano Completo)</option>
                </select>
              </div>
            )}

            {filterType === 'range' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[9px] text-slate-400 block mb-0.5">De:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block mb-0.5">Até:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ABA 1: DASHBOARD --- */}
        {activeTab === 'dash' && (
          <>
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Patrimônio Líquido do Casal</span>
                <span className="text-[9px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Info size={10} /> Posição Atual de Mercado
                </span>
              </div>
              <p className="text-3xl font-black text-slate-100">
                R$ {netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Saldo do Período (Filtrado)</span>
                  <span className={`font-bold ${monthlyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    R$ {monthlyBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Investido (Atual)</span>
                  <span className="font-bold text-cyan-400">
                    R$ {totalCurrentInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <ArrowUpRight size={14} /> Receitas (Período)
                </p>
                <p className="text-base font-bold text-slate-100 mt-1">
                  R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <p className="text-xs text-rose-400 flex items-center gap-1 font-semibold">
                  <ArrowDownRight size={14} /> Despesas (Período)
                </p>
                <p className="text-base font-bold text-slate-100 mt-1">
                  R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* CARD DE RAIO-X: FIXOS VS VARIÁVEIS */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={14} className="text-emerald-400" /> Raio-X de Despesas (Toque para ver)
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setModalNature('fixo')}
                  className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 p-3 rounded-xl text-left transition active:scale-95 cursor-pointer"
                >
                  <span className="text-amber-400 font-semibold block text-[10px]">📌 Gastos Fixos</span>
                  <p className="text-sm font-bold text-slate-100 mt-1">R$ {totalFixedExpense.toFixed(2)}</p>
                  <span className="text-[9px] text-slate-400">{totalExpense > 0 ? ((totalFixedExpense / totalExpense) * 100).toFixed(0) : 0}% do total</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalNature('variavel')}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 p-3 rounded-xl text-left transition active:scale-95 cursor-pointer"
                >
                  <span className="text-cyan-400 font-semibold block text-[10px]">🛒 Gastos Variáveis</span>
                  <p className="text-sm font-bold text-slate-100 mt-1">R$ {totalVariableExpense.toFixed(2)}</p>
                  <span className="text-[9px] text-slate-400">{totalExpense > 0 ? ((totalVariableExpense / totalExpense) * 100).toFixed(0) : 0}% do total</span>
                </button>
              </div>
            </div>

            {isMounted && (totalIncome > 0 || totalExpense > 0) && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-emerald-400" /> Receitas vs Despesas (Período)
                </h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonChartData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} 
                        formatter={((value: any) => [`R$ ${Number(value ?? 0).toFixed(2)}`, 'Valor']) as any}
                      />
                      <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                        <Cell fill="#10b981" />
                        <Cell fill="#f43f5e" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {isMounted && categoryChartData.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PieIcon size={14} className="text-emerald-400" /> Gastos por Categoria (Período)
                </h3>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryChartData.map((_entry: ChartDataItem, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        formatter={((value: any) => [`R$ ${Number(value ?? 0).toFixed(2)}`, 'Gasto']) as any}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[10px]">
                  {categoryChartData.map((cat: ChartDataItem, index: number) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-slate-400 truncate">{cat.name}:</span>
                      <strong className="text-slate-200">R$ {cat.value.toFixed(0)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lançamentos do Período</h3>
                <span className="text-[10px] text-slate-500">{transactions.length} itens</span>
              </div>

              {transactions.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
                  <p className="text-xs text-slate-500">Nenhum lançamento encontrado para este período.</p>
                </div>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-200">{t.description}</p>
                        {t.type === 'expense' && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${t.nature === 'fixo' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                            {t.nature === 'fixo' ? 'Fixo' : 'Variável'}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>{t.category}</span>
                        <span>•</span>
                        <span>{t.paid_by}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                      </p>
                      <button onClick={() => handleEditTransaction(t)} className="p-1 text-slate-500 hover:text-amber-400 transition" title="Editar">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDeleteTransaction(t.id)} className="p-1 text-slate-500 hover:text-rose-400 transition" title="Excluir">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* --- ABA ORÇAMENTO PREVISTO VS REALIZADO --- */}
        {activeTab === 'budgets' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Scale size={18} className="text-emerald-400" /> Orçamento Mensal
              </h2>
              <button 
                onClick={() => { setEntryType('budget'); setActiveTab('add'); }} 
                className="text-xs text-emerald-400 font-bold border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-lg"
              >
                + Definir Teto
              </button>
            </div>

            {isMounted && budgetChartData.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previsto vs Realizado</h3>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetChartData}>
                      <XAxis dataKey="categoria" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                      <Bar dataKey="Previsto" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Realizado" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {budgets.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
                  <Scale size={32} className="mx-auto text-slate-600" />
                  <p className="text-xs text-slate-400">Nenhum orçamento configurado para este mês.</p>
                </div>
              ) : (
                budgets.map((b) => {
                  const spent = transactions
                    .filter(t => t.category === b.category && t.type === 'expense')
                    .reduce((acc, t) => acc + Number(t.amount), 0);
                  
                  const expected = Number(b.expected_amount) || 1;
                  const pct = Math.min(Math.round((spent / expected) * 100), 100);
                  const isOverBudget = spent > expected;

                  return (
                    <div key={b.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-200">{b.category}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isOverBudget ? 'text-rose-400' : 'text-slate-300'}`}>
                            R$ {spent.toFixed(2)} / R$ {expected.toFixed(2)}
                          </span>
                          <button onClick={() => handleDeleteBudget(b.id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* --- ABA METAS DO CASAL --- */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Target size={18} className="text-emerald-400" /> Metas & Objetivos
              </h2>
              <button 
                onClick={() => { setEntryType('goal'); setActiveTab('add'); }} 
                className="text-xs text-emerald-400 font-bold border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-lg"
              >
                + Nova Meta
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
                <PiggyBank size={32} className="mx-auto text-slate-600" />
                <p className="text-xs text-slate-400">Nenhuma meta cadastrada ainda.</p>
              </div>
            ) : (
              goals.map((g) => {
                const target = Number(g.target_amount) || 1;
                const current = Number(g.current_amount) || 0;
                const pct = Math.min(Math.round((current / target) * 100), 100);

                return (
                  <div key={g.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">{g.title}</h3>
                        {g.deadline && <p className="text-[10px] text-slate-500 mt-0.5">Prazo: {new Date(g.deadline).toLocaleDateString('pt-BR')}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditGoal(g)} className="p-1 text-slate-500 hover:text-amber-400"><Edit2 size={13} /></button>
                        <button onClick={() => handleDeleteGoal(g.id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 size={13} /></button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-emerald-400">R$ {current.toFixed(2)}</span>
                        <span className="text-slate-400">Meta: R$ {target.toFixed(2)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* --- ABA 2: FINANÇAS --- */}
        {activeTab === 'finances' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-200">Categorias & Resumo</h2>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {categoriesList.map((cat, idx) => {
                  const catTotal = transactions
                    .filter(t => t.category === cat && t.type === 'expense')
                    .reduce((acc, t) => acc + Number(t.amount), 0);

                  return (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      <p className="text-slate-300 font-medium truncate">{cat}</p>
                      <p className="text-xs font-bold text-rose-400 mt-1">
                        R$ {catTotal.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- ABA 3: CARTEIRA DE INVESTIMENTOS --- */}
        {activeTab === 'investments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-200">Carteira de Ativos</h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={updateStockQuotes}
                  disabled={isUpdatingQuotes}
                  className="text-[10px] font-bold text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 rounded-lg flex items-center gap-1"
                >
                  <RefreshCw size={11} className={isUpdatingQuotes ? 'animate-spin' : ''} />
                  {isUpdatingQuotes ? 'Buscando...' : 'Cotações B3'}
                </button>
                <button
                  onClick={() => { setEntryType('investment'); setActiveTab('add'); }}
                  className="text-[10px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded-lg flex items-center gap-1"
                >
                  <Plus size={11} /> Novo Ativo
                </button>
              </div>
            </div>

            {/* GRÁFICO 3: ALOCAÇÃO POR CLASSE DE ATIVO */}
            {isMounted && assetClassChartData.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PieIcon size={14} className="text-cyan-400" /> Distribuição da Carteira
                </h3>
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetClassChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {assetClassChartData.map((_entry: ChartDataItem, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        formatter={((value: any) => [`R$ ${Number(value ?? 0).toFixed(2)}`, 'Total']) as any}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[10px]">
                  {assetClassChartData.map((asset: ChartDataItem, index: number) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-slate-400 truncate">{asset.name}:</span>
                      <strong className="text-slate-200">R$ {asset.value.toFixed(0)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {investments.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
                <TrendingUp size={32} className="mx-auto text-slate-600" />
                <p className="text-xs text-slate-400">Nenhum ativo cadastrado na carteira.</p>
                <button onClick={() => { setEntryType('investment'); setActiveTab('add'); }} className="text-xs text-emerald-400 font-bold underline">
                  Cadastrar Primeiro Ativo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {investments.map((inv) => {
                  const totalCost = Number(inv.quantity) * Number(inv.average_price);
                  const currentPrice = (inv.current_price && inv.current_price > 0) ? inv.current_price : inv.average_price;
                  const totalCurrent = Number(inv.quantity) * Number(currentPrice);
                  const profitLoss = totalCurrent - totalCost;
                  const profitLossPct = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
                  const isBelowCeiling = (inv.ceiling_price ?? 0) > 0 && currentPrice <= (inv.ceiling_price ?? 0);

                  const isExpanded = expandedAssetId === inv.id;

                  return (
                    <div key={inv.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200">
                      <div 
                        onClick={() => setExpandedAssetId(isExpanded ? null : inv.id)}
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800/70 select-none"
                      >
                        <div>
                          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {inv.ticker}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-2">{inv.asset_class}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-100">R$ {totalCurrent.toFixed(2)}</p>
                            <p className={`text-[9px] font-bold ${profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({profitLossPct.toFixed(1)}%)
                            </p>
                          </div>
                          <div className="text-slate-500">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-3 border-t border-slate-800/60 bg-slate-950/30">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Detalhes do Ativo</span>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEditInvestment(inv); }} 
                                className="p-1.5 bg-slate-800 text-slate-400 hover:text-amber-400 rounded-md transition" 
                                title="Editar"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteInvestment(inv.id); }} 
                                className="p-1.5 bg-slate-800 text-slate-400 hover:text-rose-400 rounded-md transition" 
                                title="Excluir"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-400">
                            <div>
                              <span>Qtd:</span> <strong className="text-slate-200 block text-xs mt-0.5">{inv.quantity}</strong>
                            </div>
                            <div>
                              <span>PM:</span> <strong className="text-slate-200 block text-xs mt-0.5">R$ {Number(inv.average_price).toFixed(2)}</strong>
                            </div>
                            <div>
                              <span>Atual:</span> <strong className="text-cyan-400 block text-xs mt-0.5">R$ {Number(currentPrice).toFixed(2)}</strong>
                            </div>
                            <div>
                              <span>Teto:</span> 
                              <strong className={`block text-xs mt-0.5 ${isBelowCeiling ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                                {(inv.ceiling_price ?? 0) > 0 ? `R$ ${Number(inv.ceiling_price).toFixed(2)}` : 'N/A'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- ABA 4: DIVIDENDOS --- */}
        {activeTab === 'dividends' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-200">Histórico de Proventos</h2>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <p className="text-xs text-slate-400">Total Acumulado Recebido</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">R$ {totalDividends.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              {dividends.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhum dividendo registrado ainda.</p>
              ) : (
                dividends.map((d) => (
                  <div key={d.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-emerald-400">{d.ticker}</p>
                      <p className="text-[10px] text-slate-500">{new Date(d.payment_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-100">+ R$ {Number(d.amount).toFixed(2)}</p>
                      <button onClick={() => handleEditDividend(d)} className="p-1 text-slate-500 hover:text-amber-400"><Edit2 size={13} /></button>
                      <button onClick={() => handleDeleteDividend(d.id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- ABA 5: FERRAMENTAS --- */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Calculator size={16} className="text-emerald-400" /> Divisão Proporcional por Renda
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Renda {COUPLE_NAMES.HE} (R$)</label>
                  <input
                    type="number"
                    value={incomeHe}
                    onChange={(e) => setIncomeHe(e.target.value)}
                    placeholder="3500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Renda {COUPLE_NAMES.SHE} (R$)</label>
                  <input
                    type="number"
                    value={incomeShe}
                    onChange={(e) => setIncomeShe(e.target.value)}
                    placeholder="4500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Total Contas Conjuntas (R$)</label>
                <input
                  type="number"
                  value={totalBills}
                  onChange={(e) => setTotalBills(e.target.value)}
                  placeholder="2500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {sumIncome > 0 && valBills > 0 && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{COUPLE_NAMES.HE} ({pctHe.toFixed(1)}%):</span>
                    <span className="font-bold text-emerald-400">R$ {payHe.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{COUPLE_NAMES.SHE} ({pctShe.toFixed(1)}%):</span>
                    <span className="font-bold text-teal-400">R$ {payShe.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ABA DE REGISTRO UNIFICADO --- */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-200">{editingId ? 'Editar Registro' : 'Novo Registro'}</h2>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-xs text-rose-400 flex items-center gap-1">
                  <X size={14} /> Cancelar Edição
                </button>
              )}
            </div>

            {!editingId && (
              <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[8px]">
                <button
                  type="button"
                  onClick={() => setEntryType('transaction')}
                  className={`py-2 rounded-lg font-bold ${entryType === 'transaction' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Transação
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('investment')}
                  className={`py-2 rounded-lg font-bold ${entryType === 'investment' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Ativo
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('dividend')}
                  className={`py-2 rounded-lg font-bold ${entryType === 'dividend' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Dividendo
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('goal')}
                  className={`py-2 rounded-lg font-bold ${entryType === 'goal' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Meta
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('budget')}
                  className={`py-2 rounded-lg font-bold ${entryType === 'budget' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Teto
                </button>
              </div>
            )}

            {entryType === 'transaction' && (
              <>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Descrição</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Aluguel, Mercado"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Data de Início</label>
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Categoria</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                    >
                      {categoriesList.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tipo</label>
                    <select
                      value={transType}
                      onChange={(e) => setTransType(e.target.value as 'income' | 'expense')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                    >
                      <option value="expense">Despesa</option>
                      <option value="income">Receita</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Pagador</label>
                    <select
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                    >
                      <option value="Conjunto">Conjunto</option>
                      <option value={COUPLE_NAMES.HE}>{COUPLE_NAMES.HE}</option>
                      <option value={COUPLE_NAMES.SHE}>{COUPLE_NAMES.SHE}</option>
                    </select>
                  </div>
                </div>

                {/* Seletor de Fixo ou Variável quando for Despesa */}
                {transType === 'expense' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Natureza do Gasto</label>
                      <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setExpenseNature('fixo')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${expenseNature === 'fixo' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                        >
                          📌 Gasto Fixo
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpenseNature('variavel')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${expenseNature === 'variavel' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                        >
                          🛒 Gasto Variável
                        </button>
                      </div>
                    </div>

                    {/* Opção de Recorrência Automática (Apenas para novos gastos fixos) */}
                    {expenseNature === 'fixo' && !editingId && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Repeat size={14} className="text-amber-400" /> Repetir automaticamente nos próximos meses?
                          </label>
                          <input
                            type="checkbox"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                            className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          />
                        </div>

                        {isRecurring && (
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Quantos meses vai repetir?</label>
                            <select
                              value={recurrenceMonths}
                              onChange={(e) => setRecurrenceMonths(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                            >
                              <option value="3">3 Meses</option>
                              <option value="6">6 Meses</option>
                              <option value="12">12 Meses (1 Ano)</option>
                              <option value="24">24 Meses (2 Anos)</option>
                              <option value="36">36 Meses (3 Anos)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {entryType === 'investment' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Ticker (Código)</label>
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                      placeholder="Ex: HGLG11, PETR4"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Classe</label>
                    <select
                      value={assetClass}
                      onChange={(e) => setAssetClass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                    >
                      <option value="FIIs">FIIs</option>
                      <option value="Ações">Ações</option>
                      <option value="Renda Fixa">Renda Fixa</option>
                      <option value="Cripto">Cripto</option>
                      <option value="Internacional">Internacional</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Quantidade</label>
                    <input
                      type="number"
                      step="any"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="10"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Preço Médio</label>
                    <input
                      type="number"
                      step="0.01"
                      value={avgPrice}
                      onChange={(e) => setAvgPrice(e.target.value)}
                      placeholder="160.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Preço Teto</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ceilingPrice}
                      onChange={(e) => setCeilingPrice(e.target.value)}
                      placeholder="175.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Responsável / Dono do Ativo</label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                  >
                    <option value="Conjunto">Conjunto</option>
                    <option value={COUPLE_NAMES.HE}>{COUPLE_NAMES.HE}</option>
                    <option value={COUPLE_NAMES.SHE}>{COUPLE_NAMES.SHE}</option>
                  </select>
                </div>
              </>
            )}

            {entryType === 'dividend' && (
              <>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Ticker do Ativo</label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="Ex: MXRF11"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 uppercase"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Valor Recebido (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="12.50"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Data Pagamento</label>
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {entryType === 'goal' && (
              <>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Título da Meta</label>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="Ex: Reserva de Emergência, Viagem"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Valor Objetivo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      placeholder="10000.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Valor Atual Guardado (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={goalCurrent}
                      onChange={(e) => setGoalCurrent(e.target.value)}
                      placeholder="1500.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Prazo Limite (Opcional)</label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                  />
                </div>
              </>
            )}

            {entryType === 'budget' && (
              <>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Categoria</label>
                  <select
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                  >
                    {categoriesList.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Limite do Teto Mês ({selectedMonth}/{selectedYear})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="Ex: 1500.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold p-3.5 rounded-xl transition duration-200 mt-2"
            >
              {editingId ? 'Atualizar Registro' : 'Salvar Dados'}
            </button>
          </form>
        )}
      </main>

      {/* --- MODAL FLUTUANTE DE DETALHES (FIXOS / VARIÁVEIS) --- */}
      {modalNature && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${modalNature === 'fixo' ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  {modalNature === 'fixo' ? 'Detalhes: Gastos Fixos' : 'Detalhes: Gastos Variáveis'}
                </h3>
              </div>
              <button 
                onClick={() => setModalNature(null)} 
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg bg-slate-800/50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {(modalNature === 'fixo' ? fixedTransactionsList : variableTransactionsList).length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Nenhum gasto registrado nesta categoria para este período.
                </div>
              ) : (
                (modalNature === 'fixo' ? fixedTransactionsList : variableTransactionsList).map((t) => (
                  <div key={t.id} className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">{t.description}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(t.date).toLocaleDateString('pt-BR')} • {t.category} • {t.paid_by}
                      </p>
                    </div>
                    <p className="font-bold text-rose-400">
                      R$ {Number(t.amount).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400">Total Categoria:</span>
              <span className={modalNature === 'fixo' ? 'text-amber-400' : 'text-cyan-400'}>
                R$ {(modalNature === 'fixo' ? totalFixedExpense : totalVariableExpense).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar Fixo */}
      <nav className="fixed bottom-0 w-full max-w-md bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 flex justify-around p-2.5 z-20">
        <button
          onClick={() => { resetForm(); setActiveTab('dash'); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dash' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Wallet size={18} />
          <span className="text-[9px] font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => { resetForm(); setActiveTab('budgets'); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'budgets' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Scale size={18} />
          <span className="text-[9px] font-medium">Orçamento</span>
        </button>

        <button
          onClick={() => { resetForm(); setActiveTab('add'); }}
          className="flex flex-col items-center justify-center -mt-5 bg-emerald-500 text-slate-950 p-3 rounded-full shadow-lg hover:bg-emerald-400 transition"
        >
          <PlusCircle size={22} />
        </button>

        <button
          onClick={() => { resetForm(); setActiveTab('goals'); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'goals' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Target size={18} />
          <span className="text-[9px] font-medium">Metas</span>
        </button>

        <button
          onClick={() => { resetForm(); setActiveTab('investments'); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'investments' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <TrendingUp size={18} />
          <span className="text-[9px] font-medium">Carteira</span>
        </button>
      </nav>
    </div>
  );
}