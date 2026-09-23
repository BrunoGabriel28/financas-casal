'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, TrendingUp, DollarSign, PlusCircle, PieChart as PieIcon, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'investments' | 'add'>('home');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [paidBy, setPaidBy] = useState('Conjunto');
  const [transactions, setTransactions] = useState<any[]>([]);

  // Buscar transações
  async function fetchTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (data) setTransactions(data);
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Adicionar nova transação
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

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: 'Receitas', value: totalIncome, color: '#10B981' },
    { name: 'Despesas', value: totalExpense, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center pb-20">
      {/* Header Fixo */}
      <header className="w-full max-w-md bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Finanças do Casal
          </h1>
          <p className="text-xs text-slate-400">Controle Unificado & Investimentos</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
          C
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="w-full max-w-md p-4 space-y-6">
        {activeTab === 'home' && (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl col-span-2">
                <p className="text-xs text-slate-400">Saldo Consolidado</p>
                <p className={`text-2xl font-black mt-1 ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  R$ {balance.toFixed(2)}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <DollarSign size={14} /> Entradas
                </p>
                <p className="text-lg font-bold text-slate-100 mt-1">R$ {totalIncome.toFixed(2)}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <DollarSign size={14} /> Saídas
                </p>
                <p className="text-lg font-bold text-slate-100 mt-1">R$ {totalExpense.toFixed(2)}</p>
              </div>
            </div>

            {/* Gráfico de Rosca */}
            {totalIncome > 0 || totalExpense > 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Balanço do Mês</h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}

            {/* Lista de Últimas Transações */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">Últimos Lançamentos</h3>
              {transactions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhum lançamento cadastrado.</p>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{t.description}</p>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                        Pagador: {t.paid_by}
                      </span>
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

        {activeTab === 'add' && (
          <form onSubmit={handleAddTransaction} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-200 mb-2">Novo Lançamento</h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Mercado, Conta de Luz"
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
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold p-3 rounded-xl transition duration-200 mt-2"
            >
              Salvar Lançamento
            </button>
          </form>
        )}

        {activeTab === 'investments' && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-3">
            <TrendingUp size={36} className="mx-auto text-emerald-400" />
            <h3 className="text-base font-bold text-slate-200">Módulo de Investimentos</h3>
            <p className="text-xs text-slate-400">
              Aqui você poderá acompanhar a carteira de Ações, FIIs e Renda Fixa do casal.
            </p>
          </div>
        )}
      </main>

      {/* Menu Inferior Estilo App Mobile (Bottom Navigation) */}
      <nav className="fixed bottom-0 w-full max-w-md bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-20">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Wallet size={20} />
          <span className="text-[10px] font-medium">Extrato</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className="flex flex-col items-center justify-center -mt-6 bg-emerald-500 text-slate-950 p-3 rounded-full shadow-lg hover:bg-emerald-400 transition"
        >
          <PlusCircle size={24} />
        </button>

        <button
          onClick={() => setActiveTab('investments')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'investments' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <TrendingUp size={20} />
          <span className="text-[10px] font-medium">Investimentos</span>
        </button>
      </nav>
    </div>
  );
}