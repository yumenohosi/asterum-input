const COMPOUND_CONSONANTS: { [key: string]: string } = {
  'ㄲ': 'ㄱㄱ',
  'ㄳ': 'ㄱㅅ',
  'ㄵ': 'ㄴㅈ',
  'ㄶ': 'ㄴㅎ',
  'ㄺ': 'ㄹㄱ',
  'ㄻ': 'ㄹㅁ',
  'ㄼ': 'ㄹㅂ',
  'ㄽ': 'ㄹㅅ',
  'ㄾ': 'ㄹㅌ',
  'ㄿ': 'ㄹㅍ',
  'ㅀ': 'ㄹㅎ',
  'ㅄ': 'ㅂㅅ',
  'ㅆ': 'ㅅㅅ',
  'ㄸ': 'ㄷㄷ',
  'ㅃ': 'ㅂㅂ',
  'ㅉ': 'ㅈㅈ'
};

const COMPOUND_VOWELS: { [key: string]: string } = {
  'ㅘ': 'ㅗㅏ',
  'ㅙ': 'ㅗㅐ',
  'ㅚ': 'ㅗㅣ',
  'ㅝ': 'ㅜㅓ',
  'ㅞ': 'ㅜㅔ',
  'ㅟ': 'ㅜㅣ',
  'ㅢ': 'ㅡㅣ'
};

export function decomposeHangul(text: string): string {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      
      // 한글 유니코드 범위 체크 (가 ~ 힣)
      if (code >= 0xAC00 && code <= 0xD7A3) {
        const offset = code - 0xAC00;
        
        // 초성, 중성, 종성 분리
        const first = Math.floor(offset / 28 / 21);
        const middle = Math.floor((offset / 28) % 21);
        const final = offset % 28;
        
        // 초성 목록
        const firstList = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        // 중성 목록
        const middleList = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
        // 종성 목록
        const finalList = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

        let result = '';
        
        // 초성 처리
        const firstChar = firstList[first];
        result += COMPOUND_CONSONANTS[firstChar] || firstChar;
        
        // 중성 처리
        const middleChar = middleList[middle];
        result += COMPOUND_VOWELS[middleChar] || middleChar;
        
        // 종성이 있는 경우 처리
        if (finalList[final]) {
          const finalChar = finalList[final];
          result += COMPOUND_CONSONANTS[finalChar] || finalChar;
        }

        return result;
      }
      // 단일 자음/모음인 경우 합성 자음/모음 분리 처리
      return COMPOUND_CONSONANTS[char] || COMPOUND_VOWELS[char] || char;
    })
    .join('');
} 