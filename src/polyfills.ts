import 'zone.js'; 

(window as any).global = window;

import * as buffer from 'buffer';
(window as any).Buffer = buffer.Buffer;
(window as any).process = {
  env: { DEBUG: undefined },
  version: '',
  browser: true,
};