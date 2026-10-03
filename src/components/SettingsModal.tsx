import { useState } from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  onClose: () => void;
}

export function SettingsModal({
  settings,
  onSaveSettings,
  onResetData,
  onClose,
}: SettingsModalProps) {
  const [title, setTitle] = useState(settings.title);
  const [rate, setRate] = useState(settings.mntToKrwRate.toString());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = parseFloat(rate);
    if (!isNaN(parsedRate) && parsedRate > 0) {
      onSaveSettings({
        ...settings,
        title: title.trim() || '향기나무네 가계부',
        mntToKrwRate: parsedRate,
        lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-[440px] w-full p-space-md shadow-xl flex flex-col space-y-space-md">
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary">settings</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">가계부 환경설정</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-outline"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col space-y-3">
          <div className="flex flex-col space-y-1">
            <label className="font-caption text-caption font-semibold text-on-surface-variant">
              가계부 명칭
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-caption text-caption font-semibold text-on-surface-variant">
                기준 환율 (1 MNT당 KRW)
              </label>
              <span className="font-caption text-caption text-secondary">
                1₮ ≈ {rate}원
              </span>
            </div>
            <input
              type="number"
              step="0.001"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md tabular-nums"
            />
            <span className="font-caption text-caption text-outline">
              * 한국 수출입은행 또는 몽골 중앙은행 고시 환율 기준 권장
            </span>
          </div>

          {/* Preset Rates */}
          <div className="flex gap-2 pt-1">
            {[0.381, 0.395, 0.400, 0.370].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRate(preset.toString())}
                className="flex-1 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-caption text-caption font-semibold"
              >
                1₮:{preset}₩
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-outline-variant/30 flex flex-col space-y-2">
            <label className="font-caption text-caption font-semibold text-on-surface-variant">
              데이터 관리
            </label>
            <button
              type="button"
              onClick={() => {
                if (confirm('초기 샘플 가계부 데이터로 되돌리시겠습니까?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-xl bg-error-container/30 text-error hover:bg-error-container/50 font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>데이터 초기화 (샘플 데이터 재설정)</span>
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-label-md"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md shadow-sm"
            >
              설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
