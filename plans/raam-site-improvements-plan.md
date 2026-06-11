# План изменений RAAM landing

Дата: 2026-06-11

## Текущее состояние проекта

- Проект на Next.js 16.2.6, React 19, Tailwind CSS 4, Framer Motion, Vanta.
- Главная страница собирается через `app/page.tsx` и `components/PageShell.tsx`.
- Основные секции лежат в `sections`: `HeroSection`, `ArtistsSection`, `LiveStreamSection`, `ProjectsSection`, `ContactsSection`.
- Vanta TRUNK сейчас используется только в `sections/HeroSection.tsx`.
- Остальные секции получают фоновые изображения через `components/SectionFrame.tsx` и прямой `Image` в `sections/ArtistsSection.tsx`.
- Артисты и стрим уже управляются через файловую БД `data/db.json`, слой `lib/db.ts`, API routes и админку.
- Проекты пока статичны: массив `projects` находится в `data/site.ts`, админки/API для проектов нет.
- Соцсети артистов в модальном окне используют не брендовые логотипы, а приблизительные иконки из `lucide-react`.

## Цели

1. Сделать единый Vanta-фон для всего сайта.
2. Убрать фоновые фото из секций, оставив отдельный чёрно-сероватый фон только для `Contacts`.
3. Полностью переработать `Projects` в центральную галерею одного проекта с переключением влево/вправо.
4. Добавить управление проектами через админ-панель: список, создание, редактирование, удаление.
5. Обновить `Artists`: Bebas Neue, более живое хаотичное распределение имён, усиленное парение, без наложений и вылезания за экран.
6. Удалить проект `Coaching Programs`.
7. Обновить ссылки проектов и гарантировать открытие именно YouTube-плейлистов.
8. Заменить соцсети артистов на настоящие логотипы соцсетей.

## Фаза 1. Единый Vanta-фон

- Вынести Vanta из `sections/HeroSection.tsx` в отдельный компонент, например `components/VantaBackground.tsx`.
- Подключить `VantaBackground` один раз в `components/PageShell.tsx` как fixed/background layer под всеми секциями.
- Оставить в `HeroSection` только контент, scroll-анимацию текста и overlay-слои, уже без собственного Vanta canvas.
- Убрать `bgImage` из `SectionFrame` либо оставить prop временно неиспользуемым до очистки всех вызовов.
- Удалить передачи `bgImage` из:
  - `sections\ProjectsSection.tsx`
  - `sections\LiveStreamSection.tsx`
  - `sections\ContactsSection.tsx`
- Убрать прямой фон `Image` из `sections\ArtistsSection.tsx`.
- Для `Contacts` задать явный чёрно-сероватый фон секции, например `bg-[#0a0a0a]` или мягкий `linear-gradient` без фото.
- Проверить body/main backgrounds в `app\globals.css` и `components\PageShell.tsx`, чтобы они не перекрывали Vanta полностью.
- После проверки удалить неиспользуемые фоновые файлы:
  - `public\assets\images\projects.png`
  - `public\assets\images\streams.png`
  - `public\assets\images\raam-artists-bg.png`, если не используется
  - `public\assets\images\lilbl.png`
  - `public\assets\images\contact.png`

## Фаза 2. Данные проектов и админка

- Обновить тип `Project` в `types\content.ts`:
  - убрать `column`;
  - добавить `order: number`;
  - оставить `youtubeUrl`;
  - решить, нужен ли `bgImage`: если проектные картинки будут контентом карточки, переименовать в `image`; если нет, убрать.
- Перенести проекты из `data\site.ts` в `data\db.json` рядом с `artists` и `stream`.
- Добавить fallback seed для проектов в `data\seed.ts` или отдельный `data\projects.ts`.
- Расширить `DbData` и `lib\db.ts` методами:
  - `getProjects`
  - `getProject`
  - `createProject`
  - `updateProject`
  - `deleteProject`
- Создать API routes по текущему паттерну Next 16:
  - `app\api\projects\route.ts` для `GET` и `POST`;
  - `app\api\projects\[id]\route.ts` для `GET`, `PUT`, `DELETE`;
  - для мутаций использовать `verifyToken`, как у артистов.
- Создать админские страницы:
  - `app\admin\projects\page.tsx`;
  - `app\admin\projects\new\page.tsx`;
  - `app\admin\projects\[id]\edit\page.tsx`.
- Создать `components\ProjectForm.tsx` по аналогии с `ArtistForm`, но проще:
  - id/slug;
  - title;
  - category;
  - status;
  - accent;
  - order;
  - youtubeUrl;
  - description paragraphs;
  - optional image, только если решим оставить проектную визуализацию.
- Добавить ссылку `Projects` в `components\AdminLayout.tsx`.
- Обновить `app\admin\page.tsx`, чтобы dashboard показывал количество проектов.

## Фаза 3. Новый блок Projects

- Переписать `sections\ProjectsSection.tsx` с текущей grid/mobile-scroll структуры на центральную галерею.
- Загружать проекты через `/api/projects`, сортировать по `order`.
- Показывать один активный проект в большом центральном окне:
  - title;
  - category/status/accent;
  - описание;
  - кнопка открытия YouTube-плейлиста;
  - счётчик `01 / 04`;
  - стрелки влево/вправо;
  - dots/thumbnails для быстрого перехода.
- Добавить поддержку клавиатуры для секции: `ArrowLeft`, `ArrowRight`, `Enter` для открытия текущего проекта.
- На мобильных добавить swipe через Framer Motion drag или pointer-события.
- Убрать `Linktree` карточку из Projects, так как это не проект.
- Сохранять `YouTubeModal`, но поправить embed-логику для playlist-only URL.

## Фаза 4. Проектные ссылки и YouTube playlist embed

- Удалить `Coaching Programs` из seed/БД проектов.
- Обновить проекты:
  - `RAAM x FOMO`: `https://www.youtube.com/playlist?list=PLXMe8QzaK6KR5z3A3WtLCXzsGmX8WvWQh`
  - `UpTempo Jams`: `https://www.youtube.com/playlist?list=PLXMe8QzaK6KTjYTv9sNTbJqtszfohb7B5`
  - `RAAM LIVE`: `https://youtube.com/playlist?list=PLXMe8QzaK6KSM-Hjia_RE5euiS75RXDao&si=oJYYS4ECGlviSxad`
  - `RAAM Cassette`: `https://youtube.com/playlist?list=PLXMe8QzaK6KSV0OBvj_fOEoq8PPbsltA2&si=ehU1mjUECC4KBGgd`
- Исправить `getYouTubeEmbed` в `lib\utils.ts`:
  - если есть `list`, но нет `videoId`, возвращать `https://www.youtube.com/embed/videoseries?list=...`;
  - если есть и `videoId`, и `list`, можно оставить `/embed/{videoId}?list=...`;
  - сохранить поддержку `youtu.be`, `watch?v=`, `embed`.
- Проверить, что modal открывает именно playlist view, а не одиночное видео.

## Фаза 5. Artists: типографика, раскладка, парение

- Подключить Bebas Neue локально через `public\fonts\BebasNeue-Regular.ttf` и `@font-face` в `app\globals.css`.
- Добавить CSS variable/class для артистских имён, например `.font-bebas`.
- Переписать `getArtistPosition` в `sections\ArtistsSection.tsx`:
  - использовать заранее нормализованные "слоты" по вертикали и горизонтали;
  - распределять имена не строго left/right, а по нескольким колонкам/зонам;
  - учитывать длину имени: длинным именам давать более центральные/широкие зоны;
  - ограничить координаты через safe margins.
- Уменьшить риск пересечений:
  - ограничить hover scale через responsive значения;
  - добавить `max-width`, `text-wrap: balance`, `overflow-wrap`;
  - использовать `clamp()` для размеров шрифта;
  - на hover поднимать z-index, но не давать transform уходить за край через `transform-origin` в зависимости от позиции.
- Усилить эффект парения:
  - увеличить амплитуду translateY;
  - добавить лёгкий rotate/translateX;
  - разнести durations/delays по артистам;
  - уважать `prefers-reduced-motion`.
- После изменений обязательно проверить desktop и mobile screenshots, особенно имена `Farik Interlude` и другие длинные названия.

## Фаза 6. Настоящие логотипы соцсетей

- Не использовать `lucide-react` для брендовых соцсетей.
- Использовать SVG из `public\brand_logo` через локальный компонент `components\BrandSocialIcon.tsx` для:
  - Instagram;
  - SoundCloud;
  - Spotify;
  - YouTube;
  - Linktree;
  - Email/Phone оставить lucide, так как это не соцсети.
- Заменить `socialIcons` в `components\ArtistModal.tsx` на брендовый компонент.
- При необходимости заменить иконки в `sections\ContactsSection.tsx` для Linktree/соцсетей.
- Проверить размеры иконок в кнопках, чтобы не прыгала высота элементов.

## Фаза 7. Очистка и качество

- Убрать неиспользуемые импорты после удаления фоновых `Image`.
- Удалить неиспользуемые assets только после `rg`-проверки ссылок.
- Исправить mojibake/битую кодировку в комментариях и строках, если затронутые файлы всё равно будут редактироваться.
- Проверить, что удаление проекта через админку не ломает порядок и активный индекс галереи.
- Проверить, что сайт корректно работает без проектов: показывать аккуратный empty state.
- Проверить доступность:
  - aria-label для стрелок галереи;
  - focus-visible состояния;
  - закрытие YouTube modal по Escape уже есть, сохранить.

## Проверки перед сдачей

- `npm run lint`
- `npm run build`
- Запуск dev-сервера и ручная проверка:
  - главная страница;
  - `#artists`;
  - `#projects`;
  - `#contacts`;
  - `/admin`;
  - `/admin/projects`;
  - создание, редактирование и удаление проекта.
- Скриншоты в Chrome headless:
  - mobile 390px;
  - desktop 1440px;
  - отдельный screenshot `#artists`;
  - отдельный screenshot `#projects`.

## Потенциальные риски

- Vanta как fixed canvas на весь сайт может просесть по производительности на слабых мобильных устройствах. Нужен reduced-motion fallback и, возможно, упрощённые параметры Vanta на mobile.
- Перенос проектов из статического массива в `data\db.json` меняет источник правды. Нужно аккуратно мигрировать текущие данные и seed, чтобы не потерять контент.
- Локальный файл `data\db.json` подходит для текущей простой админки, но на сервере без persistent filesystem изменения могут не сохраняться после деплоя. Если сайт будет жить на Vercel/serverless, стоит отдельно обсудить постоянное хранилище.
- Bebas Neue может потребовать добавления font-файла или сетевого доступа при сборке, если использовать Google Fonts.
- Настоящие логотипы соцсетей лучше держать локальными SVG, чтобы не добавлять зависимость только ради нескольких бренд-иконок.

## Предлагаемый порядок реализации

1. Сначала вынести Vanta в общий фон и убрать секционные фоновые изображения.
2. Затем перенести проекты в БД/API и добавить админку.
3. После этого переписать `ProjectsSection` под новую галерею.
4. Затем обновить YouTube embed и проектные ссылки.
5. Потом довести `Artists`: Bebas Neue, раскладка, парение, ограничения hover.
6. В конце заменить соц-иконки, удалить неиспользуемые assets и прогнать проверки.
