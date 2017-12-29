import * as React from 'react';
import {CSSProperties} from 'react';
import {Manager, Popper, Target} from 'react-popper';

export interface HandleProps {
  className?: string,
  vertical?: boolean,
  offset: number,
  style: CSSProperties,
  disabled: boolean,
  min: number,
  max: number,
  value: number,
  dragging: boolean;
  tipFormatter: (value: number, index: number) => React.ReactType
  index: number
}

interface HandleState {
  tooltipVisible: boolean
}

export default class Handle extends React.Component<HandleProps, HandleState> {

  state: HandleState = {
    tooltipVisible: false
  };

  displayTooltip = () => {
    this.setState({tooltipVisible: true})
  };

  hideTooltip = () => {
    this.setState({tooltipVisible: false})
  };

  componentWillReceiveProps(nextProps: Readonly<HandleProps>) {
    this.setState({tooltipVisible: nextProps.dragging})
  }

  render() {
    // noinspection JSUnusedLocalSymbols
    const {
      className, vertical, offset, style, disabled, min, max, value, dragging, index, tipFormatter, ...restProps
    } = this.props;

    const positionStyle = vertical ? {bottom: `${offset}%`} : {left: `${offset}%`};
    const elStyle = {
      ...style,
      ...positionStyle,
    };
    let ariaProps = {};
    if (value !== undefined) {
      ariaProps = {
        ...ariaProps,
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuenow': value,
        'aria-disabled': disabled,
      };
    }

    if (!this.state.tooltipVisible) {
      return (
        <div
          role="slider"
          tabIndex={0}
          {...ariaProps}
          {...restProps}
          className={className}
          style={elStyle}
          onMouseEnter={this.displayTooltip}
          onMouseLeave={this.hideTooltip}
        />
      );
    }

    return (
      <Manager>
        <Target>
          {
            ({targetProps}) => (
              <div
                role="slider"
                tabIndex={0}
                {...ariaProps}
                {...restProps}
                className={className}
                style={elStyle}
                {...targetProps as any}
                onMouseEnter={() => this.displayTooltip()}
                onMouseLeave={() => this.hideTooltip()}
              />
            )
          }
        </Target>
        <Popper placement="top">
          {
            ({popperProps}) => (
              <div className="rc-slider-tooltip rc-slider-tooltip-placement-top" {...popperProps as any}>
                <div className="rc-slider-tooltip-content">
                  <div className="rc-slider-tooltip-arrow"/>
                  <div className="rc-slider-tooltip-inner">
                    {tipFormatter(value, index)}
                  </div>
                </div>
              </div>
            )
          }
        </Popper>
      </Manager>
    );
  }
}
