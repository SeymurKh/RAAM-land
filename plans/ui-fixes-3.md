# UI Fixes — Batch 3

## Правка 1: Direct Channel кнопка — увеличить ширину

**Файл:** `sections/ContactsSection.tsx`

Кнопки Direct Channel (Phone, Email, Linktree) сделать шире. Сейчас кнопки компактные — увеличить `min-w` или добавить `w-full`/`flex-1` чтобы они занимали больше места по горизонтали.

---

## Правка 2: Flyout Direct Channel — уменьшить размер

**Файл:** `sections/ContactsSection.tsx`

Уменьшить flyout-панель Direct Channel в десктопе:
- Ширина: `w-[24rem]` → `w-[20rem]`
- Уменьшить padding внутри
- Уменьшить иконки

---

## Правка 3: Artists — центровать от центра, раскидать влево-вправо, больше отступ сверху

**Файл:** `sections/ArtistsSection.tsx`

Изменить `CHAOTIC_POSITIONS` так чтобы имена расходились от центра влево и вправо, а не прижимались к краям. Увеличить отступ сверху:
- Добавить `pt-16 sm:pt-20` к контейнеру
- Первый `top` сдвинуть с 6% → ~14%
- Позиции `x` сделать симметричными от центра: например 20%/80%, 30%/70%, 40%/60%

---

## Правка 4: Artists мобильный — увеличить шрифт имён

**Файл:** `sections/ArtistsSection.tsx`

Увеличить размер шрифта имён артистов в мобильной версии:
- `text-xl` → `text-2xl` для мобильного

---

## Правка 5: Projects — вставить фоновые изображения из bckgr/

**Затрагиваемые файлы:**
- `types/content.ts` — добавить поле `bgImage?: string` в интерфейс `Project`
- `data/site.ts` — добавить `bgImage` к каждому проекту
- `sections/ProjectsSection.tsx` — использовать `bgImage` как фон карточки
- Копировать файлы из `bckgr/` в `public/assets/images/projects/`

**Маппинг изображений:**
| Файл | Проект |
|------|--------|
| `cassette.png` | Cassette Series |
| `coach.png` | Coaching |
| `raamfomo.png` | FOMO |
| `uptempo.png` | UpTempo |

**Реализация в ProjectsSection:**
- Добавить `background-image` через `style={{ backgroundImage: ... }}` или Next.js `Image` с `fill` + `object-cover` + opacity overlay
- Текст поверх изображения с затемнением (`bg-gradient-to-t from-black/80`)

---

## Правка 6: Projects — добавить ссылки на YouTube и модальное окно для просмотра

**Затрагиваемые файлы:**
- Новый: `components/VideoModal.tsx` — модальное окно с YouTube iframe
- `data/site.ts` — заполнить `media.url` для каждого проекта
- `sections/ProjectsSection.tsx` — добавить кнопку Play на карточку, открыть VideoModal по клику
- `next.config.ts` — изменить `X-Frame-Options: DENY` → `SAMEORIGIN` чтобы YouTube iframe работал

**YouTube ссылки:**
| Проект | URL |
|--------|-----|
| Cassette Series | `https://www.youtube.com/playlist?list=PLXMe8QzaK6KSV0OBvj_fOEoq8PPbsltA2` |
| UpTempo | `https://www.youtube.com/playlist?list=PLXMe8QzaK6KTjYTv9sNTbJqtszfohb7B5` |
| FOMO | `https://www.youtube.com/watch?v=xdwI9T41lTM&list=RDxdwI9T41lTM&start_radio=1&t=424s` |
| RAAM Live | `https://youtu.be/F2E4wDTzodM?si=f5i7hyq7bN61bQoq` |

**VideoModal компонент:**
- Принимает `url: string` и `onClose` callback
- Конвертирует YouTube URL в embed формат: `https://www.youtube.com/embed/{videoId}?...`
- Рендерит `<iframe>` с `allow="autoplay; encrypted-media"` и `allowFullScreen`
- Оверлей с кликом вне для закрытия
- Кнопка ✕ для закрытия
- Блокировка скролла при открытом модале

**Конвертация URL:**
- `youtube.com/watch?v=ID` → `youtube.com/embed/ID`
- `youtube.com/playlist?list=ID` → `youtube.com/embed/videoseries?list=ID`
- `youtu.be/ID` → `youtube.com/embed/ID`
