import { useState } from 'react';
import { Account, Currency } from '../types';
import { formatNumber } from '../utils';

interface AssetsViewProps {
  accounts: Account[];
  mntToKrwRate: number;
  onUpdateAccountBalance: (id: string, newBalance: number) => void;
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
}

export function AssetsView({
  accounts,
  mntToKrwRate,
  onUpdateAccountBalance,
  onAddAccount,
}: AssetsViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New account form state
  const [newName, setNewName] = useState<string>('');
  const [newBank, setNewBank] = useState<string>('');
  const [newCurrency, setNewCurrency] = useState<Currency>('MNT');
  const [newBalance, setNewBalance] = useState<string>('');
  const [newAccountNum, setNewAccountNum] = useState<string>('');

  // Calculate Net Worth
  const mntAccounts = accounts.filter((a) => a.currency === 'MNT');
  const krwAccounts = accounts.filter((a) => a.currency === 'KRW');

  const totalMntBalance = mntAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalKrwBalance = krwAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Consolidated Net Worth in both currencies
  const netWorthInMnt = totalMntBalance + Math.round(totalKrwBalance / mntToKrwRate);
  const netWorthInKrw = Math.round(totalMntBalance * mntToKrwRate) + totalKrwBalance;

  const handleStartEdit = (acc: Account) => {
    setEditingId(acc.id);
    setEditBalance(acc.balance.toString());
  };

  const handleSaveEdit = (id: string) => {
    const val = parseInt(editBalance, 10);
    if (!isNaN(val)) {
      onUpdateAccountBalance(id, val);
    }
    setEditingId(null);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddAccount({
      name: newName.trim(),
      bank: newBank.trim() || (newCurrency === 'MNT' ? '몽골 시중은행' : '국내 은행'),
      currency: newCurrency,
      balance: parseInt(newBalance || '0', 10),
      icon: newCurrency === 'MNT' ? 'account_balance' : 'savings',
      accountNumber: newAccountNum.trim() || undefined,
    });

    setNewName('');
    setNewBank('');
    setNewBalance('');
    setNewAccountNum('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-space-md">
      {/* 1. Net Worth Hero Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-secondary">account_balance_wallet</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">가족 총 순자산</h2>
          </div>
          <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-semibold">
            통합 자산 관리
          </span>
        </div>

        {/* Big Dual Currency Net Worth Display */}
        <div className="bg-surface-container-low/70 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="font-caption text-caption text-on-surface-variant mb-1">
            환율 적용 통합 평가액
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display-mobile text-display-mobile tracking-tight text-on-surface tabular-nums">
              {formatNumber(netWorthInMnt)}
            </span>
            <span className="font-headline-md text-headline-md text-outline">₮</span>
          </div>
          <span className="font-body-md text-body-md font-semibold text-secondary mt-0.5">
            ≈ {formatNumber(netWorthInKrw)}원
          </span>
        </div>

        {/* Split Subtotals */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-surface-container-low/50 rounded-xl p-3 border border-outline-variant/30 flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">몽골 투그릭(₮) 자산</span>
            <span className="font-label-md text-label-md text-on-surface tabular-nums mt-1 font-bold">
              {formatNumber(totalMntBalance)} ₮
            </span>
            <span className="font-caption text-caption text-outline mt-0.5">
              ≈ {formatNumber(Math.round(totalMntBalance * mntToKrwRate))}원
            </span>
          </div>

          <div className="bg-surface-container-low/50 rounded-xl p-3 border border-outline-variant/30 flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">한국 원화(₩) 자산</span>
            <span className="font-label-md text-label-md text-on-surface tabular-nums mt-1 font-bold">
              {formatNumber(totalKrwBalance)} 원
            </span>
            <span className="font-caption text-caption text-outline mt-0.5">
              ≈ {formatNumber(Math.round(totalKrwBalance / mntToKrwRate))}₮
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="w-full py-2.5 bg-primary-container text-on-primary font-label-md text-label-md rounded-xl shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 mt-1"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>새 통장 / 현금 지갑 등록</span>
        </button>
      </div>

      {/* 2. Mongolian Accounts List (₮) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">payments</span>
            <h3 className="font-label-md text-label-md text-on-surface font-semibold">몽골 현지 통장 및 현금</h3>
          </div>
          <span className="font-caption text-caption text-outline">{mntAccounts.length}개 보유</span>
        </div>

        <div className="divide-y divide-outline-variant/20">
          {mntAccounts.map((acc) => (
            <div key={acc.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low text-secondary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{acc.icon}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                    {acc.name}
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant truncate">
                    {acc.bank} {acc.accountNumber ? `· ${acc.accountNumber}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                {editingId === acc.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="w-28 h-8 px-2 rounded bg-surface-container-high text-on-surface text-right font-body-sm tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(acc.id)}
                      className="px-2 py-1 bg-primary text-on-primary rounded text-xs"
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => handleStartEdit(acc)}
                    className="flex flex-col items-end cursor-pointer hover:opacity-80 transition-opacity"
                    title="클릭하여 잔액 수정"
                  >
                    <span className="font-label-md text-label-md text-on-surface tabular-nums font-bold">
                      {formatNumber(acc.balance)} ₮
                    </span>
                    <span className="font-caption text-caption text-outline">
                      ≈ {formatNumber(Math.round(acc.balance * mntToKrwRate))}원
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Korean Won Accounts List (₩) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-on-tertiary-container">savings</span>
            <h3 className="font-label-md text-label-md text-on-surface font-semibold">한국 국내 후원 통장 및 저축</h3>
          </div>
          <span className="font-caption text-caption text-outline">{krwAccounts.length}개 보유</span>
        </div>

        <div className="divide-y divide-outline-variant/20">
          {krwAccounts.map((acc) => (
            <div key={acc.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/40 text-on-tertiary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{acc.icon}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                    {acc.name}
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant truncate">
                    {acc.bank} {acc.accountNumber ? `· ${acc.accountNumber}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                {editingId === acc.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="w-28 h-8 px-2 rounded bg-surface-container-high text-on-surface text-right font-body-sm tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(acc.id)}
                      className="px-2 py-1 bg-primary text-on-primary rounded text-xs"
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => handleStartEdit(acc)}
                    className="flex flex-col items-end cursor-pointer hover:opacity-80 transition-opacity"
                    title="클릭하여 잔액 수정"
                  >
                    <span className="font-label-md text-label-md text-on-surface tabular-nums font-bold">
                      {formatNumber(acc.balance)} 원
                    </span>
                    <span className="font-caption text-caption text-outline">
                      ≈ {formatNumber(Math.round(acc.balance / mntToKrwRate))}₮
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-[420px] w-full p-space-md shadow-xl flex flex-col space-y-space-md">
            <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30">
              <h3 className="font-headline-md text-headline-md text-on-surface">새 계좌/통장 등록</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="flex flex-col space-y-3">
              <div className="flex flex-col space-y-1">
                <label className="font-caption text-caption font-semibold text-on-surface-variant">
                  계좌 또는 지갑 별칭
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 칸은행 자녀 교육비 통장"
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col space-y-1">
                  <label className="font-caption text-caption font-semibold text-on-surface-variant">
                    금융기관 / 은행
                  </label>
                  <input
                    type="text"
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    placeholder="예: Khan Bank"
                    className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-caption text-caption font-semibold text-on-surface-variant">
                    기준 통화
                  </label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value as Currency)}
                    className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm"
                  >
                    <option value="MNT">₮ 몽골 투그릭</option>
                    <option value="KRW">₩ 대한민국 원</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-caption text-caption font-semibold text-on-surface-variant">
                  현재 잔액
                </label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="0"
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm tabular-nums"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-caption text-caption font-semibold text-on-surface-variant">
                  계좌번호 (선택)
                </label>
                <input
                  type="text"
                  value={newAccountNum}
                  onChange={(e) => setNewAccountNum(e.target.value)}
                  placeholder="예: 5012-****-1234"
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-label-md"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md shadow-sm"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
