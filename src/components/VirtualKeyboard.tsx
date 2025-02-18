'use client';

import { useState } from 'react';
import { ArrowUp, Delete, Space, Globe, CornerDownLeft } from 'lucide-react';
import { useFont } from '@/contexts/FontContext';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  useCustomFont: boolean;
}

export function VirtualKeyboard({ onKeyPress, onDelete, useCustomFont }: VirtualKeyboardProps) {
  const { toggleFont } = useFont();
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // 쉬프트 상태에 따른 키 매핑
  const getShiftedKey = (key: string) => {
    const shiftMap: { [key: string]: string } = {
      'ㅔ': 'ㅖ',
      'ㅐ': 'ㅒ',
    };
    return isShiftPressed && shiftMap[key] ? shiftMap[key] : key;
  };

  const keys = [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['SHIFT', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', 'DEL'],
    ['FONT', 'SPACE', 'ENTER']
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 shadow-lg">
      <div className="max-w-md mx-auto space-y-2">
        {keys.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`flex gap-1 justify-center ${
              rowIndex === 1 ? 'mx-4' : ''
            }`}
          >
            {row.map((key) => (
              <button
                key={key}
                className={`h-12 rounded-lg ${
                  useCustomFont ? 'font-custom' : 'font-["Pretendard"]'
                } ${
                  key === 'DEL' 
                    ? 'bg-red-500 text-white hover:bg-red-600 w-20 flex items-center justify-center'
                    : key === 'SHIFT'
                    ? `bg-gray-500 text-white hover:bg-gray-600 w-20 flex items-center justify-center ${isShiftPressed ? 'bg-gray-700' : ''}`
                    : key === 'SPACE'
                    ? 'bg-gray-500 text-white hover:bg-gray-600 flex-1 flex items-center justify-center'
                    : key === 'FONT'
                    ? 'bg-gray-500 text-white hover:bg-gray-600 w-20 flex items-center justify-center'
                    : key === 'ENTER'
                    ? 'bg-gray-500 text-white hover:bg-gray-600 w-20 flex items-center justify-center'
                    : 'bg-white hover:bg-gray-50 active:bg-gray-100 w-10 text-gray-800'
                } font-medium text-lg shadow-sm transition-colors`}
                onClick={() => {
                  if (key === 'DEL') {
                    onDelete();
                  } else if (key === 'SPACE') {
                    onKeyPress(' ');
                  } else if (key === 'SHIFT') {
                    setIsShiftPressed(!isShiftPressed);
                  } else if (key === 'FONT') {
                    toggleFont();
                  } else if (key === 'ENTER') {
                    onKeyPress('\n');
                  } else {
                    onKeyPress(getShiftedKey(key));
                  }
                }}
              >
                {key === 'SPACE' ? (
                  <Space size={20} />
                ) : key === 'SHIFT' ? (
                  <ArrowUp size={20} />
                ) : key === 'DEL' ? (
                  <Delete size={20} />
                ) : key === 'FONT' ? (
                  <Globe size={20} />
                ) : key === 'ENTER' ? (
                  <CornerDownLeft size={20} />
                ) : (
                  getShiftedKey(key)
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 