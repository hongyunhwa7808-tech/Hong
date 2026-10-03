import { useState } from 'react';
import { Transaction, BudgetGoal } from '../types';
import { formatNumber } from '../utils';

interface HomeViewProps {
  transactions: Transaction[];
  budgets: BudgetGoal[];
  mntToKrwRate: number;
  onNavigateToAdd: () => void;
  onNavigateToHistory: () => void;
}

export function HomeView({
  transactions,
  budgets,
  mntToKrwRate,
  onNavigateToAdd,
  onNavigateToHistory,
}: HomeViewProps) {
  const [calcMnt, setCalcMnt] = useState<string>('100000');
  const [calcKrw, setCalcKrw] = useState<string>('');

  // Calculate monthly stats
  const totalExpenseMnt = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountMnt, 0);
  const totalIncomeMnt = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amountMnt, 0);

  const totalExpenseKrw = Math.round(totalExpenseMnt * mntToKrwRate);
  const totalIncomeKrw = Math.round(totalIncomeMnt * mntToKrwRate);
  const netBalanceMnt = totalIncomeMnt - totalExpenseMnt;
  const netBalanceKrw = Math.round(netBalanceMnt * mntToKrwRate);

  // Group spending by 5 pillars
  const spendingByGroup: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      spendingByGroup[t.categoryGroup] = (spendingByGroup[t.categoryGroup] || 0) + t.amountMnt;
    });

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleCalcMntChange = (val: string) => {
    setCalcMnt(val);
    const num = parseFloat(val) || 0;
    setCalcKrw(Math.round(num * mntToKrwRate).toString());
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-space-md">
      {/* 1. Monthly Financial Snapshot */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-secondary">analytics</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">10월 재정 요약</h2>
          </div>
          <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-semibold">
            {netBalanceMnt >= 0 ? '순흑자' : '지출초과'}
          </span>
        </div>

        {/* Big Dual Currency Balance */}
        <div className="bg-surface-container-low/70 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="font-caption text-caption text-on-surface-variant mb-1">
            이달 가계 잔여금
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-display-mobile text-display-mobile tracking-tight tabular-nums ${
                netBalanceMnt >= 0 ? 'text-primary' : 'text-error'
              }`}
            >
              {netBalanceMnt >= 0 ? '+' : ''}
              {formatNumber(netBalanceMnt)}
            </span>
            <span className="font-headline-md text-headline-md text-outline">₮</span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            ≈ {formatNumber(netBalanceKrw)}원 (원화 환산)
          </span>
        </div>

        {/* Income vs Expense Cards */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-surface-container-low/50 rounded-xl p-3 border border-outline-variant/30 flex flex-col">
            <div className="flex items-center gap-1 text-on-tertiary-container font-caption text-caption font-semibold">
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              <span>총 수입</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface tabular-nums mt-1 font-bold">
              {formatNumber(totalIncomeMnt)}
              <span className="text-xs font-normal text-outline ml-0.5">₮</span>
            </span>
            <span className="font-caption text-caption text-on-surface-variant mt-0.5">
              ≈ {formatNumber(totalIncomeKrw)}원
            </span>
          </div>

          <div className="bg-surface-container-low/50 rounded-xl p-3 border border-outline-variant/30 flex flex-col">
            <div className="flex items-center gap-1 text-error font-caption text-caption font-semibold">
              <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
              <span>총 지출</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface tabular-nums mt-1 font-bold">
              {formatNumber(totalExpenseMnt)}
              <span className="text-xs font-normal text-outline ml-0.5">₮</span>
            </span>
            <span className="font-caption text-caption text-on-surface-variant mt-0.5">
              ≈ {formatNumber(totalExpenseKrw)}원
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToAdd}
          className="w-full py-3 bg-primary-container text-on-primary font-label-md text-label-md rounded-xl shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 mt-1"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>새 수입 / 지출 기록하기</span>
        </button>
      </div>

      {/* 2. Quick Dual-Currency Exchange Calculator */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px] text-secondary">currency_exchange</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">실시간 환율 계산기</h2>
          </div>
          <span className="font-caption text-caption text-outline">
            1₮ = {mntToKrwRate}₩
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 items-center">
          <div className="flex flex-col space-y-1">
            <label className="font-caption text-caption text-on-surface-variant">몽골 투그릭 (₮)</label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={calcMnt}
                onChange={(e) => handleCalcMntChange(e.target.value)}
                placeholder="100,000"
                className="w-full h-10 px-3 pr-7 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-high tabular-nums"
              />
              <span className="absolute right-2.5 text-outline text-xs">₮</span>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-caption text-caption text-on-surface-variant">대한민국 원화 (₩)</label>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={formatNumber(Math.round((parseFloat(calcMnt) || 0) * mntToKrwRate))}
                className="w-full h-10 px-3 pr-7 rounded-lg bg-surface-container-high text-on-surface font-body-md text-body-md focus:outline-none tabular-nums font-semibold"
              />
              <span className="absolute right-2.5 text-outline text-xs">원</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 5 Pillars Budget Progress */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px] text-secondary">donut_large</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">5대 사역·가정 예산 집행</h2>
          </div>
          <span className="font-caption text-caption text-outline">월 예산 대비</span>
        </div>

        <div className="flex flex-col space-y-3">
          {budgets.map((b) => {
            const spent = spendingByGroup[b.groupName] || 0;
            const pct = Math.min(100, Math.round((spent / b.monthlyMnt) * 100));
            const isWarning = pct > 85;

            return (
              <div key={b.groupName} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between text-caption font-caption">
                  <span className="font-semibold text-on-surface">{b.groupName}</span>
                  <span className="tabular-nums text-on-surface-variant">
                    <strong className="text-on-surface">{formatNumber(spent)}₮</strong> / {formatNumber(b.monthlyMnt)}₮ ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-low overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isWarning ? 'bg-error' : 'bg-secondary'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Transactions */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px] text-secondary">history</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">최근 가계부 내역</h2>
          </div>
          <button
            type="button"
            onClick={onNavigateToHistory}
            className="font-caption text-caption text-secondary hover:underline font-semibold"
          >
            전체 보기 →
          </button>
        </div>

        <div className="divide-y divide-outline-variant/20">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'expense'
                      ? 'bg-secondary-fixed/50 text-secondary'
                      : 'bg-tertiary-fixed/50 text-on-tertiary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {tx.type === 'expense' ? 'receipt' : 'account_balance'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                    {tx.place}
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant truncate">
                    {tx.date} · {tx.category} {tx.memo ? `· ${tx.memo}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end flex-shrink-0 pl-2">
                <span
                  className={`font-label-md text-label-md tabular-nums font-bold ${
                    tx.type === 'expense' ? 'text-on-surface' : 'text-on-tertiary-container'
                  }`}
                >
                  {tx.type === 'expense' ? '-' : '+'}
                  {formatNumber(tx.amount)}
                  <span className="text-xs font-normal text-outline ml-0.5">
                    {tx.currency === 'MNT' ? '₮' : '원'}
                  </span>
                </span>
                <span className="font-caption text-caption text-outline">
                  {tx.currency === 'MNT'
                    ? `≈ ${formatNumber(tx.amountKrw)}원`
                    : `≈ ${formatNumber(tx.amountMnt)}₮`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
