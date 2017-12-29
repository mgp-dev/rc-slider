import {CSSProperties} from 'react';

export interface MarkOpt {
  [key: number]: (string | { style: CSSProperties, label: string })
}
