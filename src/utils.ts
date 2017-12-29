import {findDOMNode} from 'react-dom';
import {KeyCode} from "./util/keyCode";

export function isEventFromHandle(e: Event, handles: any) {
  return Object.keys(handles)
    .some(key => e.target === findDOMNode(handles[key]));
}

export function isValueOutOfRange(value: number, min: number, max: number) {
  return value < min || value > max;
}

export function isNotTouchEvent(e: TouchEvent) {
  return e.touches.length > 1 ||
    (e.type.toLowerCase() === 'touchend' && e.touches.length > 0);
}

export function getClosestPoint(val: number, {marks, step, min}: { marks: any, step: number, min: number }) {
  const points = Object.keys(marks).map(parseFloat);
  if (step !== null) {
    const closestStep = Math.round((val - min) / step) * step + min;
    points.push(closestStep);
  }
  const diffs = points.map(point => Math.abs(val - point));
  return points[diffs.indexOf(Math.min(...diffs))];
}

export function getPrecision(step: number) {
  const stepString = step.toString();
  let precision = 0;
  if (stepString.indexOf('.') >= 0) {
    precision = stepString.length - stepString.indexOf('.') - 1;
  }
  return precision;
}

export function getMousePosition(vertical: boolean | undefined, e: MouseEvent) {
  return vertical ? e.clientY : e.pageX;
}

export function getTouchPosition(vertical: boolean | undefined, e: TouchEvent) {
  return vertical ? e.touches[0].clientY : e.touches[0].pageX;
}

export function getHandleCenterPosition(vertical: boolean | undefined, handle: HTMLElement) {
  const coords = handle.getBoundingClientRect();
  return vertical ?
    coords.top + (coords.height * 0.5) :
    coords.left + (coords.width * 0.5);
}

export function ensureValueInRange(val: number, min: number, max: number) {
  if (val <= min) {
    return min;
  }
  if (val >= max) {
    return max;
  }
  return val;
}

export function ensureValuePrecision(val: number, props: { step: number, min: number, max: number, marks: any }) {
  const {step} = props;
  const closestPoint = getClosestPoint(val, props);
  return step === null ? closestPoint :
    parseFloat(closestPoint.toFixed(getPrecision(step)));
}

export function pauseEvent(e: Event) {
  e.stopPropagation();
  e.preventDefault();
}

export function getKeyboardValueMutator(e: KeyboardEvent): ((value: number, props: { step: number, max: number, min: number }) => number) | undefined {
  switch (e.keyCode) {
    case KeyCode.UP:
    case KeyCode.RIGHT:
      return (value, props) => value + props.step;

    case KeyCode.DOWN:
    case KeyCode.LEFT:
      return (value, props) => value - props.step;

    case KeyCode.END:
      return (value, props) => props.max;
    case KeyCode.HOME:
      return (value, props) => props.min;
    case KeyCode.PAGE_UP:
      return (value, props) => value + props.step * 2;
    case KeyCode.PAGE_DOWN:
      return (value, props) => value - props.step * 2;

    default:
      return undefined;
  }
}

export function noop() {
}
