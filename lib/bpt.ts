import * as pako from 'pako';
import { unserialize } from 'serialize-php';

// Типы сжатия для .bpt файлов
export enum CompressionKind {
  Plain = 'plain',
  GZip = 'gzip',
  ZLib = 'zlib',
  Deflate = 'deflate',
  Unknown = 'unknown'
}

// Информация о файле
export interface BptFileInfo {
  name: string;
  size: number;
  compression: CompressionKind;
  isValidSerialized: boolean;
  content: string;
  originalBytes: Uint8Array;
}

// Обнаружение типа сжатия по заголовку
export function detectCompressionByHeader(data: Uint8Array): CompressionKind {
  if (data.length > 2 && data[0] === 0x1F && data[1] === 0x8B) {
    return CompressionKind.GZip; // gzip signature
  }
  if (data.length > 2 && data[0] === 0x78) {
    return CompressionKind.ZLib; // zlib (0x78 0x01/9C/DA)
  }
  return CompressionKind.Unknown;
}

// Автоматическая распаковка
export function tryInflateAuto(data: Uint8Array): { content: string; detected: CompressionKind } {
  const headerKind = detectCompressionByHeader(data);
  
  // Пробуем по заголовку
  try {
    switch (headerKind) {
      case CompressionKind.GZip:
        return { content: inflateGzip(data), detected: CompressionKind.GZip };
      case CompressionKind.ZLib:
        return { content: inflateZlib(data), detected: CompressionKind.ZLib };
    }
  } catch {
    // fallthrough
  }

  // Пробуем deflate
  try {
    const content = inflateDeflate(data);
    return { content, detected: CompressionKind.Deflate };
  } catch {
    // fallthrough
  }

  // Пробуем как обычный текст
  try {
    const content = new TextDecoder('utf-8').decode(data);
    return { content, detected: CompressionKind.Plain };
  } catch {
    // fallthrough
  }

  throw new Error('Не удалось распаковать содержимое файла ни одним из методов');
}

// Методы распаковки
function inflateGzip(data: Uint8Array): string {
  const inflated = pako.ungzip(data);
  return new TextDecoder('utf-8').decode(inflated);
}

function inflateZlib(data: Uint8Array): string {
  const inflated = pako.inflate(data);
  return new TextDecoder('utf-8').decode(inflated);
}

function inflateDeflate(data: Uint8Array): string {
  const inflated = pako.inflateRaw(data);
  return new TextDecoder('utf-8').decode(inflated);
}

// Методы упаковки
export function buildBytes(content: string, kind: CompressionKind): Uint8Array {
  const textBytes = new TextEncoder().encode(content);

  switch (kind) {
    case CompressionKind.Plain:
      return textBytes;
    case CompressionKind.GZip:
      return pako.gzip(textBytes);
    case CompressionKind.ZLib:
      return pako.deflate(textBytes);
    case CompressionKind.Deflate:
      return pako.deflateRaw(textBytes);
    default:
      throw new Error(`Неподдерживаемый тип сжатия: ${kind}`);
  }
}

// Проверка на PHP serialized данные
export function looksLikePhpSerialized(content: string): boolean {
  if (!content) return false;
  
  const head = content.length > 200 ? content.substring(0, 200) : content;
  
  // Проверка типичных начальных символов PHP serialization
  if (head.startsWith('a:') || head.startsWith('s:') || head.startsWith('i:') ||
      head.startsWith('b:') || head.startsWith('N;') || head.startsWith('O:') ||
      head.startsWith('d:')) {
    return true;
  }

  // Регулярное выражение для более сложных случаев
  const regex = /^(a|s|i|b|d|O):\d+[:;{]/;
  return regex.test(head);
}

// Парсинг .bpt файла
export async function parseBptFile(file: File): Promise<BptFileInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  
  const { content, detected } = tryInflateAuto(data);
  const isValidSerialized = looksLikePhpSerialized(content);

  return {
    name: file.name,
    size: file.size,
    compression: detected,
    isValidSerialized,
    content,
    originalBytes: data
  };
}

// Попытка десериализации PHP данных для pretty вывода
export function tryDeserializePhp(content: string): Record<string, unknown> | null {
  try {
    return unserialize(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Форматирование для человекочитаемого вида
export function formatPretty(data: unknown, level: number = 0): string {
  const pad = '  '.repeat(level);
  
  if (data === null) return `${pad}null`;
  if (typeof data === 'boolean') return `${pad}${data}`;
  if (typeof data === 'number') return `${pad}${data}`;
  if (typeof data === 'string') return `${pad}"${data}"`;
  
  if (Array.isArray(data)) {
    if (data.length === 0) return `${pad}[]`;
    let result = `${pad}[\n`;
    for (let i = 0; i < data.length; i++) {
      result += `${pad}  [${i}]:\n${formatPretty(data[i], level + 2)}\n`;
    }
    result += `${pad}]`;
    return result;
  }
  
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) return `${pad}{}`;
    let result = `${pad}{\n`;
    for (const key of keys) {
      result += `${pad}  ${key}:\n${formatPretty(obj[key], level + 2)}\n`;
    }
    result += `${pad}}`;
    return result;
  }
  
  return `${pad}${String(data)}`;
}

// Утилита для человекочитаемого названия типа сжатия
export function compressionKindToHuman(kind: CompressionKind): string {
  switch (kind) {
    case CompressionKind.GZip: return 'GZip (1F 8B)';
    case CompressionKind.ZLib: return 'ZLib (78 ??)';
    case CompressionKind.Deflate: return 'Raw Deflate';
    case CompressionKind.Plain: return 'Нет сжатия (plain UTF-8)';
    default: return 'Неизвестно';
  }
}
