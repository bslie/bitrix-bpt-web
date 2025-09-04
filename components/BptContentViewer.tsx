'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Eye, Edit3, Download, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Ленивая загрузка SyntaxHighlighter для лучшей производительности
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  { 
    ssr: false,
    loading: () => (
      <div className="border rounded-md p-4 min-h-[500px] bg-muted/5 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Загрузка подсветки синтаксиса...</span>
      </div>
    )
  }
);

// Ленивая загрузка стилей
const getStyles = async () => {
  const styles = await import('react-syntax-highlighter/dist/esm/styles/prism');
  return { oneLight: styles.oneLight, oneDark: styles.oneDark };
};
import { BptFileInfo, tryDeserializePhp, convertJsonToPhp } from '@/lib/bpt';

interface BptContentViewerProps {
  fileInfo: BptFileInfo;
  onContentChange: (content: string) => void;
  onExportRequest?: () => void;
}

export function BptContentViewer({ fileInfo, onContentChange, onExportRequest }: BptContentViewerProps) {
  const [showPretty, setShowPretty] = useState(true);
  const [editableContent, setEditableContent] = useState(fileInfo.content);
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [enableSyntaxHighlighting, setEnableSyntaxHighlighting] = useState(true);
  const [syntaxStyles, setSyntaxStyles] = useState<{ oneLight: unknown; oneDark: unknown } | null>(null);
  const [isEditingPrettyFormat, setIsEditingPrettyFormat] = useState(false);
  
  // Определяем размер файла для автоматического отключения подсветки
  const isLargeFile = fileInfo.content.length > 50000; // 50KB

  // Автоматическое отключение подсветки для больших файлов
  React.useEffect(() => {
    if (isLargeFile) {
      setEnableSyntaxHighlighting(false);
    }
  }, [isLargeFile]);

  // Загрузка стилей подсветки
  React.useEffect(() => {
    if (enableSyntaxHighlighting && !syntaxStyles) {
      getStyles().then(setSyntaxStyles);
    }
  }, [enableSyntaxHighlighting, syntaxStyles]);

  // Определение темы из системных настроек
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkTheme(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsDarkTheme(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Мемоизированный pretty формат
  const prettyContent = useMemo(() => {
    if (!fileInfo.isValidSerialized) return 'Файл не содержит валидные PHP serialized данные';
    
    const parsed = tryDeserializePhp(fileInfo.content);
    if (!parsed) return 'Ошибка при парсинге PHP данных';
    
    return JSON.stringify(parsed, null, 2); // JSON формат для лучшей подсветки
  }, [fileInfo.content, fileInfo.isValidSerialized]);

  // Для отображения используем pretty или оригинальный PHP serialized
  const displayContent = showPretty && fileInfo.isValidSerialized ? prettyContent : editableContent;
  
  // Определение языка для подсветки
  const syntaxLanguage = useMemo(() => {
    if (showPretty && fileInfo.isValidSerialized) {
      return 'json';  // JSON для pretty формата
    }
    return 'text';  // Обычный текст для PHP serialized
  }, [showPretty, fileInfo.isValidSerialized]);

  const handleContentEdit = (newContent: string) => {
    setEditableContent(newContent);
    
    if (isEditingPrettyFormat) {
      // Если редактируем JSON, конвертируем в PHP serialized
      const phpContent = convertJsonToPhp(newContent);
      if (phpContent) {
        onContentChange(phpContent);
      }
    } else {
      // Если редактируем PHP serialized, сохраняем как есть
      onContentChange(newContent);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      // TODO: Добавить toast уведомление
    } catch (err) {
      console.error('Ошибка при копировании:', err);
    }
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Выходим из режима редактирования - финальное сохранение
      if (isEditingPrettyFormat) {
        const phpContent = convertJsonToPhp(editableContent);
        if (phpContent) {
          onContentChange(phpContent);
        } else {
          alert('Ошибка: не удалось конвертировать JSON в PHP serialized формат');
          return;
        }
      } else {
        onContentChange(editableContent);
      }
      setIsEditingPrettyFormat(false);
    } else {
      // Входим в режим редактирования
      if (showPretty && fileInfo.isValidSerialized) {
        // Редактируем в JSON формате
        setIsEditingPrettyFormat(true);
        setEditableContent(prettyContent);
      } else {
        // Редактируем в PHP serialized формате
        setIsEditingPrettyFormat(false);
        setEditableContent(fileInfo.content);
        setShowPretty(false);
      }
    }
  };

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Содержимое файла
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="pretty-mode"
                checked={showPretty}
                onCheckedChange={setShowPretty}
                disabled={!fileInfo.isValidSerialized || isEditing}
              />
              <Label htmlFor="pretty-mode" className="text-xs">
                Читаемый
              </Label>
            </div>
            
            {!isEditing && (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="syntax-highlighting"
                    checked={enableSyntaxHighlighting}
                    onCheckedChange={setEnableSyntaxHighlighting}
                  />
                  <Label htmlFor="syntax-highlighting" className="text-xs">
                    Подсветка
                  </Label>
                </div>
                
                {enableSyntaxHighlighting && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="line-numbers"
                      checked={showLineNumbers}
                      onCheckedChange={setShowLineNumbers}
                    />
                    <Label htmlFor="line-numbers" className="text-xs">
                      Номера
                    </Label>
                  </div>
                )}
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4" />
            </Button>
            {onExportRequest && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportRequest}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
                        {/* Панель управления */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={toggleEditing}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                {isEditing ? 'Сохранить' : 'Редактировать'}
              </Button>
              {isEditing && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {isEditingPrettyFormat 
                    ? 'Редактирование JSON (конвертируется в PHP)' 
                    : 'Редактирование PHP serialized формата'
                  }
                </span>
              )}
            </div>
            
            {/* Информация о режиме отображения */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {!isEditing && (
                <>
                  <span>{showPretty ? '🎨 JSON' : '📝 PHP'}</span>
                  <span>•</span>
                  <span>{enableSyntaxHighlighting ? '🌈 Подсветка' : '⚡ Быстро'}</span>
                  <span>•</span>
                  <span>{displayContent.split('\n').length} строк</span>
                  {isLargeFile && (
                    <>
                      <span>•</span>
                      <span className="text-orange-600">Файл &gt; 50KB</span>
                    </>
                  )}
                </>
              )}
              {isEditing && (
                <span className="text-amber-600">
                  ⚠️ Редактирование в {isEditingPrettyFormat ? 'JSON' : 'PHP'} формате
                </span>
              )}
            </div>
          </div>

          {/* Область содержимого */}
          <div className="relative">
            {isEditing ? (
              // Режим редактирования - обычная textarea
              <Textarea
                value={editableContent}
                onChange={(e) => handleContentEdit(e.target.value)}
                className="min-h-[500px] font-mono text-xs resize-none border-primary"
                placeholder="PHP serialized содержимое..."
              />
            ) : enableSyntaxHighlighting && !isLargeFile && syntaxStyles ? (
              // Режим просмотра - подсветка синтаксиса
              <div className="border rounded-md overflow-hidden bg-muted/5">
                <SyntaxHighlighter
                  language={syntaxLanguage}
                  style={isDarkTheme ? (syntaxStyles.oneDark as Record<string, React.CSSProperties>) : (syntaxStyles.oneLight as Record<string, React.CSSProperties>)}
                  customStyle={{
                    margin: 0,
                    minHeight: '500px',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    background: 'transparent',
                    padding: '1rem'
                  }}
                  showLineNumbers={showLineNumbers}
                  lineNumberStyle={{
                    minWidth: '3em',
                    paddingRight: '1em',
                    fontSize: '11px',
                    color: isDarkTheme ? '#6b7280' : '#9ca3af',
                    userSelect: 'none',
                    textAlign: 'right'
                  }}
                  wrapLines={true}
                  wrapLongLines={true}
                  codeTagProps={{
                    style: {
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                      fontSize: '12px'
                    }
                  }}
                  lineProps={() => ({
                    style: {
                      display: 'block',
                      width: '100%'
                    }
                  })}
                >
                  {displayContent}
                </SyntaxHighlighter>
              </div>
            ) : (
              // Режим просмотра - обычный текст (быстро)
              <Textarea
                value={displayContent}
                readOnly
                className="min-h-[500px] font-mono text-xs resize-none"
                placeholder="Содержимое файла будет отображено здесь..."
              />
            )}
            
            {/* Уведомления */}
            {!fileInfo.isValidSerialized && showPretty && (
              <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs z-10">
                Неподдерживаемый формат
              </div>
            )}
            
            {isLargeFile && !enableSyntaxHighlighting && !isEditing && (
              <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs z-10">
                ⚡ Быстрый режим (файл &gt; 50KB)
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
