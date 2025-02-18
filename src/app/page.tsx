'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { FontToggle } from '@/components/FontToggle';
import { useFont } from '@/contexts/FontContext';
import html2canvas from 'html2canvas';

export default function InputPage() {
  const { useCustomFont, text, setText } = useFont();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textAreaContainerRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  // handleKeyPress를 useCallback으로 최적화하고 키 입력 큐 추가
  const keyQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

  const [inputMode, setInputMode] = useState<"none" | "text">("none");

  // 커서 위치를 복원하는 useEffect 추가
  useEffect(() => {
    if (inputRef.current && cursorPositionRef.current !== null) {
      inputRef.current.setSelectionRange(
        cursorPositionRef.current,
        cursorPositionRef.current
      );
    }
  }, [text]); // text가 변경될 때마다 커서 위치 복원

  const processKeyQueue = useCallback(async () => {
    if (isProcessingRef.current || keyQueueRef.current.length === 0) return;

    isProcessingRef.current = true;
    
    while (keyQueueRef.current.length > 0) {
      const value = keyQueueRef.current.shift();
      if (!value || !inputRef.current) continue;

      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      const newValue = text.slice(0, start) + value + text.slice(end);
      const newPosition = start + value.length;
      
      setText(newValue);
      cursorPositionRef.current = newPosition;

      // focus와 커서 위치 즉시 설정
      inputRef.current.focus();
      inputRef.current.setSelectionRange(newPosition, newPosition);

      // 작은 지연을 추가하여 DOM 업데이트를 보장
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    isProcessingRef.current = false;
  }, [text, setText]);

  // useEffect 수정 - 커서 위치 복원 로직 개선
  useEffect(() => {
    if (inputRef.current && cursorPositionRef.current !== null) {
      const position = cursorPositionRef.current;
      // setTimeout을 사용하여 리렌더링 후 커서 위치 설정
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(position, position);
        }
      }, 0);
    }
  }, [text]);

  const handleKeyPress = useCallback((value: string) => {
    keyQueueRef.current.push(value);
    processKeyQueue();
  }, [processKeyQueue]);

  // 컴포넌트가 언마운트될 때 큐 초기화
  useEffect(() => {
    return () => {
      keyQueueRef.current = [];
      isProcessingRef.current = false;
    };
  }, []);

  const handleDelete = () => {
    if (!inputRef.current) return;

    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;

    if (start === end && start > 0) {
      const newValue = text.slice(0, start - 1) + text.slice(start);
      const newPosition = start - 1;
      
      setText(newValue);
      cursorPositionRef.current = newPosition;

      inputRef.current.focus();
      inputRef.current.setSelectionRange(newPosition, newPosition);
    } else if (start !== end) {
      const newValue = text.slice(0, start) + text.slice(end);
      
      setText(newValue);
      cursorPositionRef.current = start;

      inputRef.current.focus();
      inputRef.current.setSelectionRange(start, start);
    }
  };

  // 텍스트 영역의 선택/커서 위치 변경 이벤트 처리
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    cursorPositionRef.current = e.currentTarget.selectionStart;
  };

  // 텍스트 변경 이벤트 처리
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    cursorPositionRef.current = e.target.selectionStart;
    adjustTextareaHeight();
  };

  // 입력 이벤트 처리
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setText(e.currentTarget.value);
    cursorPositionRef.current = e.currentTarget.selectionStart;
  };

  // textarea 높이 자동 조절을 위한 함수
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      // 먼저 높이를 auto로 설정하여 스크롤 높이를 정확히 계산
      inputRef.current.style.height = 'auto';
      // 스크롤 높이로 실제 높이 설정 (최소 3줄)
      const minHeight = 24 * 3; // line-height: 1.5 * font-size: 16px * 3rows
      const scrollHeight = Math.max(inputRef.current.scrollHeight, minHeight);
      inputRef.current.style.height = `${scrollHeight}px`;
    }
  };

  // 컴포넌트 마운트 시와 text 변경 시 높이 조절
  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  const handleCapture = async () => {
    if (textAreaContainerRef.current) {
      try {
        // 캡처 전에 opacity만 변경
        textAreaContainerRef.current.style.opacity = '1';
        
        const canvas = await html2canvas(textAreaContainerRef.current, {
          backgroundColor: 'white',
          scale: 2,
        });
        
        // 캡처 후 opacity 복원
        textAreaContainerRef.current.style.opacity = '0';
        
        const image = canvas.toDataURL('image/png');
        const blob = await (await fetch(image)).blob();
        
        // Web Share API를 통한 공유 시도
        if (navigator.share) {
          try {
            await navigator.share({
              files: [
                new File([blob], 'captured-text.png', { type: 'image/png' })
              ]
            });
          } catch (error) {
            console.log('공유가 취소되었거나 에러가 발생했습니다:', error);
          }
        } else {
          console.log('이 브라우저는 공유 기능을 지원하지 않습니다.');
        }
      } catch (error) {
        console.error('캡처 중 오류 발생:', error);
      }
    }
  };

  const handleClearAll = () => {
    setText('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FontToggle />
      <div className="pt-16">
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <div className="w-full max-w-md space-y-4">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={text}
                onChange={handleChange}
                onInput={handleInput}
                onSelect={handleSelect}
                spellCheck={false}
                rows={3}
                inputMode={inputMode}
                className={`w-full px-4 py-3 text-lg border rounded-lg shadow-sm focus:outline-none text-gray-800 min-h-[96px] transition-height duration-200 ${
                  useCustomFont ? 'font-custom' : 'font-sans'
                }`}
                style={{
                  resize: 'none',
                  overflow: 'hidden',
                  lineHeight: '1.5'
                }}
                placeholder={useCustomFont ? 'ㅌㅔㄱㅅㅡㅌㅡㄹㅡㄹ ㅇㅣㅂㄹㅕㄱㅎㅏㅅㅔㅇㅛ' : '텍스트를 입력하세요'}
              />
              <div 
                ref={textAreaContainerRef}
                className={`absolute inset-0 opacity-0 pointer-events-none whitespace-pre-wrap break-words ${
                  useCustomFont ? 'font-custom' : 'font-sans'
                }`}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '1.125rem',
                  lineHeight: '1.5',
                  backgroundColor: 'white',
                  borderRadius: '0',
                  border: 'none',
                  color: 'rgb(0, 0, 0)',
                  fontWeight: '400',
                  WebkitFontSmoothing: 'none',
                  MozOsxFontSmoothing: 'none',
                  textRendering: 'geometricPrecision'
                }}
              >
                {text || (useCustomFont ? 'ㅌㅔㄱㅅㅡㅌㅡㄹㅡㄹ ㅇㅣㅂㄹㅕㄱㅎㅏㅅㅔㅇㅛ' : '텍스트를 입력하세요')}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className={`flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium ${
                  useCustomFont ? 'font-custom' : 'font-sans'
                }`}
              >
                {useCustomFont ? 'ㅁㅗㄷㅜ ㅈㅣㅇㅜㄱㅣ' : '모두 지우기'}
              </button>
              <button
                onClick={handleCapture}
                className={`flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium ${
                  useCustomFont ? 'font-custom' : 'font-sans'
                }`}
              >
                {useCustomFont ? 'ㅋㅐㅂㅊㅓ' : '캡처'}
              </button>
            </div>
          </div>
        </div>
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          useCustomFont={useCustomFont}
          textareaRef={inputRef}
          onInputModeChange={setInputMode}
        />
      </div>
    </div>
  );
} 