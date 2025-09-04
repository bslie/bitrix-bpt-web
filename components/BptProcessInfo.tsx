'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Variable, Users, FileText, Settings, Calendar, DollarSign, User, CheckCircle } from 'lucide-react';
import { tryDeserializePhp } from '@/lib/bpt';

interface BptProcessInfoProps {
  content: string;
}

export function BptProcessInfo({ content }: BptProcessInfoProps) {
  const processData = React.useMemo(() => {
    try {
      const parsed = tryDeserializePhp(content);
      if (!parsed) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [content]);

  if (!processData) {
    return (
      <Card className="w-full h-fit">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground text-sm">Не удалось загрузить информацию о процессе</p>
        </CardContent>
      </Card>
    );
  }

  const variables = (processData.VARIABLES as Record<string, unknown>) || {};
  const constants = (processData.CONSTANTS as Record<string, unknown>) || {};
  const documentFields = (processData.DOCUMENT_FIELDS as Record<string, unknown>) || {};
  const template = processData.TEMPLATE as unknown[];
  const templateInfo = (Array.isArray(template) && template[0] ? (template[0] as Record<string, unknown>)?.Properties : {}) || {};

  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'string': return 'bg-green-100 text-green-800';
      case 'date': return 'bg-purple-100 text-purple-800';
      case 'file': return 'bg-orange-100 text-orange-800';
      case 'select': return 'bg-yellow-100 text-yellow-800';
      case 'bool': return 'bg-gray-100 text-gray-800';
      case 'int': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeFields = Object.entries(documentFields)
    .filter(([, field]) => (field as BitrixField).active)
    .sort(([, a], [, b]) => ((a as BitrixField).sort || 999) - ((b as BitrixField).sort || 999));

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-4 h-4" />
          Информация о процессе
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Основная информация */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Название процесса</p>
            <p className="font-medium text-sm">{(templateInfo as Record<string, unknown>).Title as string || 'Без названия'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Версия</p>
            <Badge variant="outline" className="text-xs">{(processData.VERSION as string) || 'Неизвестно'}</Badge>
          </div>
        </div>

        {/* Компактные аккордеоны */}
        <Accordion type="single" collapsible className="space-y-1">
          {/* Переменные */}
          <AccordionItem value="variables" className="border rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <div className="flex items-center gap-2 text-sm">
                <Variable className="w-4 h-4" />
                <span>Переменные</span>
                <Badge variant="secondary" className="text-xs">{Object.keys(variables).length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-2 max-h-32 overflow-auto">
                {Object.entries(variables).map(([key, variable]) => {
                  const v = variable as BitrixVariable;
                  return (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="font-medium truncate">{v.Name || key}</span>
                      <div className="flex items-center gap-1">
                        <Badge className={`text-xs ${getTypeColor(v.Type)}`}>
                          {v.Type}
                        </Badge>
                        {v.Required === '1' && (
                          <Badge variant="destructive" className="text-xs">*</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Константы */}
          <AccordionItem value="constants" className="border rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                <span>Константы</span>
                <Badge variant="secondary" className="text-xs">{Object.keys(constants).length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-2 max-h-32 overflow-auto">
                {Object.entries(constants).map(([key, constant]) => {
                  const c = constant as BitrixConstant;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium truncate">{c.Name || key}</span>
                        <Badge className={`text-xs ${getTypeColor(c.Type)}`}>
                          {c.Type}
                        </Badge>
                      </div>
                      {c.Description && (
                        <p className="text-xs text-muted-foreground truncate">{c.Description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Поля документа с группировкой */}
          <AccordionItem value="fields" className="border rounded-lg">
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" />
                <span>Поля документа</span>
                <Badge variant="secondary" className="text-xs">{activeFields.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-4 max-h-60 overflow-auto">
                {/* Основные поля */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    📝 Основная информация
                  </h4>
                  <div className="grid gap-2">
                    {activeFields
                      .filter(([key]) => ['NAME', 'PREVIEW_TEXT', 'DETAIL_TEXT'].includes(key))
                      .map(([key, field]) => (
                        <FieldCard key={key} fieldKey={key} field={field as BitrixField} getTypeColor={getTypeColor} />
                      ))}
                  </div>
                </div>

                {/* Даты и сроки */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    📅 Даты и сроки
                  </h4>
                  <div className="grid gap-2">
                    {activeFields
                      .filter(([key]) => key.includes('FROM') || key.includes('TO') || key.includes('DATE'))
                      .map(([key, field]) => (
                        <FieldCard key={key} fieldKey={key} field={field as BitrixField} getTypeColor={getTypeColor} />
                      ))}
                  </div>
                </div>

                {/* Персональные данные */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    👤 Персональные данные
                  </h4>
                  <div className="grid gap-2">
                    {activeFields
                      .filter(([key]) => key.includes('FAMILIYA') || key.includes('TABELNYY') || 
                                          key.includes('STRUKTURNOE') || key.includes('TELEFONA'))
                      .map(([key, field]) => (
                        <FieldCard key={key} fieldKey={key} field={field as BitrixField} getTypeColor={getTypeColor} />
                      ))}
                  </div>
                </div>

                {/* Финансы и командировка */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    💰 Финансовая информация
                  </h4>
                  <div className="grid gap-2">
                    {activeFields
                      .filter(([key]) => key.includes('SUTOCHNYE') || key.includes('STOIMOST') || 
                                          key.includes('KOLICHESTVO') || key.includes('MESTO'))
                      .map(([key, field]) => (
                        <FieldCard key={key} fieldKey={key} field={field as BitrixField} getTypeColor={getTypeColor} />
                      ))}
                  </div>
                </div>

                {/* Статус и согласование */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    ✅ Статус процесса
                  </h4>
                  <div className="grid gap-2">
                    {activeFields
                      .filter(([key]) => key.includes('APPROVED') || key.includes('DOCUMENTS'))
                      .map(([key, field]) => (
                        <FieldCard key={key} fieldKey={key} field={field as BitrixField} getTypeColor={getTypeColor} />
                      ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

// Типы для данных Битрикс
interface BitrixField {
  Name: string;
  Type: string;
  Required: boolean;
  Multiple: boolean;
  active: boolean;
  sort?: number;
  DefaultValue?: unknown;
  Options?: Record<string, string>;
}

interface BitrixVariable {
  Name: string;
  Type: string;
  Required: string;
  Multiple: string;
  Description?: string;
}

interface BitrixConstant {
  Name: string;
  Type: string;
  Required: string;
  Multiple: string;
  Description?: string;
  Default?: unknown;
}

// Компонент для отображения отдельного поля документа
interface FieldCardProps {
  fieldKey: string;
  field: BitrixField;
  getTypeColor: (type: string) => string;
}

function FieldCard({ fieldKey, field, getTypeColor }: FieldCardProps) {
  const getFieldIcon = (type: string, fieldKey: string) => {
    if (fieldKey.includes('FROM') || fieldKey.includes('TO') || fieldKey.includes('DATE')) {
      return <Calendar className="w-3 h-3" />;
    }
    if (fieldKey.includes('STOIMOST') || fieldKey.includes('SUTOCHNYE')) {
      return <DollarSign className="w-3 h-3" />;
    }
    if (fieldKey.includes('FAMILIYA') || fieldKey.includes('TELEFONA')) {
      return <User className="w-3 h-3" />;
    }
    if (fieldKey.includes('APPROVED')) {
      return <CheckCircle className="w-3 h-3" />;
    }
    return <FileText className="w-3 h-3" />;
  };

  const getFieldDescription = (fieldKey: string, field: BitrixField): string => {
    if (field.DefaultValue && typeof field.DefaultValue === 'string') {
      return field.DefaultValue.substring(0, 60) + (field.DefaultValue.length > 60 ? '...' : '');
    }
    if (field.DefaultValue && typeof field.DefaultValue === 'object' && field.DefaultValue !== null) {
      const defaultObj = field.DefaultValue as { TEXT?: string };
      if (defaultObj.TEXT) {
        return defaultObj.TEXT.substring(0, 60) + (defaultObj.TEXT.length > 60 ? '...' : '');
      }
    }
    
    // Русские описания для ключевых полей
    const descriptions: Record<string, string> = {
      'PROPERTY_FROM': 'Дата начала командировки',
      'PROPERTY_TO': 'Дата окончания командировки', 
      'PROPERTY_FAMILIYA_IMYA_OTCHESTVO_KOMANDIRUEMOGO': 'ФИО командируемых сотрудников',
      'PROPERTY_KONTAKTNYY_NOMER_TELEFONA_RABOTNIKA': 'Контактные телефоны сотрудников',
      'PROPERTY_SUTOCHNYE': 'Размер суточных расходов',
      'PROPERTY_STOIMOST_PROZHIVANIYA': 'Стоимость гостиницы/проживания',
      'PROPERTY_STOIMOST_PROEZDA': 'Стоимость транспортных расходов',
      'PROPERTY_APPROVED': 'Статус согласования заявки',
      'PROPERTY_MESTO_KOMANDIROVANIYA': 'Место назначения командировки',
      'PROPERTY_KOLICHESTVO_SOTRUDNIKOV_V_SMETE': 'Количество человек в смете расходов',
      'NAME': 'Название документа/заявки',
      'PREVIEW_TEXT': 'Цель и описание командировки',
      'DETAIL_TEXT': 'Источник финансирования поездки'
    };
    
    return descriptions[fieldKey] || 'Поле документа';
  };

  const getTypeDisplayName = (type: string): string => {
    const typeNames: Record<string, string> = {
      'string': 'Текст',
      'date': 'Дата',
      'text': 'Многострочный текст',
      'select': 'Выпадающий список',
      'S:Money': 'Денежная сумма',
      'S:HTML': 'HTML-текст',
      'user': 'Пользователь',
      'file': 'Файл',
      'bool': 'Да/Нет',
      'int': 'Число'
    };
    
    return typeNames[type] || type;
  };

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
      <div className="mt-0.5">
        {getFieldIcon(field.Type, fieldKey)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="font-medium text-sm truncate">{field.Name}</h5>
          <div className="flex items-center gap-1">
            {field.Required && (
              <Badge variant="destructive" className="text-xs px-1">
                Обязательное
              </Badge>
            )}
            {field.Multiple && (
              <Badge variant="outline" className="text-xs px-1">
                Множественное
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex-1 truncate">
            {getFieldDescription(fieldKey, field)}
          </p>
          <Badge className={`text-xs ml-2 ${getTypeColor(field.Type)}`}>
            {getTypeDisplayName(field.Type)}
          </Badge>
        </div>
        
        {/* Опции для select-полей */}
        {field.Options && Object.keys(field.Options).length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {Object.entries(field.Options).slice(0, 3).map(([optKey, optValue]) => (
                <span key={optKey} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {optValue}
                </span>
              ))}
              {Object.keys(field.Options).length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{Object.keys(field.Options).length - 3} ещё
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}