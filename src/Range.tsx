import * as React from 'react';
import {ClassAttributes, CSSProperties, ReactNode} from 'react';
import classNames from 'classnames';
import Track from './common/Track';
import {MarkOpt} from './common/types';
import * as utils from './utils';
import {noop} from './utils';
import {addEventListener} from "./util/addEventListener";
import Marks from "./common/Marks";
import Steps from "./common/Steps";
import Handle, {HandleProps} from "./Handle";
import {ObjectDiff} from "./util/typeUtils";
import { shallowEqual } from "shallow-equal-object";

export interface RangeProps {
  defaultValues?: number[],
  values?: number[],
  style?: CSSProperties,

  count: number,
  allowCross: boolean,
  pushable: boolean | number
  prefixCls: string,
  className: string,
  min: number,
  max: number,
  step: number,
  marks: MarkOpt,
  handle: (props: HandleProps & { index: number } & ClassAttributes<any>) => void,
  onBeforeChange: (prevValue: number[]) => void,
  onChange: (values: number[]) => void,
  onAfterChange: (value: number[]) => void,
  included: boolean,
  disabled: boolean,
  dots: boolean,
  vertical: boolean,

  tipFormatter: (value: number, index: number) => React.ReactType

  trackStyle: CSSProperties[],
  handleStyle: CSSProperties[]
  railStyle: CSSProperties,
  dotStyle: CSSProperties,
  activeDotStyle: CSSProperties,
}

interface DefaultRangeProps {
  count: number,
  allowCross: boolean,
  pushable: boolean | number
  prefixCls: string,
  className: string,
  min: number,
  max: number,
  step: number,
  marks: MarkOpt,
  handle: (props: HandleProps & { index: number } & ClassAttributes<any>) => void,
  onBeforeChange: (prevValue: number[]) => void,
  onChange: (values: number[]) => void,
  onAfterChange: (value: number[]) => void,
  included: boolean,
  disabled: boolean,
  dots: boolean,
  vertical: boolean,

  tipFormatter: (value: number, index: number) => React.ReactType

  trackStyle: CSSProperties[],
  handleStyle: CSSProperties[]
  railStyle: CSSProperties,
  dotStyle: CSSProperties,
  activeDotStyle: CSSProperties,
}

interface RangeState {
  handle: any,
  recent: any,
  bounds: number[],
}

export type RequiredRangeProps = ObjectDiff<RangeProps, DefaultRangeProps>

export class Range extends React.Component<RequiredRangeProps, RangeState> {
  static displayName = 'Range';

  getProps(): RangeProps & Readonly<{ children?: ReactNode }> {
    return this.props as any;
  }

  static defaultProps: DefaultRangeProps = {
    count: 1,
    allowCross: true,
    pushable: false,
    prefixCls: 'rc-slider',
    className: '',
    min: 0,
    max: 100,
    step: 1,
    marks: {},
    handle(props) {
      return <Handle {...props} key={props.index}/>;
    },
    onBeforeChange: noop,
    onChange: noop,
    onAfterChange: noop,
    included: true,
    disabled: false,
    dots: false,
    vertical: false,
    trackStyle: [{}],
    handleStyle: [{}],
    railStyle: {},
    dotStyle: {},
    activeDotStyle: {},
    tipFormatter: (value: number) => `${value}`
  };

  private startValue: number;
  private startPosition: number;
  private _getPointsCache: { marks?: MarkOpt, steps?: any, points?: any, step?: number };
  private handlesRefs: any;
  private dragOffset: number;
  private onTouchMoveListener: { remove: () => void };
  private onTouchUpListener: { remove: () => void };
  private onMouseMoveListener: { remove: () => void };
  private onMouseUpListener: { remove: () => void };
  private sliderRef: Element;

  constructor(props: RangeProps) {
    super(props);

    const {count, min, max} = props;
    const initialValue = Array.apply(null, Array(count)).map(() => min);
    const defaultValues = 'defaultValues' in props ? props.defaultValues : initialValue;
    const value = props.values !== undefined ? props.values : defaultValues;
    const bounds = value.map((v: number) => this.trimAlignValue(v));
    const recent = bounds[0] === max ? 0 : bounds.length - 1;

    this.state = {
      handle: null,
      recent,
      bounds,
    };

    if (process.env.NODE_ENV !== 'production') {
      const {step, max, min} = props;
      if (!(step && Math.floor(step) === step ? (max - min) % step === 0 : true)) {
        console.warn(
          'Slider[max] - Slider[min] (%s) should be a multiple of Slider[step] (%s)',
          max - min,
          step
        );
      }
    }
    this.handlesRefs = {};
  }

  componentWillReceiveProps(nextProps: RangeProps) {
    if (nextProps.values == undefined || nextProps.min == undefined || nextProps.max == undefined) {
      return;
    }

    if (this.props.min === nextProps.min &&
      this.props.max === nextProps.max &&
      shallowEqual(this.props.values, nextProps.values)) {
      return;
    }
    const {bounds} = this.state;
    const value = nextProps.values || bounds;
    const nextBounds = value.map(v => this.trimAlignValue(v, nextProps));
    if (nextBounds.length === bounds.length && nextBounds.every((v, i) => v === bounds[i])) return;

    this.setState({bounds: nextBounds});
    if (bounds.some(v => utils.isValueOutOfRange(v, nextProps.min, nextProps.max))) {
      this.getProps().onChange(nextBounds);
    }
  }

  onChange<K extends keyof RangeState>(state: Pick<RangeState, K>) {
    const props = this.getProps();
    const isNotControlled = !('value' in props);
    if (isNotControlled) {
      this.setState(state);
    } else if (state.handle !== undefined) {
      this.setState({handle: state.handle});
    }

    const data = {...this.state, ...state as any};
    const changedValue = data.bounds;
    props.onChange(changedValue);
  }

  onStart(position: number) {
    const props = this.getProps();
    const state = this.state;
    const bounds = this.getValue();
    props.onBeforeChange(bounds);

    const value = this.calcValueByPos(position);
    this.startValue = value;
    this.startPosition = position;

    const closestBound = this.getClosestBound(value);
    const boundNeedMoving = this.getBoundNeedMoving(value, closestBound);

    this.setState({
      handle: boundNeedMoving,
      recent: boundNeedMoving,
    });

    const prevValue = bounds[boundNeedMoving];
    if (value === prevValue) return;

    const nextBounds = [...state.bounds];
    nextBounds[boundNeedMoving] = value;
    this.onChange({bounds: nextBounds});
  }

  onEnd = () => {
    this.setState({handle: null});
    this.removeDocumentEvents();
    this.getProps().onAfterChange(this.getValue());
  };

  onMove(e: Event, position: number) {
    utils.pauseEvent(e);
    const props = this.getProps();
    const state = this.state;

    const value = this.calcValueByPos(position);
    const oldValue = state.bounds[state.handle];
    if (value === oldValue) return;

    const nextBounds = [...state.bounds];
    nextBounds[state.handle] = value;
    let nextHandle = state.handle;
    if (props.pushable !== false) {
      const originalValue = state.bounds[nextHandle];
      this.pushSurroundingHandles(nextBounds, nextHandle, originalValue);
    } else if (props.allowCross) {
      nextBounds.sort((a, b) => a - b);
      nextHandle = nextBounds.indexOf(value);
    }
    this.onChange({
      handle: nextHandle,
      bounds: nextBounds,
    });
  }

  getValue() {
    return this.state.bounds;
  }

  getClosestBound(value: number) {
    const {bounds} = this.state;
    let closestBound = 0;
    for (let i = 1; i < bounds.length - 1; ++i) {
      if (value > bounds[i]) {
        closestBound = i;
      }
    }
    if (Math.abs(bounds[closestBound + 1] - value) < Math.abs(bounds[closestBound] - value)) {
      closestBound = closestBound + 1;
    }
    return closestBound;
  }

  getBoundNeedMoving(value: number, closestBound: number) {
    const {bounds, recent} = this.state;
    let boundNeedMoving = closestBound;
    const isAtTheSamePoint = (bounds[closestBound + 1] === bounds[closestBound]);
    if (isAtTheSamePoint) {
      boundNeedMoving = recent;
    }

    if (isAtTheSamePoint && (value !== bounds[closestBound + 1])) {
      boundNeedMoving = value < bounds[closestBound + 1] ? closestBound : closestBound + 1;
    }
    return boundNeedMoving;
  }

  getLowerBound() {
    return this.state.bounds[0];
  }

  getUpperBound() {
    const {bounds} = this.state;
    return bounds[bounds.length - 1];
  }

  /**
   * Returns an array of possible slider points, taking into account both
   * `marks` and `step`. The result is cached.
   */
  getPoints() {
    const {marks, step, min, max} = this.getProps();
    const cache = this._getPointsCache;
    if (!cache || cache.marks !== marks || cache.step !== step) {
      let points: number[] = [];
      if (step !== null) {
        for (let point = min; point <= max; point += step) {
          points[point] = point;
        }
      } else {
        points = Object.keys(marks).map(parseFloat);
      }
      points.sort((a, b) => a - b);
      this._getPointsCache = {marks, step, points};
    }
    return this._getPointsCache.points;
  }

  pushSurroundingHandles(bounds: any, handle: any, originalValue: number) {
    let {pushable: threshold} = this.getProps();
    if (typeof threshold === "boolean") {
      threshold = 0;
    }
    const value = bounds[handle];

    let direction = 0;
    if (bounds[handle + 1] - value < threshold) {
      direction = +1; // push to right
    }
    if (value - bounds[handle - 1] < threshold) {
      direction = -1; // push to left
    }

    if (direction === 0) {
      return;
    }

    const nextHandle = handle + direction;
    const diffToNext = direction * (bounds[nextHandle] - value);
    if (!this.pushHandle(bounds, nextHandle, direction, threshold - diffToNext)) {
      // revert to original value if pushing is impossible
      bounds[handle] = originalValue;
    }
  }

  pushHandle(bounds: any, handle: any, direction: number, amount: number) {
    const originalValue = bounds[handle];
    let currentValue = bounds[handle];
    while (direction * (currentValue - originalValue) < amount) {
      if (!this.pushHandleOnePoint(bounds, handle, direction)) {
        // can't push handle enough to create the needed `amount` gap, so we
        // revert its position to the original value
        bounds[handle] = originalValue;
        return false;
      }
      currentValue = bounds[handle];
    }
    // the handle was pushed enough to create the needed `amount` gap
    return true;
  }

  pushHandleOnePoint(bounds: any, handle: any, direction: number) {
    const points = this.getPoints();
    const pointIndex = points.indexOf(bounds[handle]);
    const nextPointIndex = pointIndex + direction;
    if (nextPointIndex >= points.length || nextPointIndex < 0) {
      // reached the minimum or maximum available point, can't push anymore
      return false;
    }
    const nextHandle = handle + direction;
    const nextValue = points[nextPointIndex];
    let {pushable: threshold} = this.getProps();
    if (typeof threshold === "boolean") {
      threshold = 0;
    }
    const diffToNext = direction * (bounds[nextHandle] - nextValue);
    if (!this.pushHandle(bounds, nextHandle, direction, threshold - diffToNext)) {
      // couldn't push next handle, so we won't push this one either
      return false;
    }
    // push the handle
    bounds[handle] = nextValue;
    return true;
  }

  trimAlignValue(v: number, nextProps = {}) {
    const mergedProps = {...this.getProps(), ...nextProps};
    const valInRange = utils.ensureValueInRange(v, mergedProps.min, mergedProps.max);
    const valNotConflict = this.ensureValueNotConflict(valInRange, {allowCross: mergedProps.allowCross});
    return utils.ensureValuePrecision(valNotConflict, mergedProps);
  }

  ensureValueNotConflict(val: number, {allowCross}: { allowCross: boolean }) {
    const state = this.state || {};
    const {handle, bounds} = state;
    if (!allowCross && handle != null) {
      if (handle > 0 && val <= bounds[handle - 1]) {
        return bounds[handle - 1];
      }
      if (handle < bounds.length - 1 && val >= bounds[handle + 1]) {
        return bounds[handle + 1];
      }
    }
    return val;
  }

  getComponents() {
    const {
      handle,
      bounds,
    } = this.state;
    const {
      prefixCls,
      vertical,
      included,
      disabled,
      min,
      max,
      handle: handleGenerator,
      trackStyle,
      handleStyle,
      tipFormatter,
      count
    } = this.getProps();

    const offsets = bounds.map(v => this.calcOffset(v));

    const handleClassName = `${prefixCls}-handle`;
    const handles = bounds.map((v, i) => handleGenerator({
      className: classNames({
        [handleClassName]: true,
        [`${handleClassName}-${i + 1}`]: true,
      }),
      vertical,
      offset: offsets[i],
      value: v,
      dragging: handle === i,
      index: i,
      min: min,
      max: max,
      disabled: disabled,
      style: handleStyle[i],
      ref: h => this.saveHandle(i, h),
      tipFormatter
    }));

    if (count == 1) {
      const _trackStyle = trackStyle[0] || trackStyle;
      const track = (
        <Track
          className={`${prefixCls}-track`}
          vertical={vertical}
          included={included}
          offset={0}
          length={offsets[0]}
          style={{
            ..._trackStyle,
          }}
        />
      );

      return {tracks: track, handles};
    }

    const tracks = bounds.slice(0, -1).map((_, index) => {
      const i = index + 1;
      const trackClassName = classNames({
        [`${prefixCls}-track`]: true,
        [`${prefixCls}-track-${i}`]: true,
      });
      return (
        <Track
          className={trackClassName}
          vertical={vertical}
          included={included}
          offset={offsets[i - 1]}
          length={offsets[i] - offsets[i - 1]}
          style={trackStyle[index]}
          key={i}
        />
      );
    });

    return {tracks, handles};
  }

  componentWillUnmount() {
    this.removeDocumentEvents();
  }

  onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) {
      return;
    }

    const isVertical = this.getProps().vertical;
    let position = utils.getMousePosition(isVertical, e);
    if (!utils.isEventFromHandle(e, this.handlesRefs)) {
      this.dragOffset = 0;
    } else {
      const handlePosition = utils.getHandleCenterPosition(isVertical, e.target as HTMLElement);
      this.dragOffset = position - handlePosition;
      position = handlePosition;
    }
    this.onStart(position);
    this.addDocumentMouseEvents();
    utils.pauseEvent(e);
  };

  onTouchStart = (e: TouchEvent) => {
    if (utils.isNotTouchEvent(e)) return;

    const isVertical = this.getProps().vertical;
    let position = utils.getTouchPosition(isVertical, e);
    if (!utils.isEventFromHandle(e, this.handlesRefs)) {
      this.dragOffset = 0;
    } else {
      const handlePosition = utils.getHandleCenterPosition(isVertical, e.target as HTMLElement);
      this.dragOffset = position - handlePosition;
      position = handlePosition;
    }
    this.onStart(position);
    this.addDocumentTouchEvents();
    utils.pauseEvent(e);
  };

  onFocus = (e: FocusEvent) => {
    const isVertical = this.getProps().vertical;

    if (utils.isEventFromHandle(e, this.handlesRefs)) {
      const handlePosition = utils.getHandleCenterPosition(isVertical, e.target as HTMLElement);

      this.dragOffset = 0;
      this.onStart(handlePosition);
      utils.pauseEvent(e);
    }
  };

  onBlur = () => {
    this.onEnd();
  };

  addDocumentTouchEvents() {
    // just work for Chrome iOS Safari and Android Browser
    this.onTouchMoveListener = addEventListener(document, 'touchmove', this.onTouchMove);
    this.onTouchUpListener = addEventListener(document, 'touchend', this.onEnd);
  }

  addDocumentMouseEvents() {
    this.onMouseMoveListener = addEventListener(document, 'mousemove', this.onMouseMove);
    this.onMouseUpListener = addEventListener(document, 'mouseup', this.onEnd);
  }

  removeDocumentEvents() {
    this.onTouchMoveListener && this.onTouchMoveListener.remove();
    this.onTouchUpListener && this.onTouchUpListener.remove();

    this.onMouseMoveListener && this.onMouseMoveListener.remove();
    this.onMouseUpListener && this.onMouseUpListener.remove();
  }

  onMouseMove = (e: MouseEvent) => {
    if (!this.sliderRef) {
      this.onEnd();
      return;
    }
    const position = utils.getMousePosition(this.getProps().vertical, e);
    this.onMove(e, position - this.dragOffset);
  };

  onTouchMove = (e: TouchEvent) => {
    if (utils.isNotTouchEvent(e) || !this.sliderRef) {
      this.onEnd();
      return;
    }

    const position = utils.getTouchPosition(this.getProps().vertical, e);
    this.onMove(e, position - this.dragOffset);
  };

  onKeyDown = (e: KeyboardEvent) => {
    if (this.sliderRef && utils.isEventFromHandle(e, this.handlesRefs)) {
      // TODO
    }
  };

  getSliderStart() {
    const slider = this.sliderRef;
    const rect = slider.getBoundingClientRect();

    return this.getProps().vertical ? rect.top : rect.left;
  }

  getSliderLength() {
    const slider = this.sliderRef;
    if (!slider) {
      return 0;
    }

    const coordinates = slider.getBoundingClientRect();
    return this.getProps().vertical ? coordinates.height : coordinates.width;
  }

  calcValue(offset: number) {
    const {vertical, min, max} = this.getProps();
    const ratio = Math.abs(Math.max(offset, 0) / this.getSliderLength());
    return vertical ? (1 - ratio) * (max - min) + min : ratio * (max - min) + min;
  }

  calcValueByPos(position: number) {
    const pixelOffset = position - this.getSliderStart();
    return this.trimAlignValue(this.calcValue(pixelOffset));
  }

  calcOffset(value: number) {
    const {min, max} = this.getProps();
    const ratio = (value - min) / (max - min);
    return ratio * 100;
  }

  saveSlider = (slider: HTMLDivElement) => {
    this.sliderRef = slider;
  };

  saveHandle(index: number, handle: any) {
    this.handlesRefs[index] = handle;
  }

  render() {
    const {
      prefixCls,
      className,
      marks,
      dots,
      step,
      included,
      disabled,
      vertical,
      min,
      max,
      children,
      style,
      railStyle,
      dotStyle,
      activeDotStyle,
    } = this.getProps();
    const {tracks, handles} = this.getComponents();

    const sliderClassName = classNames(prefixCls, {
      [`${prefixCls}-with-marks`]: Object.keys(marks).length > 0,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-vertical`]: vertical,
      [className]: className != undefined,
    });
    return (
      <div
        ref={this.saveSlider}
        className={sliderClassName}
        onTouchStart={disabled ? noop : this.onTouchStart as any}
        onMouseDown={disabled ? noop : this.onMouseDown as any}
        onKeyDown={disabled ? noop : this.onKeyDown as any}
        onFocus={disabled ? noop : this.onFocus as any}
        onBlur={disabled ? noop : this.onBlur as any}
        style={style}
      >
        <div
          className={`${prefixCls}-rail`}
          style={{
            ...railStyle,
          }}
        />
        {tracks}
        <Steps
          prefixCls={prefixCls}
          vertical={vertical}
          marks={marks}
          dots={dots}
          step={step}
          included={included}
          lowerBound={this.getLowerBound()}
          upperBound={this.getUpperBound()}
          max={max}
          min={min}
          dotStyle={dotStyle}
          activeDotStyle={activeDotStyle}
        />
        {handles}
        <Marks
          className={`${prefixCls}-mark`}
          vertical={vertical}
          marks={marks}
          included={included}
          lowerBound={this.getLowerBound()}
          upperBound={this.getUpperBound()}
          max={max}
          min={min}
        />
        {children}
      </div>
    );
  }
}
