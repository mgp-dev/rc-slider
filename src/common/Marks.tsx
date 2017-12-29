import React from 'react';
import {CSSProperties} from 'react';
import classNames from 'classnames';
import {MarkOpt} from "./types";

export interface MarksProps {
  className?: string
  vertical?: boolean
  marks: MarkOpt
  included?: boolean
  upperBound: number
  lowerBound: number
  max: number
  min: number
}

const Marks = ({className, vertical, marks, included, upperBound, lowerBound, max, min}: MarksProps) => {
  const marksKeys = Object.keys(marks);
  const marksCount = marksKeys.length;
  const unit = marksCount > 1 ? 100 / (marksCount - 1) : 100;
  const markWidth = unit * 0.9;

  const range = max - min;
  const elements = marksKeys.map(parseFloat).sort((a, b) => a - b).map(point => {
    const isActive = (!included && point === upperBound) ||
      (included && point <= upperBound && point >= lowerBound);
    const markClassName = classNames({
      [`${className}-text`]: true,
      [`${className}-text-active`]: isActive,
    });

    const bottomStyle = {
      marginBottom: '-50%',
      bottom: `${(point - min) / range * 100}%`,
    };

    const leftStyle = {
      width: `${markWidth}%`,
      marginLeft: `${-markWidth / 2}%`,
      left: `${(point - min) / range * 100}%`,
    };

    const style = vertical ? bottomStyle : leftStyle;

    const markPoint = marks[point];

    let markLabel: string, markStyle: CSSProperties;
    if (checkMarkPointIsObject(markPoint)) {
      markLabel = markPoint.label;
      markStyle = {...style, ...markPoint.style};
    } else {
      markLabel = markPoint;
      markStyle = style;
    }
    return (
      <span className={markClassName}
            style={markStyle}
            key={point}>
        {markLabel}
      </span>
    );
  });

  return <div className={className}>{elements}</div>;
};

function checkMarkPointIsObject(markPoint: string | { style: CSSProperties; label: string }): markPoint is { style: CSSProperties; label: string } {
  return typeof markPoint === 'object' && !React.isValidElement(markPoint);
}

export default Marks;
