'use client';

import { useFont } from '@/contexts/FontContext';

export function FontToggle() {
  const { useCustomFont, toggleFont } = useFont();

  return (
    <button
      onClick={toggleFont}
      type="button"
      className="fixed top-4 right-4 px-4 py-2 bg-white rounded-lg shadow-sm border text-gray-800 text-sm transition-colors hover:bg-gray-50 z-50"
    >
      {useCustomFont ? '아스테룸어' : '한글'}
    </button>
  );
} 