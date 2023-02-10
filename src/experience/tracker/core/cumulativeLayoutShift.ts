/**
 * @description CLS (Cumulative Layout Shift) 累计布局位移
 */

import { SpotType } from '../../../define';
import { ExperienceType, CumulativeLayoutShiftSpot } from '../../define';

import { findSelector } from '../../../utils/findSelector';

interface CumulativeLayoutShift extends PerformanceEntry {
  hadRecentInput: boolean;
  sources: Array<{ node: Element | null }>;
  value: number;
}

function injectCLSTracker() {
  let cls = 0;
  const observer = new PerformanceObserver((entries, observer) => {
    const cumulativeLayoutShift = entries.getEntries()[0] as CumulativeLayoutShift;
    if (!cumulativeLayoutShift.hadRecentInput) {
      cls += cumulativeLayoutShift.value;

      const sources = cumulativeLayoutShift.sources
        .filter(source => source.node)
        .map(source => source.node ? findSelector(source.node as HTMLElement) : '');
      const spot: CumulativeLayoutShiftSpot = {
        type: SpotType.EXPERIENCE,
        subType: ExperienceType.CUMULATIVE_LAYOUT_SHIFT,
        value: `${cls}`,
        sources: sources
      }

      console.log('cls spot', spot)
    }
  });

  observer.observe({ type: 'layout-shift', buffered: true });
}

export {
  injectCLSTracker
}