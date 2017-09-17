import Slider from './Slider';
import Range from './Range';
import Handle from './Handle';
import Tooltip from './tooltip';
import createSliderWithTooltip from './createSliderWithTooltip';

Slider.Range = Range;
Slider.Handle = Handle;
Slider.createSliderWithTooltip = createSliderWithTooltip;
Slider.Tooltip = createSliderWithTooltip;
// export default Slider;
export { Slider, Range, Handle, createSliderWithTooltip, Tooltip };
