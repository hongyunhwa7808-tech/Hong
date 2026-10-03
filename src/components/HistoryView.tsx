import { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatNumber } from '../utils';

interface HistoryViewProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export function HistoryView({ transactions, onDeleteTransaction }: HistoryViewProps) {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Unique categories in dataset
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPlace = t.place.toLowerCase().includes(q);
        const matchMemo = t.memo.toLowerCase().includes(q);
        const matchCategory = t.category.toLowerCase().includes(q);
        if (!matchPlace && !matchMemo && !matchCategory) return false;
      }
      return true;
    });
  }, [transactions, filterType, selectedCategory, searchQuery]);

  // Group by date (descending)
  const groupedByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filtered.forEach((t) => {
      if (!map[t.date]) {
        map[t.date] = [];
      }
      map[t.date].push(t);
    });

    const sortedDates = Object.keys(map).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map((date) => ({
      date,
      items: map[date],
    }));
  }, [filtered]);

  // Summary of filtered items
  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountMnt, 0);

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amountMnt, 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['날짜', '구분', '항목분류', '세부항목', '내용/어디서', '메모', '금액', '통화', '투그릭환산', '원화환산'];
    const rows = filtered.map((t) => [
      t.date,
      t.type === 'expense' ? '지출' : '수입',
      t.categoryGroup,
      t.category,
      `"${t.place.replace(/"/g, '""')}"`,
      `"${t.memo.replace(/"/g, '""')}"`,
      t.amount,
      t.currency,
      t.amountMnt,
      t.amountKrw,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `향기나무네_가계부내역_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-space-md">
      {/* 1. Header Filter & Search */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px] text-secondary">receipt_long</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">가계부 내역 원장</h2>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1 font-caption text-caption px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-medium"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span>CSV 내보내기</span>
          </button>
        </div>

        {/* Type Filter Buttons */}
        <div className="grid grid-cols-3 p-1 bg-surface-container-low rounded-xl">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`py-1.5 rounded-lg font-caption text-caption transition-all ${
              filterType === 'all'
                ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant'
            }`}
          >
            전체 ({filtered.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`py-1.5 rounded-lg font-caption text-caption transition-all ${
              filterType === 'expense'
                ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant'
            }`}
          >
            지출만
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`py-1.5 rounded-lg font-caption text-caption transition-all ${
              filterType === 'income'
                ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant'
            }`}
          >
            수입만
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="상호명, 메모, 항목 검색..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-high"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Category Pills Slider */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-full font-caption text-caption flex-shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-secondary text-on-secondary font-semibold'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            전체 항목
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full font-caption text-caption flex-shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-secondary text-on-secondary font-semibold'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filtered Aggregate Box */}
        <div className="bg-surface-container-low/70 rounded-xl p-3 flex justify-around text-center border border-outline-variant/30">
          <div>
            <span className="font-caption text-caption text-on-surface-variant block">조회 수입</span>
            <span className="font-label-md text-label-md text-on-tertiary-container font-bold tabular-nums">
              +{formatNumber(totalIncome)}₮
            </span>
          </div>
          <div className="w-[1px] bg-outline-variant/40" />
          <div>
            <span className="font-caption text-caption text-on-surface-variant block">조회 지출</span>
            <span className="font-label-md text-label-md text-error font-bold tabular-nums">
              -{formatNumber(totalExpense)}₮
            </span>
          </div>
        </div>
      </div>

      {/* 2. Grouped Daily Ledger Cards */}
      {groupedByDate.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-2">
          <span className="material-symbols-outlined text-[36px] text-outline">description</span>
          <span className="font-body-md text-body-md text-on-surface font-medium">
            해당 조건의 내역이 없습니다
          </span>
          <span className="font-caption text-caption text-on-surface-variant">
            검색어나 필터 조건을 변경해 보세요
          </span>
        </div>
      ) : (
        groupedByDate.map((group) => {
          const dayExpense = group.items
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amountMnt, 0);

          return (
            <div
              key={group.date}
              className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-2"
            >
              {/* Date Header with Archival Ruled Line */}
              <div className="flex items-center justify-between pb-2 border-b border-dashed border-outline-variant">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    {group.date}
                  </span>
                </div>
                {dayExpense > 0 && (
                  <span className="font-caption text-caption text-outline tabular-nums">
                    일일 지출: {formatNumber(dayExpense)}₮
                  </span>
                )}
              </div>

              {/* Transactions List */}
              <div className="divide-y divide-outline-variant/20">
                {group.items.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          tx.type === 'expense'
                            ? 'bg-surface-container-low text-secondary'
                            : 'bg-tertiary-fixed/50 text-on-tertiary-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {tx.type === 'expense' ? 'receipt' : 'savings'}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                            {tx.place}
                          </span>
                          <span className="font-caption text-caption px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant">
                            {tx.category}
                          </span>
                        </div>
                        {tx.memo && (
                          <span className="font-caption text-caption text-on-surface-variant truncate">
                            {tx.memo}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                      <div className="flex flex-col items-end">
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

                      <button
                        type="button"
                        aria-label="삭제"
                        onClick={() => {
                          if (confirm(`'${tx.place}' 내역을 삭제하시겠습니까?`)) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-error-container/40 text-outline hover:text-error transition-colors ml-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
