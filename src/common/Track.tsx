import * as React from 'react';
import {CSSProperties} from "react";

interface TrackProps {
  className: string
  included: boolean
  vertical: boolean
  offset: number
  length: number
  style: CSSProperties
}

const Track = (props: TrackProps) => {
  const { className, included, vertical, offset, length, style } = props;

  const positionStyle = vertical ? {
    bottom: `${offset}%`,
    height: `${length}%`,
  } : {
    left: `${offset}%`,
    width: `${length}%`,
  };

  const elStyle = {
    visibility: included ? 'visible' : 'hidden',
    ...style,
    ...positionStyle,
  };
  return <div className={className} style={elStyle} />;
};

export default Track;
