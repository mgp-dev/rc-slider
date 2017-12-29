# rc-slider
---

Slider UI component for React.

This is a full rewrite of [rc-slider](https://github.com/react-component/slider) in typescript.

Lot of dependencies have been removed, the component has tooltips by default via react-popper.

The build uses rollup.

[![NPM version][npm-image]][npm-url]

[npm-image]: http://img.shields.io/npm/v/@mgp/rc-slider.svg?style=flat-square
[npm-url]: http://npmjs.org/package/@mgp/rc-slider

## Screenshots

<img src="https://t.alipayobjects.com/images/T1ki8fXeprXXXXXXXX.png" width="550"/>

<img src="https://t.alipayobjects.com/images/T1pPhfXhBqXXXXXXXX.png" width="550"/>

<img src="https://t.alipayobjects.com/images/T1wO8fXd4rXXXXXXXX.png" width="550"/>

<img src="http://i.giphy.com/l46Cs36c9HrHMExoc.gif"/>


## Install

```bash
yarn add @mgp/rc-slider
```

[![rc-slider](https://nodei.co/npm/@mgp/rc-slider.png)](https://npmjs.org/package/@mgp/rc-slider)

## Usage

````js
import React from 'react';
import ReactDOM from 'react-dom';
import { Slider, Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

ReactDOM.render(
  <div>
    <Slider />
    <Range />
  </div>,
  container
);
`````

## License

`rc-slider` is released under the MIT license.
