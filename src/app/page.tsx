'use client';

import { useRef, useEffect } from 'react';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { FontToggle } from '@/components/FontToggle';
import { useFont } from '@/contexts/FontContext';
import html2canvas from 'html2canvas';

export default function InputPage() {
  const { useCustomFont, text, setText } = useFont();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textAreaContainerRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef(0);

  const handleKeyPress = (value: string) => {
    if (!inputRef.current) return;

    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const newValue = text.slice(0, start) + value + text.slice(end);
    
    const newPosition = start + value.length;
    
    setText(newValue);
    cursorPositionRef.current = newPosition;

    inputRef.current.focus();
    inputRef.current.setSelectionRange(newPosition, newPosition);
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    cursorPositionRef.current = e.target.selectionStart || 0;
    adjustTextareaHeight();
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    cursorPositionRef.current = e.currentTarget.selectionStart || 0;
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

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setText(e.currentTarget.value);
    cursorPositionRef.current = e.currentTarget.selectionStart || 0;
  };

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

        // Blob으로 변환
        const blob = await (await fetch(image)).blob();
        
        // Web Share API 지원 여부 확인
        if (navigator.share) {
          try {
            await navigator.share({
              files: [
                new File([blob], 'captured-text.png', { type: 'image/png' })
              ]
            });
          } catch (error) {
            console.log('공유 취소 또는 에러:', error);
            // 공유 실패시 다운로드로 폴백
            downloadImage(image);
          }
        } else {
          // Web Share API를 지원하지 않는 경우 다운로드
          downloadImage(image);
        }
      } catch (error) {
        console.error('캡처 중 오류 발생:', error);
      }
    }
  };

  // 다운로드 함수 분리
  const downloadImage = (imageData: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'captured-text.png';
    link.click();
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
                inputMode="none"
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
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0'
                }}
              >
                {text || (useCustomFont ? 'ㅌㅔㄱㅅㅡㅌㅡㄹㅡㄹ ㅇㅣㅂㄹㅕㄱㅎㅏㅅㅔㅇㅛ' : '텍스트를 입력하세요')}
              </div>
            </div>
            <div className="flex gap-2">
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
        />
      </div>
    </div>
  );
} 