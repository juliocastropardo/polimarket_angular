declare module 'zstd-codec' {
    export function run(callback: (zstd: any) => void): void;
  
    export class Simple {
      decompress(data: Uint8Array): Uint8Array;
    }
  }