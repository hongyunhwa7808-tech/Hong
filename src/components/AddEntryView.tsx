import { useState } from 'react';
import { Currency, TransactionType, Transaction } from '../types';
import {
  numberToKorean,
  formatNumber,
  INITIAL_EXPENSE_GROUPS,
  INITIAL_INCOME_GROUPS,
} from '../utils';

interface AddEntryViewProps {
  mntToKrwRate: number;
  onSaveTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function AddEntryView({ mntToKrwRate, onSaveTransaction }: AddEntryViewProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [currency, setCurrency] = useState<Currency>('MNT');
  const [rawAmount, setRawAmount] = useState<string>('350000');
  const [selectedGroup, setSelectedGroup] = useState<string>('의무 (고정/필수)');
  const [selectedCategory, setSelectedCategory] = useState<string>('식비');
  const [date, setDate] = useState<string>('2026-10-03');
  const [place, setPlace] = useState<string>('이마트 장보기');
  const [memo, setMemo] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string }>({
    title: '정상적으로 기록되었습니다',
    subtitle: '350,000₮ (식비) · 향기나무네 가계부',
  });

  const parsedAmount = parseInt(rawAmount || '0', 10);

  // Approximate converted amount
  let convertedHint = '';
  if (currency === 'MNT') {
    const krw = Math.round(parsedAmount * mntToKrwRate);
    convertedHint = `≈ ${formatNumber(krw)}원 (기준 1₮:${mntToKrwRate}₩)`;
  } else {
    const mnt = Math.round(parsedAmount / mntToKrwRate);
    convertedHint = `≈ ${formatNumber(mnt)}₮ (환율 반영)`;
  }

  const handleKeyClick = (val: string) => {
    if (rawAmount === '0') {
      setRawAmount(val === '000' ? '0' : val);
    } else {
      if (rawAmount.length < 10) {
        setRawAmount((prev) => prev + val);
      }
    }
  };

  const handleBackspace = () => {
    if (rawAmount.length <= 1) {
      setRawAmount('0');
    } else {
      setRawAmount((prev) => prev.slice(0, -1));
    }
  };

  const handleSelectCategory = (groupName: string, catName: string) => {
    setSelectedGroup(groupName);
    setSelectedCategory(catName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    let amountMnt = parsedAmount;
    let amountKrw = Math.round(parsedAmount * mntToKrwRate);

    if (currency === 'KRW') {
      amountKrw = parsedAmount;
      amountMnt = Math.round(parsedAmount / mntToKrwRate);
    }

    onSaveTransaction({
      type,
      amount: parsedAmount,
      currency,
      amountMnt,
      amountKrw,
      categoryGroup: selectedGroup,
      category: selectedCategory,
      date,
      place: place.trim() || (type === 'expense' ? '일반 지출' : '일반 수입'),
      memo: memo.trim(),
    });

    const unitSymbol = currency === 'MNT' ? '₮' : '원';
    setToastMessage({
      title: '정상적으로 기록되었습니다',
      subtitle: `${formatNumber(parsedAmount)}${unitSymbol} (${selectedCategory}) · 향기나무네 가계부`,
    });
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  const categoryGroups = type === 'expense' ? INITIAL_EXPENSE_GROUPS : INITIAL_INCOME_GROUPS;

  return (
    <div className="flex flex-col w-full pb-6 space-y-space-md">
      {/* CARD 1: 금액 입력 (Amount Entry & Fast Keypad) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md">
        {/* Type Selector (지출 / 수입) */}
        <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setSelectedGroup('의무 (고정/필수)');
              setSelectedCategory('식비');
            }}
            className={`py-2.5 rounded-lg font-label-md text-label-md transition-all duration-150 flex items-center justify-center gap-1.5 ${
              type === 'expense'
                ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">arrow_outward</span>
            <span>지출</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setSelectedGroup('선교 후원 및 지원');
              setSelectedCategory('정기후원금');
            }}
            className={`py-2.5 rounded-lg font-label-md text-label-md transition-all duration-150 flex items-center justify-center gap-1.5 ${
              type === 'income'
                ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">arrow_downward</span>
            <span>수입</span>
          </button>
        </div>

        {/* Currency Selector & Approximate Exchange Hint */}
        <div className="flex items-center justify-between px-1">
          <div className="inline-flex p-0.5 bg-surface-container rounded-full">
            <button
              type="button"
              onClick={() => setCurrency('MNT')}
              className={`px-3 py-1 rounded-full font-caption text-caption transition-all ${
                currency === 'MNT'
                  ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              ₮ 투그릭
            </button>
            <button
              type="button"
              onClick={() => setCurrency('KRW')}
              className={`px-3 py-1 rounded-full font-caption text-caption transition-all ${
                currency === 'KRW'
                  ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              ₩ 원화
            </button>
          </div>
          <div className="flex items-center gap-1 font-caption text-caption text-on-surface-variant">
            <span className="material-symbols-outlined text-[15px] text-outline">sync_alt</span>
            <span>{convertedHint}</span>
          </div>
        </div>

        {/* Display Amount */}
        <div className="bg-surface-container-low/70 rounded-xl px-space-md py-4 flex flex-col items-end justify-center min-h-[76px]">
          <div className="flex items-baseline justify-end gap-1.5 w-full">
            <span className="font-display-mobile text-display-mobile tracking-tight text-on-surface tabular-nums select-all">
              {formatNumber(parsedAmount)}
            </span>
            <span className="font-headline-md text-headline-md text-outline">
              {currency === 'MNT' ? '₮' : '₩'}
            </span>
          </div>
          <span className="font-caption text-caption text-secondary mt-0.5">
            {numberToKorean(parsedAmount, currency)}
          </span>
        </div>

        {/* Thumb-Friendly Keypad (3x4 Grid) */}
        <div className="grid grid-cols-3 gap-2 pt-1 select-none">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyClick(digit)}
              className="h-14 bg-surface-container-lowest text-on-surface font-headline-md text-headline-md rounded-xl shadow-xs active:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center border border-outline-variant/30"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeyClick('000')}
            className="h-14 bg-surface-container-low text-on-surface font-label-md text-label-md rounded-xl shadow-xs active:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center border border-outline-variant/30"
          >
            000
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('0')}
            className="h-14 bg-surface-container-lowest text-on-surface font-headline-md text-headline-md rounded-xl shadow-xs active:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center border border-outline-variant/30"
          >
            0
          </button>
          <button
            type="button"
            aria-label="한 글자 지우기"
            onClick={handleBackspace}
            className="h-14 bg-surface-container-low text-on-surface-variant rounded-xl shadow-xs active:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[24px]">backspace</span>
          </button>
        </div>
      </div>

      {/* CARD 2: 항목 (Category Chips with Structured Groups) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px] text-secondary">label</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">항목</h2>
          </div>
          <span className="font-caption text-caption text-secondary font-medium px-2 py-0.5 bg-surface-container-high rounded-full">
            선택: {selectedCategory}
          </span>
        </div>

        {/* Category Groups */}
        <div className="flex flex-col space-y-space-md">
          {categoryGroups.map((group) => (
            <div key={group.name} className="flex flex-col space-y-1.5">
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: group.dotColor }}
                />
                <span
                  className="font-caption text-caption font-semibold"
                  style={{ color: group.textColor }}
                >
                  {group.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(group.name, cat)}
                      className={`px-3 py-1.5 rounded-full font-body-sm text-body-sm transition-colors ${
                        isSelected
                          ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CARD 3: 세부 내용 (Details: Date, Place, Memo) */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[19px] text-secondary">edit_note</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">세부 내용</h2>
          </div>
          <span className="font-caption text-caption text-outline">선택 입력 가능</span>
        </div>

        {/* 1. 날짜 (Date) */}
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="entry-date"
            className="font-caption text-caption font-semibold text-on-surface-variant"
          >
            날짜
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
              calendar_today
            </span>
            <input
              id="entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-high transition-colors"
            />
          </div>
        </div>

        {/* 2. 내용 / 어디서 (Where / Description) */}
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="entry-place"
            className="font-caption text-caption font-semibold text-on-surface-variant"
          >
            내용 / 어디서
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
              storefront
            </span>
            <input
              id="entry-place"
              type="text"
              value={place}
              placeholder="예: 이마트 장보기"
              onChange={(e) => setPlace(e.target.value)}
              className="w-full h-12 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-high transition-colors"
            />
          </div>
        </div>

        {/* 3. 메모 (Memo) */}
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="entry-memo"
            className="font-caption text-caption font-semibold text-on-surface-variant"
          >
            메모
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
              description
            </span>
            <input
              id="entry-memo"
              type="text"
              value={memo}
              placeholder="메모 (안 적어도 됩니다)"
              onChange={(e) => setMemo(e.target.value)}
              className="w-full h-12 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-high transition-colors"
            />
          </div>
        </div>

        {/* Submit Primary Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-13 py-3.5 bg-primary-container hover:bg-primary text-on-primary font-headline-md text-headline-md rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>가계부에 저장</span>
          </button>
        </div>
      </form>

      {/* Subtle Success Notification Toast */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-[360px] w-[90%] bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 animate-bounce">
          <span className="material-symbols-outlined text-tertiary-fixed text-[22px]">
            verified
          </span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-md text-label-md truncate">{toastMessage.title}</span>
            <span className="font-caption text-caption text-inverse-on-surface/75 truncate">
              {toastMessage.subtitle}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
