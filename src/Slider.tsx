import * as React from 'react';
import {ClassAttributes, CSSProperties, ReactNode} from 'react';
import {MarkOpt} from './common/types';
import {noop} from './utils';
import Handle, {HandleProps} from "./Handle";
import {ObjectDiff} from "./util/typeUtils";
import {Range, RequiredRangeProps} from "./Range";

export interface SliderProps {
  defaultValue?: number,
  value?: number,
  style?: CSSProperties,

  prefixCls: string
  className: string,
  min: number
  max: number
  step: number,
  marks: MarkOpt,
  handle: (props: HandleProps & { index?: number } & ClassAttributes<any>) => void,
  onBeforeChange: (prevValue: number) => void,
  onChange: (value: number) => void,
  onAfterChange: (value: number) => void,
  included: boolean
  disabled: boolean,
  dots: boolean,
  vertical: boolean,

  tipFormatter: (value: number, index: number) => React.ReactType

  trackStyle: CSSProperties,
  handleStyle: CSSProperties
  railStyle: CSSProperties,
  dotStyle: CSSProperties,
  activeDotStyle: CSSProperties,
}

interface DefaultSliderProps {
  prefixCls: string
  className: string,
  min: number
  max: number
  step: number,
  marks: MarkOpt,
  handle: (props: HandleProps & { index?: number } & ClassAttributes<any>) => void,
  onBeforeChange: (prevValue: number) => void,
  onChange: (value: number) => void,
  onAfterChange: (value: number) => void,
  included: boolean
  disabled: boolean,
  dots: boolean,
  vertical: boolean

  tipFormatter: (value: number, index: number) => React.ReactType

  trackStyle: CSSProperties,
  handleStyle: CSSProperties
  railStyle: CSSProperties,
  dotStyle: CSSProperties,
  activeDotStyle: CSSProperties,
}

type RequiredSliderProps = ObjectDiff<SliderProps, DefaultSliderProps>;

export class Slider extends React.Component<RequiredSliderProps> {
  static displayName = 'Slider';

  getProps(): SliderProps & Readonly<{ children?: ReactNode }> {
    return this.props as any;
  }

  static defaultProps: DefaultSliderProps = {
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
    trackStyle: {},
    handleStyle: {},
    railStyle: {},
    dotStyle: {},
    activeDotStyle: {},
    tipFormatter: (value: number) => `${value}`,
  };

  render() {
    // noinspection JSUnusedLocalSymbols
    const {onChange, value, children, defaultValue, onAfterChange, onBeforeChange, trackStyle, handleStyle, ...sliderProps} = this.getProps();

    const rangeProps: RequiredRangeProps = {
      ...sliderProps,
      count: 1,
      onAfterChange: (values) => onAfterChange(values[0]),
      onBeforeChange: (values) => onBeforeChange(values[0]),

      trackStyle: trackStyle && [trackStyle],
      handleStyle: handleStyle && [handleStyle],
      onChange: (values) => onChange(values[0])
    };
    if (value != null) {
      rangeProps.values = [value];
    }
    if (defaultValue != null) {
      rangeProps.defaultValues = [defaultValue];
    }

    return <Range
      {...rangeProps}
    />;
  }
}
