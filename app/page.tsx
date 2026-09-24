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
  PieChart as PieIcon,
  BarChart3,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Coins
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dash' | 'finances' | 'investments' | 'dividends' | 'tools' | 'add'>('dash');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [dividends, setDividends] = useState<any[]>([]);

  // Formulário Unificado
  const [entryType, setEntryType] = useState<'transaction' | 'investment' | 'dividend'>('transaction');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transType, setTransType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Mercado');
  const [paidBy, setPaidBy] = useState('Conjunto');

  // Investimentos Form
  const [ticker, setTicker] = useState('');
  const [assetClass, setAssetClass] = useState('FIIs');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [ceilingPrice, setCeilingPrice] = useState('');

  // Calculadora Proporcional
  const [incomeHe, setIncomeHe] = useState('');
  const [incomeShe, setIncomeShe] = useState('');
  const [totalBills, setTotalBills] = useState('');

  // Buscar dados
  async function loadData() {
    const { data: transData, error: transError } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (transData) setTransactions(transData);

    const { data: invData, error: invError } = await supabase.from('investment_assets').select('*');
    if (invData) setInvestments(invData);

    const { data: divData, error: divError } = await supabase.from('dividends').select('*');
    if (divData) setDividends(divData);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Adicionar Lançamento Unificado (Corrigido com validação e tratamento de erro)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (entryType === 'transaction') {
        const { error } = await supabase.from('transactions').insert([{
          description,
          amount: parseFloat(amount),
          type: transType,
          category,
          paid_by: paidBy,
          date: new Date().toISOString()
        }]);
        if (error) throw error;

      } else if (entryType === 'investment') {
        const { error } = await supabase.from('investment_assets').insert([{
          ticker: ticker.toUpperCase(),
          asset_class: assetClass,
          quantity: parseFloat(quantity),
          average_price: parseFloat(avgPrice),
          current_price: parseFloat(avgPrice),
          ceiling_price: ceilingPrice ? parseFloat(ceilingPrice) : 0,
          owner: paidBy
        }]);
        if (error) throw error;

      } else if (entryType === 'dividend') {
        const { error } = await supabase.from('dividends').insert([{
          ticker: ticker.toUpperCase(),
          amount: parseFloat(amount),
          payment_date: new Date().toISOString().split('T')[0]
        }]);
        if (error) throw error;
      }

      // Limpeza dos estados
      setDescription('');
      setAmount('');
      setTicker('');
      setQuantity('');
      setAvgPrice('');
      setCeilingPrice('');

      // Recarrega os dados e redireciona
      await loadData();
      setActiveTab('dash');
      alert('Lançamento salvo com sucesso!');

    } catch (err: any) {
      console.error('Erro ao salvar lançamento:', err);
      alert(`Erro ao salvar no banco de dados: ${err.message || 'Verifique as permissões ou conexões.'}`);
    }
  }

  // Cálculos Financeiros
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const monthlyBalance = totalIncome - totalExpense;

  // Cálculos de Investimentos
  const totalInvested = investments.reduce((acc, inv) => acc + (Number(inv.quantity) * Number(inv.average_price)), 0);
  const totalDividends = dividends.reduce((acc, d) => acc + Number(d.amount), 0);
  const netWorth = monthlyBalance + totalInvested;

  // Cálculos da Calculadora
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center pb-24">
      {/* Topbar Fixo */}
      <header className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            FINANÇAS CASAL PRO
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Gestão & Patrimônio Consolidado</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">E</span>
          <span className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/30">D</span>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="w-full max-w-md p-4 space-y-5">

        {/* --- ABA 1: DASHBOARD PATRIMONIAL --- */}
        {activeTab === 'dash' && (
          <>
            {/* Card Patrimônio Líquido */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Sparkles size={80} className="text-emerald-400" />
              </div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Patrimônio Líquido do Casal</span>
              <p className="text-3xl font-black text-slate-100 mt-1">
                R$ {netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Saldo em Conta</span>
                  <span className={`font-bold ${monthlyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    R$ {monthlyBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Investido</span>
                  <span className="font-bold text-cyan-400">
                    R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Resumo Mensal */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <ArrowUpRight size={14} /> Receitas Mês
                </p>
                <p className="text-base font-bold text-slate-100 mt-1">
                  R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <p className="text-xs text-rose-400 flex items-center gap-1 font-semibold">
                  <ArrowDownRight size={14} /> Despesas Mês
                </p>
                <p className="text-base font-bold text-slate-100 mt-1">
                  R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Card Dividendos do Mês */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Coins size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Proventos Recebidos</p>
                  <p className="text-base font-bold text-emerald-400">R$ {totalDividends.toFixed(2)}</p>
                </div>
              </div>
              <button onClick={() => setActiveTab('dividends')} className="text-xs text-slate-400 hover:text-emerald-400 underline">
                Ver detalhes
              </button>
            </div>

            {/* Extrato Recente */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lançamentos Recentes</h3>
                <span className="text-[10px] text-slate-500">{transactions.length} itens</span>
              </div>

              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-slate-200">{t.description}</p>
                    <span className="text-[10px] text-slate-500">Pago por: {t.paid_by}</span>
                  </div>
                  <p className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- ABA 2: FINANÇAS & ORÇAMENTO --- */}
        {activeTab === 'finances' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-200">Orçamento & Categorias</h2>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-3">
              <p className="text-slate-400">Controle de gastos por categorias baseadas nas suas planilhas:</p>
              <div className="grid grid-cols-2 gap-2">
                {categoriesList.map((cat, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <p className="text-slate-300 font-medium">{cat}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Previsto vs Realizado</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- ABA 3: CARTEIRA DE INVESTIMENTOS --- */}
        {activeTab === 'investments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-200">Carteira de Ativos</h2>
              <span className="text-xs text-emerald-400 font-bold">Total: R$ {totalInvested.toFixed(2)}</span>
            </div>

            {investments.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
                <TrendingUp size={32} className="mx-auto text-slate-600" />
                <p className="text-xs text-slate-400">Nenhum ativo cadastrado na carteira.</p>
                <button onClick={() => { setEntryType('investment'); setActiveTab('add'); }} className="text-xs text-emerald-400 font-bold underline">
                  Cadastrar Primeiro Ativo
                </button>
              </div>
            ) : (
              investments.map((inv) => {
                const totalAsset = Number(inv.quantity) * Number(inv.average_price);
                const isBelowCeiling = inv.ceiling_price > 0 && inv.current_price <= inv.ceiling_price;

                return (
                  <div key={inv.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {inv.ticker}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2">{inv.asset_class}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-100">R$ {totalAsset.toFixed(2)}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                      <div>
                        <span>Qtd:</span> <strong className="text-slate-200 block">{inv.quantity}</strong>
                      </div>
                      <div>
                        <span>Preço Médio:</span> <strong className="text-slate-200 block">R$ {Number(inv.average_price).toFixed(2)}</strong>
                      </div>
                      <div>
                        <span>Preço Teto:</span> 
                        <strong className={`block ${isBelowCeiling ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {inv.ceiling_price > 0 ? `R$ ${Number(inv.ceiling_price).toFixed(2)}` : 'N/A'}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })
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
                      <p className="text-[10px] text-slate-500">{d.payment_date}</p>
                    </div>
                    <p className="font-bold text-slate-100">+ R$ {Number(d.amount).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- ABA 5: FERRAMENTAS DO CASAL --- */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            {/* Calculadora Proporcional */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Calculator size={16} className="text-emerald-400" /> Divisão Proporcional por Renda
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Salário Ele (R$)</label>
                  <input
                    type="number"
                    value={incomeHe}
                    onChange={(e) => setIncomeHe(e.target.value)}
                    placeholder="3500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Salário Dela (R$)</label>
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
                    <span className="text-slate-400">Ele ({pctHe.toFixed(1)}%):</span>
                    <span className="font-bold text-emerald-400">R$ {payHe.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dela ({pctShe.toFixed(1)}%):</span>
                    <span className="font-bold text-teal-400">R$ {payShe.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ABA DE CADASTRO UNIFICADO --- */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-200">Novo Registro</h2>

            {/* Seletor de Tipo de Registro */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
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
                Investimento
              </button>
              <button
                type="button"
                onClick={() => setEntryType('dividend')}
                className={`py-2 rounded-lg font-bold ${entryType === 'dividend' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
              >
                Dividendo
              </button>
            </div>

            {/* Campos de Transação */}
            {entryType === 'transaction' && (
              <>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Descrição</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Mercado, Conta de Luz"
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
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tipo</label>
                    <select
                      value={transType}
                      onChange={(e: any) => setTransType(e.target.value)}
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
                      <option value="Ele">Ele</option>
                      <option value="Dela">Dela</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Campos de Investimento */}
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

                <div className="grid grid-cols-2 gap-2">
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
                    <label className="text-[10px] text-slate-400 block mb-1">Preço Médio (R$)</label>
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
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Preço Teto (R$) - Opcional</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ceilingPrice}
                    onChange={(e) => setCeilingPrice(e.target.value)}
                    placeholder="175.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                  />
                </div>
              </>
            )}

            {/* Campos de Dividendos */}
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
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Valor do Provento Recebido (R$)</label>
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
              </>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold p-3.5 rounded-xl transition duration-200 mt-2"
            >
              Salvar Dados
            </button>
          </form>
        )}
      </main>

      {/* Navigation Bar Fixo estilo App Mobile */}
      <nav className="fixed bottom-0 w-full max-w-md bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 flex justify-around p-2.5 z-20">
        <button
          onClick={() => setActiveTab('dash')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dash' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Wallet size={18} />
          <span className="text-[9px] font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('investments')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'investments' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <TrendingUp size={18} />
          <span className="text-[9px] font-medium">Carteira</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className="flex flex-col items-center justify-center -mt-5 bg-emerald-500 text-slate-950 p-3 rounded-full shadow-lg hover:bg-emerald-400 transition"
        >
          <PlusCircle size={22} />
        </button>

        <button
          onClick={() => setActiveTab('dividends')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dividends' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Coins size={18} />
          <span className="text-[9px] font-medium">Proventos</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'tools' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <Calculator size={18} />
          <span className="text-[9px] font-medium">Ferramentas</span>
        </button>
      </nav>
    </div>
  );
}