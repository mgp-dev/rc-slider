import * as React from 'react';
import classNames from 'classnames';
import {CSSProperties} from "react";

const calcPoints = (vertical: boolean, marks: any, dots: any, step: number, min: number, max: number) => {
  if(!(dots ? step > 0 : true)) {
    console.warn(
      '`Slider[step]` should be a positive number in order to make Slider[dots] work.'
    );
  }
  const points = Object.keys(marks).map(parseFloat);
  if (dots) {
    for (let i = min; i <= max; i = i + step) {
      if (points.indexOf(i) >= 0) continue;
      points.push(i);
    }
  }
  return points;
};

interface StepsProps {
  prefixCls?: string
  vertical: boolean
  marks?: any
  dots?: any
  step: number
  included?: boolean
  lowerBound: number
  upperBound: number
  max: number
  min: number
  dotStyle?: CSSProperties
  activeDotStyle?: CSSProperties
}

const Steps = ({ prefixCls, vertical, marks, dots, step, included,
                lowerBound, upperBound, max, min, dotStyle, activeDotStyle }: StepsProps) => {
  const range = max - min;
  const elements = calcPoints(vertical, marks, dots, step, min, max).map((point) => {
    const offset = `${Math.abs(point - min) / range * 100}%`;

    const isActive = (!included && point === upperBound) ||
            (included && point <= upperBound && point >= lowerBound);
    let style = vertical ? { bottom: offset, ...dotStyle } : { left: offset, ...dotStyle };
    if (isActive) {
      style = { ...style, ...activeDotStyle };
    }

    const pointClassName = classNames({
      [`${prefixCls}-dot`]: true,
      [`${prefixCls}-dot-active`]: isActive,
    });

    return <span className={pointClassName} style={style} key={point} />;
  });

  return <div className={`${prefixCls}-step`}>{elements}</div>;
};

export default Steps;
