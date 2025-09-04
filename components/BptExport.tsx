'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, Package } from 'lucide-react';
import { CompressionKind, buildBytes, compressionKindToHuman } from '@/lib/bpt';

interface BptExportProps {
  content: string;
  originalCompression: CompressionKind;
  originalFilename: string;
}

export function BptExport({ content, originalCompression, originalFilename }: BptExportProps) {
  const [selectedCompression, setSelectedCompression] = useState<CompressionKind>(originalCompression);
  const [filename, setFilename] = useState(originalFilename);
  const [isExporting, setIsExporting] = useState(false);

  const compressionOptions = [
    { value: CompressionKind.GZip, label: 'GZip (рекомендуется)', description: 'Лучшее сжатие' },
    { value: CompressionKind.ZLib, label: 'ZLib', description: 'Быстрое сжатие' },
    { value: CompressionKind.Deflate, label: 'Deflate', description: 'Raw deflate' },
    { value: CompressionKind.Plain, label: 'Без сжатия', description: 'Plain UTF-8' }
  ];

  const handleExport = async () => {
    if (!content.trim()) {
      alert('Нет содержимого для экспорта');
      return;
    }

    setIsExporting(true);
    try {
      const bytes = buildBytes(content, selectedCompression);
      
      // Создание blob и скачивание (конвертируем в ArrayBuffer)
      const arrayBuffer = new Uint8Array(bytes).buffer;
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert(`Ошибка при экспорте: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getCompressionDescription = (kind: CompressionKind): string => {
    switch (kind) {
      case CompressionKind.GZip: return 'Максимальное сжатие, универсальный формат';
      case CompressionKind.ZLib: return 'Быстрое сжатие, часто используется в Битрикс';
      case CompressionKind.Deflate: return 'Низкоуровневое сжатие без заголовков';
      case CompressionKind.Plain: return 'Без сжатия, читаемый текстовый формат';
      default: return 'Неизвестный формат';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Экспорт файла
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Имя файла</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="example.bpt"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="compression">Тип сжатия</Label>
            <Select
              value={selectedCompression}
              onValueChange={(value) => setSelectedCompression(value as CompressionKind)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип сжатия" />
              </SelectTrigger>
              <SelectContent>
                {compressionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Выбранный формат:</p>
          <p className="text-sm text-muted-foreground mb-1">
            {compressionKindToHuman(selectedCompression)}
          </p>
          <p className="text-xs text-muted-foreground">
            {getCompressionDescription(selectedCompression)}
          </p>
          {selectedCompression === originalCompression && (
            <div className="mt-2 text-xs text-green-600 font-medium">
              ✓ Совпадает с исходным форматом
            </div>
          )}
        </div>

        <Button 
          onClick={handleExport}
          disabled={isExporting || !filename.trim()}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Экспорт...' : 'Скачать файл'}
        </Button>
      </CardContent>
    </Card>
  );
}
