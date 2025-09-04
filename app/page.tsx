'use client';

import { useState } from 'react';
import { BptFileUpload } from '@/components/BptFileUpload';
import { BptFileInfoComponent } from '@/components/BptFileInfo';
import { BptContentViewer } from '@/components/BptContentViewer';
import { BptExport } from '@/components/BptExport';
import { BptProcessInfo } from '@/components/BptProcessInfo';
import { BptExportDebug } from '@/components/BptExportDebug';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BptFileInfo } from '@/lib/bpt';

export default function Home() {
  const [currentFile, setCurrentFile] = useState<BptFileInfo | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const handleFileLoaded = (fileInfo: BptFileInfo) => {
    setCurrentFile(fileInfo);
    // ВАЖНО: всегда сохраняем в оригинальном PHP serialized формате
    setEditedContent(fileInfo.content);
  };

  const handleContentChange = (newContent: string) => {
    // ВАЖНО: принимаем только PHP serialized формат для экспорта
    setEditedContent(newContent);
  };

  const resetToOriginal = () => {
    if (currentFile) {
      setEditedContent(currentFile.content);
      alert('Контент сброшен к оригинальному состоянию');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bitrix BPT Редактор
          </h1>
          <p className="text-lg text-muted-foreground">
            Веб-интерфейс для работы с файлами бизнес-процессов Битрикс
          </p>
        </div>

        <div className="space-y-6">
          {/* Компактная загрузка файла */}
          <BptFileUpload onFileLoaded={handleFileLoaded} />

          {/* Контент после загрузки файла */}
          {currentFile && (
            <div className="space-y-6">
              {/* Информация о файле и процессе */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <BptFileInfoComponent fileInfo={currentFile} />
                <div className="lg:col-span-2">
                  <BptProcessInfo content={editedContent} />
                </div>
              </div>

              {/* Основная рабочая область - содержимое на всю ширину */}
              <BptContentViewer 
                fileInfo={currentFile} 
                onContentChange={handleContentChange}
                onExportRequest={() => setIsExportDialogOpen(true)}
              />

              {/* Отладочная панель */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <BptExportDebug 
                    content={editedContent}
                    originalFileInfo={currentFile}
                  />
                </div>
                <div className="w-48">
                  <Card className="h-fit border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-700 text-sm">Быстрые действия</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        onClick={resetToOriginal}
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                      >
                        Сбросить к оригиналу
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Если редактировали файл и получили ошибку - сбросьте к исходному состоянию
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Диалог экспорта */}
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Экспорт .bpt файла</DialogTitle>
                  </DialogHeader>
                  <BptExport 
                    content={editedContent}
                    originalCompression={currentFile.compression}
                    originalFilename={currentFile.name}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Футер */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Bitrix BPT Editor - Инструмент для работы с бизнес-процессами</p>
        </footer>
      </div>
    </div>
  );
}
