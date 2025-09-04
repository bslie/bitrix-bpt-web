declare module 'serialize-php' {
  export function serialize(data: any): string;
  export function unserialize(data: string): any;
}
