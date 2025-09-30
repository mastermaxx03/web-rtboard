import { useLayoutEffect, useState } from 'react';
import { DEFAULT_DIMS } from '../utils/constants';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const getVVH = () => (typeof window !== 'undefined' ? (window.visualViewport?.height ?? window.innerHeight) : 720);

export function useResponsiveDims() {
  const [dims, setDims] = useState(DEFAULT_DIMS);

  const recalc = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = getVVH();
    const totalH = clamp(vh - 120, 560, 860);

    setDims((d) => ({
      ...d,
      width: vw,
      height: totalH,
      font: vw < 900 ? 11 : 12,
      nameFont: vw < 900 ? 12 : 13,
      symbol: vw < 900 ? 4 : 6,
      topGridTop: 56,
      topGridHeight: clamp(totalH - (56 + 16 + 170 + 28), 330, 520),
      bottomGridHeight: 170,
      bottomGridBottom: 28
    }));
  };

  useLayoutEffect(() => {
    const on = () => requestAnimationFrame(recalc);
    recalc();
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    window.visualViewport?.addEventListener('resize', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
      window.visualViewport?.removeEventListener('resize', on);
    };
  }, []);

  return dims;
}
