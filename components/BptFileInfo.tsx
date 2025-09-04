'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, HardDrive, Package, CheckCircle, XCircle } from 'lucide-react';
import { BptFileInfo, compressionKindToHuman } from '@/lib/bpt';

interface BptFileInfoProps {
  fileInfo: BptFileInfo;
}

export function BptFileInfoComponent({ fileInfo }: BptFileInfoProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionColor = (compression: string): string => {
    switch (compression) {
      case 'gzip': return 'bg-blue-100 text-blue-800';
      case 'zlib': return 'bg-green-100 text-green-800';
      case 'deflate': return 'bg-yellow-100 text-yellow-800';
      case 'plain': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Информация о файле
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              Имя файла
            </div>
            <p className="font-medium">{fileInfo.name}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="w-4 h-4" />
              Размер
            </div>
            <p className="font-medium">{formatFileSize(fileInfo.size)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              Тип сжатия
            </div>
            <Badge className={getCompressionColor(fileInfo.compression)}>
              {compressionKindToHuman(fileInfo.compression)}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              PHP Serialized
            </div>
            <div className="flex items-center gap-2">
              {fileInfo.isValidSerialized ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">Валидный</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-600 font-medium">Невалидный</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Длина распакованного контента</p>
            <p className="font-medium">{fileInfo.content.length.toLocaleString()} символов</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
