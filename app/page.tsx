'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  PlusCircle, 
  Target, 
  Calculator, 
  PiggyBank, 
  PieChart as PieIcon,
  Layers,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'investments' | 'goals' | 'calc' | 'add'>('home');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulário Unificado
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Alimentação');
  const [paidBy, setPaidBy] = useState('Conjunto');

  // Calculadora Proporcional
  const [incomeHe, setIncomeHe] = useState('');
  const [incomeShe, setIncomeShe] = useState('');
  const [totalBills, setTotalBills] = useState('');

  // Buscar lançamentos do Supabase
  async function fetchTransactions() {
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (data) setTransactions(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Adicionar Lançamento
  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !amount) return;

    const { error } = await supabase.from('transactions').insert([
      {
        description,
        amount: parseFloat(amount),
        type,
        paid_by: paidBy,
      },
    ]);

    if (!error) {
      setDescription('');
      setAmount('');
      fetchTransactions();
      setActiveTab('home');
    }
  }

  // Cálculos Financeiros
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Cálculos da Calculadora
  const valHe = parseFloat(incomeHe) || 0;
  const valShe = parseFloat(incomeShe) || 0;
  const valBills = parseFloat(totalBills) || 0;
  const sumIncome = valHe + valShe;
  const pctHe = sumIncome > 0 ? (valHe / sumIncome) * 100 : 50;
  const pctShe = sumIncome > 0 ? (valShe / sumIncome) * 100 : 50;
  const payHe = (valBills * pctHe) / 100;
  const payShe = (valBills * pctShe) / 100;

  const chartData = [
    { name: 'Receitas', value: totalIncome, color: '#10B981' },
    { name: 'Despesas', value: totalExpense, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center pb-24">
      {/* Topbar Fixo */}
      <header className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Finanças do Casal
          </h1>
          <p className="text-xs text-slate-400">Painel Integrado de Gestão</p>
        </div>
        <div className="flex gap-1">
          <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
            E
          </span>
          <span className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/30">
            D
          </span>
        </div>
      </header>

      {/* Conteúdo das Telas */}
      <main className="w-full max-w-md p-4 space-y-6">

        {/* --- ABA 1: EXTRATO E PAINEL --- */}
        {activeTab === 'home' && (
          <>
            {/* Saldo Principal */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Saldo Atual do Casal</span>
              <p className={`text-3xl font-black mt-2 ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Resumo Entradas / Saídas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <DollarSign size={14} /> Receitas
                </p>
                <p className="text-lg font-bold text-slate-100 mt-1">
                  R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                  <DollarSign size={14} /> Despesas
                </p>
                <p className="text-lg font-bold text-slate-100 mt-1">
                  R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Gráficos de Balanço */}
            {(totalIncome > 0 || totalExpense > 0) && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Visão Proporcional</h3>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Lista de Transações */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-300">Últimas Transações</h3>
                <span className="text-xs text-slate-500">{transactions.length} registros</span>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <PiggyBank size={32} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-500">Nenhum lançamento cadastrado.</p>
                </div>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{t.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Pagador: <span className="text-emerald-400 font-semibold">{t.paid_by}</span></p>
                    </div>
                    <p className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* --- ABA 2: INVESTIMENTOS --- */}
        {activeTab === 'investments' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Investido</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">R$ 0,00</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" /> Alocação por Classe
              </h3>
              <p className="text-xs text-slate-400">
                Cadastre seus ativos (Ações, FIIs, Tesouro Direto, Cripto) para acompanhar a distribuição da carteira do casal.
              </p>
            </div>
          </div>
        )}

        {/* --- ABA 3: METAS E SONHOS --- */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-200">Metas & Objetivos do Casal</h2>
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Reserva de Emergência</span>
                <span className="text-emerald-400 font-bold">R$ 5.000 / R$ 20.000</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[25%]" />
              </div>
              <p className="text-[10px] text-slate-500 text-right">25% concluído</p>
            </div>
          </div>
        )}

        {/* --- ABA 4: CALCULADORA PROPORCIONAL --- */}
        {activeTab === 'calc' && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Calculator size={18} className="text-emerald-400" /> Divisão Proporcional de Contas
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Calcule a porcentagem justa que cada um deve contribuir para as despesas comuns com base nos salários.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Renda dele (R$)</label>
                <input
                  type="number"
                  value={incomeHe}
                  onChange={(e) => setIncomeHe(e.target.value)}
                  placeholder="3500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Renda dela (R$)</label>
                <input
                  type="number"
                  value={incomeShe}
                  onChange={(e) => setIncomeShe(e.target.value)}
                  placeholder="4500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Total de Contas Comuns (R$)</label>
              <input
                type="number"
                value={totalBills}
                onChange={(e) => setTotalBills(e.target.value)}
                placeholder="2500"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {sumIncome > 0 && valBills > 0 && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 mt-2">
                <p className="text-xs font-semibold text-slate-300">Resultado da Divisão:</p>
                <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                  <span className="text-slate-400">Ele ({pctHe.toFixed(1)}%):</span>
                  <span className="font-bold text-emerald-400">R$ {payHe.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">Dela ({pctShe.toFixed(1)}%):</span>
                  <span className="font-bold text-teal-400">R$ {payShe.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ABA 5: FORMULÁRIO DE NOVO LANÇAMENTO --- */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddTransaction} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-200 mb-2">Novo Lançamento</h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Supermercado, Aluguel, Investimento"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Quem Pagou?</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Conjunto">Conjunto</option>
                  <option value="Ele">Ele</option>
                  <option value="Dela">Dela</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold p-3.5 rounded-xl transition duration-200 mt-2 shadow-lg shadow-emerald-500/10"
            >
              Salvar Registro
            </button>
          </form>
        )}
      </main>

      {/* Menu Inferior Fixo estilo App */}
      <nav className="fixed bottom-0 w-full max-w-md bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 flex justify-around p-3 z-20">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Wallet size={18} />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        <button
          onClick={() => setActiveTab('investments')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'investments' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <TrendingUp size={18} />
          <span className="text-[10px] font-medium">Investir</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className="flex flex-col items-center justify-center -mt-6 bg-emerald-500 text-slate-950 p-3 rounded-full shadow-lg hover:bg-emerald-400 transition"
        >
          <PlusCircle size={22} />
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'goals' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Target size={18} />
          <span className="text-[10px] font-medium">Metas</span>
        </button>

        <button
          onClick={() => setActiveTab('calc')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'calc' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Calculator size={18} />
          <span className="text-[10px] font-medium">Divisão</span>
        </button>
      </nav>
    </div>
  );
}