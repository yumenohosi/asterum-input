'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowUp, Delete, Space, Globe, CornerDownLeft, Keyboard } from 'lucide-react';
import { useFont } from '@/contexts/FontContext';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  useCustomFont: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputModeChange: (mode: "none" | "text") => void;
}

export function VirtualKeyboard({ onKeyPress, onDelete, useCustomFont, textareaRef, onInputModeChange }: VirtualKeyboardProps) {
  const { toggleFont } = useFont();
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const inputBufferRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

  // 네이티브 키보드 visibility 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      // null 체크 추가
      if (!window.visualViewport) return;
      
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      
      // null 체크 후 비교
      if (typeof viewportHeight === 'number') {
        const isNativeKeyboardVisible = viewportHeight < windowHeight;
        setIsVisible(!isNativeKeyboardVisible);
        onInputModeChange(isNativeKeyboardVisible ? "text" : "none");
      }
    };

    // visualViewport 존재 여부 체크
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', handleVisibilityChange);
      return () => {
        visualViewport.removeEventListener('resize', handleVisibilityChange);
      };
    }
  }, [onInputModeChange]);

  const handleKeyboardToggle = () => {
    setIsVisible(false);
    onInputModeChange("text");
    if (textareaRef?.current) {
      textareaRef.current.focus();
    }
  };

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
    ['FONT', 'KEYBOARD', 'SPACE', 'ENTER']
  ];

  const processInputBuffer = useCallback(() => {
    if (inputBufferRef.current.length === 0 || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    
    // 버퍼에 있는 모든 키를 한번에 처리
    const keysToProcess = [...inputBufferRef.current];
    inputBufferRef.current = [];
    
    // 배치로 키 처리
    keysToProcess.forEach(key => {
      onKeyPress(key);
    });
    
    isProcessingRef.current = false;
    
    // 버퍼에 새로운 키가 있다면 다음 프레임에서 처리
    if (inputBufferRef.current.length > 0) {
      requestAnimationFrame(processInputBuffer);
    }
  }, [onKeyPress]);

  const handleKeyPress = useCallback((key: string) => {
    inputBufferRef.current.push(key);
    requestAnimationFrame(processInputBuffer);
  }, [processInputBuffer]);

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 bg-gray-100 p-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
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
                      ? 'bg-red-500 text-white hover:bg-red-600 w-16 flex items-center justify-center'
                      : key === 'SHIFT'
                      ? `bg-gray-500 text-white hover:bg-gray-600 w-16 flex items-center justify-center ${isShiftPressed ? 'bg-gray-700' : ''}`
                      : key === 'SPACE'
                      ? 'bg-gray-500 text-white hover:bg-gray-600 w-40 flex items-center justify-center'
                      : key === 'FONT' || key === 'KEYBOARD' || key === 'ENTER'
                      ? 'bg-gray-500 text-white hover:bg-gray-600 w-14 flex items-center justify-center'
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
                    } else if (key === 'KEYBOARD') {
                      handleKeyboardToggle();
                    } else if (key === 'ENTER') {
                      onKeyPress('\n');
                    } else {
                      handleKeyPress(getShiftedKey(key));
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
                  ) : key === 'KEYBOARD' ? (
                    <Keyboard size={20} />
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
    </>
  );
} 