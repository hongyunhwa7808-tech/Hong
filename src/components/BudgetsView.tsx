import { useState } from 'react';
import { BudgetGoal, Transaction } from '../types';
import { formatNumber } from '../utils';

interface BudgetsViewProps {
  budgets: BudgetGoal[];
  transactions: Transaction[];
  mntToKrwRate: number;
  onUpdateBudget: (groupName: string, newAmount: number) => void;
}

export function BudgetsView({
  budgets,
  transactions,
  mntToKrwRate,
  onUpdateBudget,
}: BudgetsViewProps) {
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  // Calculate actual spending per category group
  const spendingMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      spendingMap[t.categoryGroup] = (spendingMap[t.categoryGroup] || 0) + t.amountMnt;
    });

  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.monthlyMnt, 0);
  const totalMonthlySpent = Object.values(spendingMap).reduce((sum, v) => sum + v, 0);
  const remainingBudget = totalMonthlyBudget - totalMonthlySpent;

  // Remaining days in October (current month in context is 2026-10-03, 31 - 3 = 28 days left)
  const remainingDays = 28;
  const dailySafeSpendMnt = Math.max(0, Math.round(remainingBudget / remainingDays));
  const dailySafeSpendKrw = Math.round(dailySafeSpendMnt * mntToKrwRate);

  const handleStartEdit = (b: BudgetGoal) => {
    setEditingGroup(b.groupName);
    setEditAmount(b.monthlyMnt.toString());
  };

  const handleSaveEdit = (groupName: string) => {
    const val = parseInt(editAmount, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(groupName, val);
    }
    setEditingGroup(null);
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-space-md">
      {/* 1. Monthly Budget Overview */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-secondary">trending_up</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">10월 지출 계획 & 예산</h2>
          </div>
          <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-semibold">
            5대 사역·가정 원칙
          </span>
        </div>

        {/* Big Safe Daily Spending Meter */}
        <div className="bg-surface-container-low/70 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="font-caption text-caption text-on-surface-variant mb-1">
            이달 남은 28일 기준 일일 권장 지출액
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display-mobile text-display-mobile tracking-tight text-primary tabular-nums">
              {formatNumber(dailySafeSpendMnt)}
            </span>
            <span className="font-headline-md text-headline-md text-outline">₮</span>
          </div>
          <span className="font-body-sm text-body-sm text-secondary mt-0.5">
            ≈ 하루 약 {formatNumber(dailySafeSpendKrw)}원 이내 지출 권장
          </span>
        </div>

        {/* Total Budget vs Total Spent */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-surface-container-low/50 rounded-xl p-3 border border-outline-variant/30 flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">월 총 예산 한도</span>
            <span className="font-label-md text-label-md text-on-surface tabular-nums mt-1 font-bold">
              {formatNumber(totalMonthlyBudget)} ₮
            </span>
            <span className="font-caption text-caption text-outline mt-0.5">
              ≈ {formatNumber(Math.round(totalMonthlyBudget * mntToKrwRate))}원
            </span>
          </div>

          <div className="bg-surface-container-low/50 rounded-xl p-3 border border-outline-variant/30 flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">현재 총 지출액</span>
            <span className="font-label-md text-label-md text-error tabular-nums mt-1 font-bold">
              {formatNumber(totalMonthlySpent)} ₮
            </span>
            <span className="font-caption text-caption text-outline mt-0.5">
              남은 예산: {formatNumber(remainingBudget)}₮
            </span>
          </div>
        </div>
      </div>

      {/* 2. Detailed 5 Category Pillars Breakdown */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px] text-secondary">pie_chart</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">항목별 예산 집행 현황</h3>
          </div>
          <span className="font-caption text-caption text-outline">금액 클릭 시 수정</span>
        </div>

        <div className="flex flex-col space-y-4">
          {budgets.map((b) => {
            const spent = spendingMap[b.groupName] || 0;
            const pct = Math.min(100, Math.round((spent / b.monthlyMnt) * 100));
            const left = b.monthlyMnt - spent;
            const isDanger = pct >= 90;
            const isWarning = pct >= 70 && pct < 90;

            return (
              <div
                key={b.groupName}
                className="p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/30 flex flex-col space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {b.groupName}
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      {b.description}
                    </span>
                  </div>

                  <span
                    className={`font-caption text-caption px-2 py-0.5 rounded-full font-semibold ${
                      isDanger
                        ? 'bg-error-container text-error'
                        : isWarning
                        ? 'bg-secondary-fixed text-secondary'
                        : 'bg-tertiary-fixed text-on-tertiary-container'
                    }`}
                  >
                    {pct}% 집행
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDanger ? 'bg-error' : isWarning ? 'bg-secondary' : 'bg-on-tertiary-container'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Spent & Budget row */}
                <div className="flex items-center justify-between font-caption text-caption">
                  <span className="text-on-surface-variant tabular-nums">
                    지출: <strong className="text-on-surface font-semibold">{formatNumber(spent)}₮</strong> (잔여 {formatNumber(left)}₮)
                  </span>

                  {editingGroup === b.groupName ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-24 h-7 px-1.5 rounded bg-surface-container-high text-right tabular-nums text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(b.groupName)}
                        className="px-2 py-0.5 bg-primary text-on-primary rounded text-xs"
                      >
                        저장
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(b)}
                      className="text-secondary font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>목표: {formatNumber(b.monthlyMnt)}₮</span>
                      <span className="material-symbols-outlined text-[13px]">edit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
