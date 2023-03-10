/**
 * @author Ruimve 
 * @description 监听 Promise 未处理事件
 */

import { SpotType, SpotOption } from '../../../define';
import { StabilityType, PromiseRejectionSpot } from '../define';

import { findSelector } from '../../../utils/findSelector';
import { lastEvent } from '../../../utils/findLastEvent';
import { resolveStack, Stack } from '../../../utils/resolveStack';

function formatPromise(event: PromiseRejectionEvent) {

  const lEvent = lastEvent.findLastEvent();
  const reason = event.reason;

  let message: string = '';
  let filename: string = '';
  let position: string = '';
  let stack: Stack[] = [];

  /** 代码报错抛出错误 */
  if (typeof reason === 'object' && reason.message && reason.stack) {
    message = reason.message;
    stack = resolveStack(reason.stack);
    filename = stack?.[0]?.filename || '';
    position = `${stack?.[0]?.lineno}:${stack?.[0]?.colno}`;
  } else { /** 手动使用 reject 抛出错误 */
    message = reason;
  }

  const spot: PromiseRejectionSpot = {
    type: SpotType.STABILITY,
    subType: StabilityType.PROMISE_REJECTION,
    message,
    filename,
    position,
    stack,
    selector: lEvent ? findSelector(lEvent?.target as HTMLElement) : ''
  }

  return spot;
}

function injectPromiseTracker(props: Pick<SpotOption, 'index' | 'send'>) {
  const { index, send } = props;
  const idx = index.find(idx => idx.type === StabilityType.PROMISE_REJECTION);
  if(!idx) return;

  window.addEventListener('unhandledrejection', event => {
    const spot = formatPromise(event);
    send(spot, idx);
  }, true);

}

export {
  injectPromiseTracker
}