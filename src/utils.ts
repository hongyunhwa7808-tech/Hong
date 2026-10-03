import { Transaction, Account, BudgetGoal, AppSettings, Currency } from './types';

// Convert number into natural Korean words (e.g., 350000 -> 삼십오만, 1200000 -> 백이십만)
export function numberToKorean(num: number, currency: Currency): string {
  if (num === 0) {
    return currency === 'MNT' ? '영 투그릭' : '영 원';
  }

  const units = ['', '만', '억', '조'];
  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const subUnits = ['', '십', '백', '천'];

  let result = '';
  let unitIndex = 0;
  let tempNum = Math.abs(num);

  while (tempNum > 0) {
    const chunk = tempNum % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      let chunkTemp = chunk;
      for (let i = 0; i < 4; i++) {
        const digit = chunkTemp % 10;
        if (digit > 0) {
          const digitWord = digits[digit];
          const subUnitWord = subUnits[i];
          // For '일십', '일백', '일천' when i > 0, usually omit '일' unless single digit
          if (i > 0 && digit === 1) {
            chunkStr = subUnitWord + chunkStr;
          } else {
            chunkStr = digitWord + subUnitWord + chunkStr;
          }
        }
        chunkTemp = Math.floor(chunkTemp / 10);
      }
      result = chunkStr + units[unitIndex] + (result ? ' ' + result : '');
    }
    tempNum = Math.floor(tempNum / 10000);
    unitIndex++;
  }

  const suffix = currency === 'MNT' ? ' 투그릭' : ' 원';
  return (result.trim() || '영') + suffix;
}

export function formatNumber(val: number): string {
  return Math.round(val).toLocaleString('ko-KR');
}

export const INITIAL_SETTINGS: AppSettings = {
  mntToKrwRate: 0.381,
  title: '향기나무네 가계부',
  lastUpdated: '2026-10-03 21:40',
};

export const INITIAL_EXPENSE_GROUPS = [
  {
    name: '의무 (고정/필수)',
    dotColor: '#2E5395',
    textColor: '#395da0',
    items: ['학비', '주거·공과금', '식비', '교통·차량', '통신', '보험', '기타 의무'],
  },
  {
    name: '필요 (일상소비)',
    dotColor: '#004225',
    textColor: '#004225',
    items: ['의료', '생활용품', '의류', '교육·도서', '경조사', '외식·여가', '기타 필요'],
  },
  {
    name: '구제 및 사역',
    dotColor: '#93b6fe',
    textColor: '#395da0',
    items: ['구제헌금', '사역'],
  },
  {
    name: '예비비',
    dotColor: '#747780',
    textColor: '#44474f',
    items: ['차량 수리', '행정'],
  },
  {
    name: '저금',
    dotColor: '#002a16',
    textColor: '#002a16',
    items: ['적금', '기타 저축', '연금', '투자'],
  },
];

export const INITIAL_INCOME_GROUPS = [
  {
    name: '선교 후원 및 지원',
    dotColor: '#1F7A4D',
    textColor: '#1F7A4D',
    items: ['정기후원금', '특별후원금', '교회 파송비', '사역지 후원', '선물/격려금'],
  },
  {
    name: '기타 수입',
    dotColor: '#2E5395',
    textColor: '#395da0',
    items: ['이자·배당', '중고물품 판매', '환차익', '기타 수입'],
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: '칸은행 생활비 계좌',
    bank: 'Khan Bank (몽골)',
    currency: 'MNT',
    balance: 4250000,
    icon: 'account_balance',
    accountNumber: '5012-****-8819',
  },
  {
    id: 'acc-2',
    name: '골롬트 비상금 통장',
    bank: 'Golomt Bank (몽골)',
    currency: 'MNT',
    balance: 8600000,
    icon: 'savings',
    accountNumber: '1105-****-4201',
  },
  {
    id: 'acc-3',
    name: '현금 지갑 (투그릭)',
    bank: '수기 보관',
    currency: 'MNT',
    balance: 680000,
    icon: 'wallet',
  },
  {
    id: 'acc-4',
    name: '국민은행 선교후원 계좌',
    bank: 'KB국민은행 (한국)',
    currency: 'KRW',
    balance: 5420000,
    icon: 'volunteer_activism',
    accountNumber: '421802-**-******',
  },
  {
    id: 'acc-5',
    name: '신한은행 비상예금',
    bank: '신한은행 (한국)',
    currency: 'KRW',
    balance: 3100000,
    icon: 'account_balance_wallet',
    accountNumber: '110-***-99214',
  },
];

export const INITIAL_BUDGETS: BudgetGoal[] = [
  { groupName: '의무 (고정/필수)', monthlyMnt: 3200000, description: '주거 임차료, 난방비, 아이들 학비 및 공과금' },
  { groupName: '필요 (일상소비)', monthlyMnt: 1800000, description: '이마트 장보기, 식재료, 생필품, 병원비' },
  { groupName: '구제 및 사역', monthlyMnt: 1200000, description: '현지 이웃 구제, 게르 난방 연탄 나눔, 사역 모임' },
  { groupName: '예비비', monthlyMnt: 800000, description: '혹한기 차량 정비, 비자 행정 수수료, 응급 예비' },
  { groupName: '저금', monthlyMnt: 1000000, description: '선교지 안식년 및 자녀 장학 적금' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'expense',
    amount: 350000,
    currency: 'MNT',
    amountMnt: 350000,
    amountKrw: Math.round(350000 * 0.381),
    categoryGroup: '의무 (고정/필수)',
    category: '식비',
    date: '2026-10-03',
    place: '이마트 장보기',
    memo: '주말 가족 식자재 및 쌀 구입',
    createdAt: '2026-10-03T18:30:00Z',
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 120000,
    currency: 'MNT',
    amountMnt: 120000,
    amountKrw: Math.round(120000 * 0.381),
    categoryGroup: '의무 (고정/필수)',
    category: '교통·차량',
    date: '2026-10-02',
    place: '페트로비스 주유소',
    memo: '사역 차량 디젤 주유',
    createdAt: '2026-10-02T14:15:00Z',
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 250000,
    currency: 'MNT',
    amountMnt: 250000,
    amountKrw: Math.round(250000 * 0.381),
    categoryGroup: '구제 및 사역',
    category: '구제헌금',
    date: '2026-10-01',
    place: '게르촌 연탄 지원',
    memo: '독거 어르신 가정 2가구 겨울 연탄 나눔',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'tx-4',
    type: 'income',
    amount: 1500000,
    currency: 'KRW',
    amountMnt: Math.round(1500000 / 0.381),
    amountKrw: 1500000,
    categoryGroup: '선교 후원 및 지원',
    category: '정기후원금',
    date: '2026-10-01',
    place: '늘푸른교회 파송후원',
    memo: '10월 정기 사역비 및 생활비 지원',
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 85000,
    currency: 'MNT',
    amountMnt: 85000,
    amountKrw: Math.round(85000 * 0.381),
    categoryGroup: '필요 (일상소비)',
    category: '생활용품',
    date: '2026-09-29',
    place: '노민 백화점 수퍼',
    memo: '세제, 화장지, 보온용품',
    createdAt: '2026-09-29T16:20:00Z',
  },
  {
    id: 'tx-6',
    type: 'expense',
    amount: 450000,
    currency: 'MNT',
    amountMnt: 450000,
    amountKrw: Math.round(450000 * 0.381),
    categoryGroup: '의무 (고정/필수)',
    category: '주거·공과금',
    date: '2026-09-28',
    place: '울란바토르 시청 난방공사',
    memo: '동절기 중앙난방비 및 온수 선납',
    createdAt: '2026-09-28T11:00:00Z',
  },
];
