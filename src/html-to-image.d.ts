declare module 'html-to-image' {
  interface Options {
    cacheBust?: boolean;
    [key: string]: unknown;
  }
  export function toSvg<T extends HTMLElement>(node: T, options?: Options): Promise<string>;
  export function toCanvas<T extends HTMLElement>(node: T, options?: Options): Promise<HTMLCanvasElement>;
  export function toPixelData<T extends HTMLElement>(node: T, options?: Options): Promise<Uint8ClampedArray>;
  export function toPng<T extends HTMLElement>(node: T, options?: Options): Promise<string>;
  export function toJpeg<T extends HTMLElement>(node: T, options?: Options): Promise<string>;
  export function toBlob<T extends HTMLElement>(node: T, options?: Options): Promise<Blob | null>;
  export function getFontEmbedCSS<T extends HTMLElement>(node: T, options?: Options): Promise<string>;
}
