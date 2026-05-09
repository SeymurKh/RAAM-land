# RAAM Site — План улучшений

**Дата:** 2026-05-09  
**Статус:** На рассмотрении

---

## Архитектура изменений

```mermaid
graph TD
    subgraph Публичный сайт
        A[HeroSection] --> B[TransitionSection - NEW]
        B --> C[EcosystemSection]
        C --> D[ArtistsSection - REDESIGNED]
        D --> E[LiveStreamSection - NEW]
        E --> F[ProjectsSection - 5 columns]
        F --> G[ContactsSection]
    end

    subgraph Админ-панель /admin
        H[Dashboard]
        I[Artists CRUD]
        J[Stream Controls]
        K[Projects CRUD]
    end

    subgraph API Routes /api
        L[/api/artists]
        M[/api/stream]
        N[/api/projects]
    end

    I --> L
    J --> M
    K --> N
    L --> D
    M --> E
    N --> F

    style B fill:#4a90d9,color:#fff
    style E fill:#4a90d9,color:#fff
    style H fill:#e67e22,color:#fff
    style I fill:#e67e22,color:#fff
    style J fill:#e67e22,color:#fff
    style K fill:#e67e22,color:#fff
```

---

## 1. Визуальные улучшения и анимации

### 1.1 Общие улучшения

| Элемент | Текущее | Предлагаемое |
|---------|----------|--------------|
| Переходы между секциями | Резкие границы | Плавные градиентные переходы с parallax-эффектом |
| Scroll-анимации | Базовый fade-in | Staggered reveal с разными направлениями — слева, справа, снизу |
| Курсор | Светлое пятно через CSS-переменные | Добавить тонкий trail-эффект за курсором с затуханием |
| Загрузка страницы | Мгновенное появление | Intro-анимация: логотип увеличивается из центра, затем контент появляется каскадом |

### 1.2 Анимации секций

- **Hero:** Параллакс фона при скролле — фон движется медленнее контента
- **Ecosystem:** Карточки появляются по одной с задержкой, с лёгким поворотом
- **Artists:** Имена появляются с 3D-эффектом поворота, как сейчас, но с меньшим размером и большим ховером
- **Projects:** Карточки раскрываются как веер при попадании в viewport
- **Contacts:** Форма и контакты появляются навстречу друг другу слева и справа

---

## 2. Имена артистов — меньше размер, больше зум

### Текущее состояние
- Размер: `text-5xl sm:text-7xl lg:text-[7.5rem]`
- Hover: `group-hover:-translate-y-2` — сдвиг на 8px

### Предлагаемое
- Размер: `text-2xl sm:text-4xl lg:text-5xl` — значительно меньше
- Hover zoom: `scale-[1.6] lg:scale-[2.2]` — увеличение в 2+ раза
- Hover эффект: плавное увеличение с `transition duration-700 ease-out`
- При ховере имя увеличивается от центра, остальные имена слегка отдаляются
- Подпись с жанрами появляется только при ховере, с задержкой

### Файлы
- `sections/ArtistsSection.tsx` — изменить классы размера и добавить hover-scale

---

## 3. Модальное окно — конфликт с хедером

### Проблема
- Header: `z-50`
- Mobile nav overlay: `z-[60]`
- ArtistModal: `z-[80]`
- Модальное окно открывается поверх хедера, но визуально они накладываются — модалка начинается сверху, а хедер виден сквозь backdrop-blur

### Решение
- При открытии модалки — скрывать хедер через состояние
- Добавить `useScrollLock` и `headerVisible` state в общий контекст или передать через page
- Модалка должна иметь `pt-20` чтобы контент не прятался за хедером
- Альтернатива: модалка на полный экран с собственным закрытием, хедер скрывается через `opacity-0 pointer-events-none`

### Файлы
- `components/ArtistModal.tsx` — добавить верхний отступ, скрытие хедера
- `components/Header.tsx` — принимать prop `hidden` для скрытия при открытой модалке
- `app/page.tsx` — поднять состояние `activeArtist` на уровень страницы

---

## 4. Админ-панель

### 4.1 Архитектура

```
app/
  admin/
    layout.tsx          — защищённый layout с авторизацией
    page.tsx            — дашборд
    artists/
      page.tsx          — список артистов
      new/page.tsx      — создание артиста
      [id]/edit/page.tsx — редактирование артиста
    stream/
      page.tsx          — управление стримом
    projects/
      page.tsx          — управление проектами
  api/
    auth/
      route.ts          — простая авторизация по паролю
    artists/
      route.ts          — GET, POST
      [id]/route.ts     — PUT, DELETE
    stream/
      route.ts          — GET, PUT
    projects/
      route.ts          — GET, POST
      [id]/route.ts     — PUT, DELETE
```

### 4.2 Хранение данных

**Вариант A — JSON-файл (рекомендуется для MVP):**
- Данные хранятся в `data/db.json`
- Простой API читает/пишет в файл
- Не требует внешней БД
- Подходит для низкого трафика

**Вариант B — SQLite + Prisma:**
- Полноценная БД в файле
- Миграции, типобезопасность
- Лучше для продакшена

### 4.3 Авторизация

- Простая авторизация по одному паролю из переменной окружения `ADMIN_PASSWORD`
- Сессия через cookie с JWT
- Без регистрации пользователей — один админ

### 4.4 CRUD артистов

Поля формы в админке соответствуют типу `Artist`:
- `name`, `origin`, `role` — текстовые поля
- `genres` — массив тегов с добавлением/удалением
- `bio` — массив абзацев текста
- `highlights` — массив строк
- `portfolio` — массив элементов с `id`, `title`, `kind`, `url`
- `socials` — массив с `kind`, `label`, `url`
- `visual` — `initials`, `position`, `tone`

### 4.5 Управление стримом

Поля в админке:
- `isLive` — переключатель вкл/выкл
- `youtubeUrl` — ссылка на YouTube стрим
- `nextStreamDate` — дата и время следующего стрима
- `streamTitle` — название стрима

---

## 5. Блок прямой трансляции — LiveStreamSection

### 5.1 Логика отображения

```
if isLive && youtubeUrl:
    → Показать YouTube embed на всю ширину
elif nextStreamDate:
    → Показать countdown timer до nextStreamDate
else:
    → Показать заглушку "Stay tuned for the next stream"
```

### 5.2 YouTube Embed

- Использовать iframe с `https://www.youtube.com/embed/{videoId}`
- Автоматическое извлечение videoId из URL через существующую функцию `getYouTubeEmbed`
- Соотношение сторон 16:9, адаптивная ширина
- Автовоспроизведение выключено — пользователь нажимает play

### 5.3 Countdown Timer

- Компонент с обратным отсчётом: дни, часы, минуты, секунды
- Визуальный стиль: крупные цифры с разделителями, анимация переворота
- Обновление каждую секунду через `setInterval`
- Когда таймер доходит до нуля — показать "Stream starting soon..."

### 5.4 Новые файлы

- `sections/LiveStreamSection.tsx` — секция с embed/timer
- `components/CountdownTimer.tsx` — компонент обратного отсчёта
- `app/api/stream/route.ts` — API для получения/обновления состояния стрима
- `data/stream.ts` — начальные данные стрима

---

## 6. Проекты — 5 колонок

### Текущее состояние
- 4 проекта, `column: 1 | 2 | 3 | 4`
- Grid: `md:grid-cols-2 xl:grid-cols-4`

### Изменения
- Добавить 5-й проект в `data/site.ts`
- Обновить тип `Project.column`: `1 | 2 | 3 | 4 | 5`
- Обновить grid: `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`
- Обновить `ProjectsSection.tsx`: `columns = [1, 2, 3, 4, 5]`
- Заголовок секции: "Five directions" вместо "Four directions"

### 5-й проект — предложение

```typescript
{
  id: "cassette-series",
  title: "Cassette Series",
  category: "Audio Visual Series",
  status: "Active",
  accent: "Intimate Sets / Vinyl Aesthetic",
  column: 5,
  description: [
    "An intimate audio-visual format recorded in close settings with a warm, analog aesthetic.",
    "Each episode captures a resident in a focused, personal set — raw sound, real atmosphere.",
  ],
}
```

---

## 7. Фон блока Artists — artists.png

### Действия
1. Скопировать `artists.png` из корня проекта в `public/assets/images/artists.png`
2. Обновить `src` в `ArtistsSection.tsx`: заменить `/assets/images/raam-artists-bg.png` на `/assets/images/artists.png`
3. Настроить `opacity` и `object-cover` для оптимального отображения

---

## 8. Промежуточный блок между Hero и Artists — TransitionSection

### Концепция
- Полноэкранная секция с фоном `lilbl.png`
- Параллакс-эффект при скролле
- Минимальный текст — цитата или слоган RAAM
- Плавный переход от тёмного hero к секции artists

### Действия
1. Скопировать `lilbl.png` из корня в `public/assets/images/lilbl.png`
2. Создать `sections/TransitionSection.tsx`
3. Добавить секцию в `app/page.tsx` между Hero и Ecosystem

### Структура секции

```
┌─────────────────────────────────────┐
│                                     │
│     [lilbl.png — parallax bg]       │
│                                     │
│     "Sound, ambiance, and visual    │
│      narrative for the next         │
│      local wave."                   │
│                                     │
│     ─── scroll indicator ───        │
│                                     │
└─────────────────────────────────────┘
```

---

## 9. Собственные предложения по улучшениям

### 9.1 SEO и мета-теги
- Добавить `sitemap.ts` и `robots.ts` в `app/`
- Добавить структурированные данные JSON-LD для организации
- Добавить Open Graph изображения для каждого артиста

### 9.2 Производительность
- Ленивая загрузка YouTube iframe — загружать только когда секция в viewport
- Оптимизация изображений — использовать `next/image` с `priority` только для hero
- Добавить `loading="lazy"` для нижних секций

### 9.3 Доступность
- Добавить `skip-to-content` ссылку в начале страницы
- Улучшить контрастность текста — некоторые элементы имеют opacity < 50%
- Добавить `focus-visible` стили для всех интерактивных элементов
- ARIA-лейблы для всех кнопок-иконок

### 9.4 Мобильная адаптация
- ArtistModal — на мобильных отображать как full-screen слайд снизу, а не как центрированный диалог
- Имена артистов на мобильных — уменьшить размер и плотность
- Добавить touch-жесты: свайп для закрытия модалки

### 9.5 Анимация загрузки страницы
- Intro-экран с логотипом RAAM, который плавно исчезает при загрузке
- Контент появляется каскадом после исчезновения intro

### 9.6 Звуковой дизайн
- Тонкий звук при наведении на имена артистов — лёгкий vinyl crackle
- Опционально — переключатель звука в хедере

### 9.7 404 страница
- Кастомная страница 404 в стиле сайта
- Анимированный виниловый диск с надписью "Track not found"

### 9.8 PWA
- Манифест для установки на главный экран
- Service Worker для офлайн-доступа
- Push-уведомления о новых стримах

---

## Порядок выполнения

| Приоритет | Задача | Зависимости |
|-----------|--------|-------------|
| P0 | Переместить artists.png и lilbl.png в public/ | Нет |
| P0 | Исправить z-index конфликта модалки и хедера | Нет |
| P1 | Уменьшить имена артистов + увеличить hover zoom | Нет |
| P1 | Заменить фон Artists на artists.png | Перемещение файла |
| P1 | Создать TransitionSection с lilbl.png | Перемещение файла |
| P1 | Расширить Projects до 5 колонок | Нет |
| P2 | Создать LiveStreamSection с YouTube embed | API стрима |
| P2 | Создать CountdownTimer компонент | Нет |
| P3 | Создать API routes для данных | Выбор хранилища |
| P3 | Создать Админ-панель — авторизация | API routes |
| P3 | Создать Админ-панель — CRUD артистов | API routes |
| P3 | Создать Админ-панель — управление стримом | API routes |
| P4 | Визуальные улучшения и анимации | Нет |
| P4 | Собственные предложения — SEO, a11y, PWA | Нет |

---

## Новые файлы — полный список

```
public/assets/images/artists.png          — из корня проекта
public/assets/images/lilbl.png           — из корня проекта

sections/TransitionSection.tsx            — промежуточная секция с lilbl.png
sections/LiveStreamSection.tsx            — секция стрима
components/CountdownTimer.tsx             — обратный отсчёт
components/AdminSidebar.tsx               — боковая навигация админки
components/ArtistForm.tsx                — форма редактирования артиста

data/stream.ts                           — начальные данные стрима
data/db.json                             — хранилище данных (если JSON-вариант)

app/api/auth/route.ts                    — авторизация
app/api/artists/route.ts                 — GET, POST артистов
app/api/artists/[id]/route.ts           — PUT, DELETE артиста
app/api/stream/route.ts                 — GET, PUT стрима
app/api/projects/route.ts               — GET, POST проектов
app/api/projects/[id]/route.ts         — PUT, DELETE проекта

app/admin/layout.tsx                    — защищённый layout
app/admin/page.tsx                      — дашборд
app/admin/artists/page.tsx              — список артистов
app/admin/artists/new/page.tsx          — создание
app/admin/artists/[id]/edit/page.tsx    — редактирование
app/admin/stream/page.tsx              — управление стримом
app/admin/projects/page.tsx            — управление проектами

lib/db.ts                              — утилиты для работы с JSON-хранилищем
lib/auth.ts                            — утилиты авторизации
```

## Изменяемые файлы

```
sections/ArtistsSection.tsx             — меньший размер имён, hover zoom, новый фон
sections/ProjectsSection.tsx            — 5 колонок
components/ArtistModal.tsx              — отступ сверху, скрытие хедера
components/Header.tsx                   — prop hidden
app/page.tsx                            — добавить TransitionSection, LiveStreamSection
app/layout.tsx                          — добавить skip-to-content ссылку
data/site.ts                            — 5-й проект, обновить тип Project
types/content.ts                        — обновить тип Project.column, добавить StreamConfig
```
