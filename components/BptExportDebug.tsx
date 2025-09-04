'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bug, Download, Eye } from 'lucide-react';
import { BptFileInfo, buildBytes, looksLikePhpSerialized, tryDeserializePhp, convertJsonToPhp } from '@/lib/bpt';

interface BptExportDebugProps {
  content: string;
  originalFileInfo: BptFileInfo;
}

export function BptExportDebug({ content, originalFileInfo }: BptExportDebugProps) {
  const [debugInfo, setDebugInfo] = useState<string>('');

  const runDebugCheck = () => {
    const checks = [];
    
    // 1. Проверка корректности PHP serialized
    const isValidSerialized = looksLikePhpSerialized(content);
    checks.push(`✅ PHP Serialized валидность: ${isValidSerialized ? 'OK' : 'ОШИБКА'}`);
    
    if (!isValidSerialized) {
      checks.push(`❌ КРИТИЧЕСКАЯ ОШИБКА: Контент не является валидным PHP serialized!`);
      checks.push(`🔍 Начало контента: "${content.substring(0, 50)}"`);
      
      // Попробуем конвертировать из JSON
      const phpConverted = convertJsonToPhp(content);
      if (phpConverted) {
        checks.push(`🔄 Успешная конвертация из JSON в PHP serialized`);
        checks.push(`✅ Результат конвертации валиден: ${looksLikePhpSerialized(phpConverted)}`);
      } else {
        checks.push(`❌ Не удалось конвертировать из JSON в PHP serialized`);
      }
    }
    
    // 2. Проверка десериализации/сериализации
    const parsed = tryDeserializePhp(content);
    if (parsed) {
      checks.push(`✅ Десериализация PHP: OK`);
      checks.push(`📋 Найденные ключи: ${Object.keys(parsed).join(', ')}`);
      
      // Проверяем обратную сериализацию
      const reserialized = convertJsonToPhp(JSON.stringify(parsed));
      if (reserialized) {
        checks.push(`✅ Обратная сериализация: OK`);
        checks.push(`🔍 Совпадает с оригиналом: ${reserialized === content ? 'Да' : 'Нет'}`);
      } else {
        checks.push(`❌ Ошибка обратной сериализации`);
      }
    } else {
      checks.push(`❌ Ошибка десериализации PHP`);
    }
    
    // 3. Проверка длины
    checks.push(`📏 Длина оригинала: ${originalFileInfo.content.length} байт`);
    checks.push(`📏 Длина текущего: ${content.length} байт`);
    checks.push(`📏 Разница: ${content.length - originalFileInfo.content.length} байт`);
    
    // 4. Проверка сжатия
    try {
      const compressed = buildBytes(content, originalFileInfo.compression);
      checks.push(`📦 Сжатие ${originalFileInfo.compression}: OK (${compressed.length} байт)`);
    } catch (error) {
      checks.push(`❌ Сжатие ${originalFileInfo.compression}: ОШИБКА - ${error}`);
    }
    
    // 5. Проверка кодировки
    const hasNonAscii = /[^\x00-\x7F]/.test(content);
    checks.push(`🔤 Содержит non-ASCII: ${hasNonAscii ? 'Да' : 'Нет'}`);
    
    // 6. Сравнение с оригинальными байтами
    const originalDecompressed = originalFileInfo.content;
    checks.push(`🔍 Контент изменился: ${content !== originalDecompressed ? 'ДА' : 'НЕТ'}`);
    
    if (content !== originalDecompressed) {
      const diff = content.length - originalDecompressed.length;
      checks.push(`📝 Изменение длины: ${diff > 0 ? '+' : ''}${diff} символов`);
      
      // Найдем первое отличие
      for (let i = 0; i < Math.min(content.length, originalDecompressed.length); i++) {
        if (content[i] !== originalDecompressed[i]) {
          checks.push(`🔍 Первое отличие на позиции ${i}: "${content[i]}" vs "${originalDecompressed[i]}"`);
          break;
        }
      }
    }
    
    // 7. Рекомендации
    if (!isValidSerialized) {
      checks.push(`\n💡 РЕШЕНИЕ: Файл был изменен в неправильном формате!`);
      checks.push(`💡 Попробуйте: перезагрузить файл и НЕ редактировать его`);
      checks.push(`💡 Или: экспортировать оригинальные байты через кнопку "Оригинал"`);
    } else if (content === originalDecompressed) {
      checks.push(`\n✅ ФАЙЛ НЕ ИЗМЕНИЛСЯ - должен работать в Битрикс!`);
      checks.push(`💡 Если все еще ошибка - проблема может быть в сжатии`);
    }
    
    setDebugInfo(checks.join('\n'));
  };

  const exportOriginalUnchanged = async () => {
    try {
      // Экспортируем ТОЧНО оригинальные байты без изменений
      const arrayBuffer = originalFileInfo.originalBytes.slice().buffer;
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `original_unchanged_${originalFileInfo.name}`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Экспортированы ТОЧНО оригинальные байты файла');
    } catch (error) {
      alert(`Ошибка экспорта оригинала: ${error}`);
    }
  };

  const exportWithDebug = async () => {
    try {
      // Используем точно такой же контент без изменений
      const bytes = buildBytes(content, originalFileInfo.compression);
      
      const arrayBuffer = bytes.slice().buffer;
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `debug_${originalFileInfo.name}`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Файл экспортирован для отладки');
    } catch (error) {
      alert(`Ошибка экспорта: ${error}`);
    }
  };

  return (
    <Card className="w-full border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Bug className="w-5 h-5" />
          Отладка экспорта
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button onClick={runDebugCheck} variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Проверить
          </Button>
          <Button onClick={exportOriginalUnchanged} variant="outline" size="sm" className="text-green-700">
            <Download className="w-4 h-4 mr-1" />
            Оригинал
          </Button>
          <Button onClick={exportWithDebug} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Отладка
          </Button>
        </div>
        
        {debugInfo && (
          <div>
            <Badge variant="outline" className="mb-2">Результат проверки:</Badge>
            <Textarea
              value={debugInfo}
              readOnly
              className="font-mono text-xs h-48"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
