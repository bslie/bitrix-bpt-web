'use client';

import { useState } from 'react';
import { BptFileUpload } from '@/components/BptFileUpload';
import { BptFileInfoComponent } from '@/components/BptFileInfo';
import { BptContentViewer } from '@/components/BptContentViewer';
import { BptExport } from '@/components/BptExport';
import { BptProcessInfo } from '@/components/BptProcessInfo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BptFileInfo } from '@/lib/bpt';

export default function Home() {
  const [currentFile, setCurrentFile] = useState<BptFileInfo | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const handleFileLoaded = (fileInfo: BptFileInfo) => {
    setCurrentFile(fileInfo);
    setEditedContent(fileInfo.content);
  };

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
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
