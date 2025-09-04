# Bitrix BPT Web Application / Веб-приложение Bitrix BPT

[English](#english) | [Русский](#russian)

---

## English

### Description

This is a Next.js web application designed for working with Bitrix Business Process Technology (BPT) files. The application provides tools for viewing, analyzing, and managing BPT process files with a modern, responsive interface built using shadcn/ui components.

### Features

- **BPT File Upload**: Upload and process BPT files
- **Content Viewer**: Interactive viewer for BPT process content
- **Process Information**: Detailed analysis of BPT processes
- **File Export**: Export functionality for processed data
- **Modern UI**: Built with shadcn/ui components for a clean, professional look

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: Yarn

### Getting Started

#### Prerequisites

- Node.js 18+ 
- Yarn package manager

#### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bitrix-bpt-web
```

2. Install dependencies:
```bash
yarn install
```

3. Run the development server:
```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

#### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

### Project Structure

```
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── BptContentViewer.tsx
│   ├── BptExport.tsx
│   ├── BptFileInfo.tsx
│   ├── BptFileUpload.tsx
│   ├── BptProcessInfo.tsx
│   └── ui/             # shadcn/ui components
├── lib/                 # Utility functions
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### License

This project is licensed under the MIT License.

---

## Русский

### Описание

Это веб-приложение Next.js, предназначенное для работы с файлами Bitrix Business Process Technology (BPT). Приложение предоставляет инструменты для просмотра, анализа и управления файлами процессов BPT с современным, адаптивным интерфейсом, построенным с использованием компонентов shadcn/ui.

### Возможности

- **Загрузка файлов BPT**: Загрузка и обработка файлов BPT
- **Просмотрщик контента**: Интерактивный просмотрщик для содержимого процессов BPT
- **Информация о процессах**: Детальный анализ процессов BPT
- **Экспорт файлов**: Функциональность экспорта обработанных данных
- **Современный UI**: Построен с использованием компонентов shadcn/ui для чистого, профессионального вида

### Технологический стек

- **Фреймворк**: Next.js 14 с App Router
- **Язык**: TypeScript
- **Стилизация**: Tailwind CSS
- **UI компоненты**: shadcn/ui
- **Менеджер пакетов**: Yarn

### Начало работы

#### Требования

- Node.js 18+
- Менеджер пакетов Yarn

#### Установка

1. Клонируйте репозиторий:
```bash
git clone <url-репозитория>
cd bitrix-bpt-web
```

2. Установите зависимости:
```bash
yarn install
```

3. Запустите сервер разработки:
```bash
yarn dev
```

4. Откройте [http://localhost:3000](http://localhost:3000) в браузере

#### Доступные скрипты

- `yarn dev` - Запуск сервера разработки
- `yarn build` - Сборка для продакшена
- `yarn start` - Запуск продакшен сервера
- `yarn lint` - Запуск ESLint

### Структура проекта

```
├── app/                 # Директория Next.js приложения
│   ├── layout.tsx      # Корневой layout
│   ├── page.tsx        # Главная страница
│   └── globals.css     # Глобальные стили
├── components/          # React компоненты
│   ├── BptContentViewer.tsx
│   ├── BptExport.tsx
│   ├── BptFileInfo.tsx
│   ├── BptFileUpload.tsx
│   ├── BptProcessInfo.tsx
│   └── ui/             # shadcn/ui компоненты
├── lib/                 # Вспомогательные функции
├── types/               # Определения типов TypeScript
└── public/              # Статические ресурсы
```

### Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Отправьте pull request

### Лицензия

Этот проект распространяется под лицензией MIT.
