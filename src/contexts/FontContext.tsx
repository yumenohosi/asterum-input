'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { decomposeHangul } from '@/utils/hangulUtils';

interface FontContextType {
  useCustomFont: boolean;
  toggleFont: () => void;
  text: string;
  setText: (text: string) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [useCustomFont, setUseCustomFont] = useState(false);
  const [text, setText] = useState('');

  const toggleFont = () => {
    setUseCustomFont((prev) => {
      // 폰트 토글할 때마다 텍스트 자모 분리
      const newText = decomposeHangul(text);
      setText(newText);
      return !prev;
    });
  };

  return (
    <FontContext.Provider value={{ useCustomFont, toggleFont, text, setText }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
} 