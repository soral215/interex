import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * 요소 외부 클릭을 감지하는 커스텀 훅
 * @param refs - 감지할 요소들의 ref 배열
 * @param handler - 외부 클릭 시 실행할 핸들러
 * @param isActive - 감지 활성화 여부
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: () => void,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      );

      if (isOutside) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, handler, isActive]);
}

