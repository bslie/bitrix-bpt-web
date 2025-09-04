'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';
import { BptFileInfo, parseBptFile } from '@/lib/bpt';

interface BptFileUploadProps {
  onFileLoaded: (fileInfo: BptFileInfo) => void;
}

export function BptFileUpload({ onFileLoaded }: BptFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.bpt')) {
      alert('Пожалуйста, выберите файл с расширением .bpt');
      return;
    }

    setIsLoading(true);
    try {
      const fileInfo = await parseBptFile(file);
      onFileLoaded(fileInfo);
    } catch (error) {
      console.error('Ошибка при обработке файла:', error);
      alert(`Ошибка при обработке файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  }, [onFileLoaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const loadDemoFile = async () => {
    setIsLoading(true);
    try {
      // Создаем простой демо .bpt файл в PHP serialized формате
      const demoBptContent = 'a:4:{s:7:"VERSION";i:2;s:8:"TEMPLATE";a:1:{i:0;a:3:{s:4:"Type";s:25:"SequentialWorkflowActivity";s:4:"Name";s:8:"Template";s:10:"Properties";a:1:{s:5:"Title";s:38:"Демонстрационный процесс";}}}s:9:"VARIABLES";a:1:{s:8:"Employee";a:4:{s:4:"Name";s:18:"Сотрудник";s:4:"Type";s:4:"user";s:8:"Required";s:1:"1";s:8:"Multiple";s:1:"0";}}s:9:"CONSTANTS";a:1:{s:7:"Manager";a:4:{s:4:"Name";s:24:"Руководитель";s:4:"Type";s:4:"user";s:8:"Required";s:1:"1";s:7:"Default";a:1:{i:0;s:6:"user_1";}}}}';
      
      // Создаем File объект с PHP serialized содержимым
      const blob = new Blob([demoBptContent], { type: 'application/octet-stream' });
      const demoFile = new File([blob], 'demo-process.bpt', { type: 'application/octet-stream' });
      
      // Обрабатываем как обычный файл
      const fileInfo = await parseBptFile(demoFile);
      onFileLoaded(fileInfo);
    } catch (error) {
      console.error('Ошибка при загрузке демо файла:', error);
      alert('Ошибка при загрузке демо файла');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Загрузка .bpt файла
        </CardTitle>
        <CardDescription>
          Выберите или перетащите .bpt файл для анализа и редактирования бизнес-процесса Битрикс
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${isDragOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${isLoading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="flex items-center justify-center gap-6">
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="text-left">
              <p className="text-base font-medium">
                {isLoading ? 'Загрузка файла...' : 'Перетащите .bpt файл сюда или нажмите для выбора'}
              </p>
              <p className="text-sm text-muted-foreground">
                Поддерживаются файлы бизнес-процессов Битрикс
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="secondary" disabled={isLoading}>
                Выбрать файл
              </Button>
              <Button 
                variant="outline" 
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  loadDemoFile();
                }}
              >
                Демо файл
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="file-input" className="sr-only">
            Выбор .bpt файла
          </Label>
          <Input
            ref={fileInputRef}
            id="file-input"
            type="file"
            accept=".bpt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}
