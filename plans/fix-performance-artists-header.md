# План исправлений: производительность, артисты, Header

## Проблема 1: Прозрачность Header пропадает

### Диагноз
В `globals.css` строка 43: `body::before` имеет `z-index: 70`, а `Header` — `z-50` (z-index: 50). Сеточный паттерн с `mix-blend-mode: soft-light` накладывается **поверх хедера**, создавая визуальный эффект «пропадания прозрачности». Также `backdrop-blur-[1px]` на оверлеях секций может конфликтовать с `backdrop-blur-xl` хедера.

### Решение
1. **`globals.css`** — понизить `z-index` у `body::before` с 70 до 1. Этот паттерн должен быть самым нижним слоем, он декоративный и не должен перекрывать ничего.
2. **`components/Header.tsx`** — поднять `z-50` до `z-[60]`, чтобы хедер всегда был выше любых декоративных слоёв.
3. **`components/ArtistModal.tsx`** — проверить что модалка `z-[80]` остаётся выше хедера.

### Z-index шкала после исправления
| Элемент | Текущий | Новый |
|---------|---------|-------|
| `body::before` паттерн | 70 | 1 |
| Мобильное меню | 60 | 60 |
| Header | 50 | 60 |
| ArtistModal | 80 | 80 |

---

## Проблема 2: Артисты некорректно отображаются и не заполняют секцию

### Диагноз
В `ArtistsSection.tsx` строки 30-51: позиции захардкожены для 5 конкретных ID артистов. Если API вернёт другого артиста или изменится порядок — используется фоллбэк `{ top: 50, x: 10 }`, что приводит к наложениям. Контейнер имеет фиксированные `min-h`, а артисты разбросаны абсолютным позиционированием — при малом количестве секция выглядит пустой.

### Решение
1. **Убрать хардкод `artistPositions`** — заменить на алгоритмическое распределение позиций по сетке с рандомизацией offset/rotate.
2. **Сделать секцию `min-h-screen`** на десктопе, чтобы артисты заполняли всю высоту.
3. **Распределять артистов равномерно** по вертикали: `top = (index / total) * 80 + 10%` с небольшим случайным offset.
4. **Чередовать left/right** по индексу: чётные — левая колонка, нечётные — правая.
5. **Добавить seed-based рандом** на основе `artist.id`, чтобы позиции были стабильными между рендерами.

### Конкретные изменения в `ArtistsSection.tsx`

```tsx
// Удалить: const artistPositions = { ... }

// Добавить: функция генерации позиции на основе индекса
function getArtistPosition(index: number, total: number, isDesktop: boolean) {
  const row = index;
  const rows = total;
  const verticalGap = 80 / (rows + 1); // равномерное распределение
  
  const baseTop = verticalGap * (row + 1) + 8;
  const isLeft = index % 2 === 0;
  
  // Seed-based offset для стабильности
  const seedOffset = ((index * 7 + 3) % 11) - 5; // -5..5
  
  return {
    top: isDesktop ? baseTop + seedOffset * 0.5 : baseTop + seedOffset * 0.3,
    x: isDesktop ? (8 + Math.abs(seedOffset) * 0.3) : (5 + Math.abs(seedOffset) * 0.2),
    align: isLeft ? "left" as const : "right" as const,
    rotate: seedOffset * 0.15,
  };
}
```

---

## Проблема 3: Производительность — сайт притормаживает

### Диагноз
Несколько источников нагрузки:
- `backdrop-blur-[1px]` на оверлеях всех секций — еле заметный, но дорогой GPU-эффект
- `CursorAtmosphere` обновляет CSS-переменные на каждое движение мыши без троттлинга
- `ScrollBackground` обновляет `backgroundColor` на каждый скролл
- Vanta.js TRUNK работает непрерывно даже на мобильных
- `priority` на изображениях нижних секций — ненужная загрузка
- Бесконечные анимации `y` и `rotateZ` с `repeat: Infinity` у каждого артиста

### Решение

#### 3a. Убрать `backdrop-blur-[1px]` с оверлеев секций
Эффект практически незаметен визуально, но заставляет GPU композировать каждый пиксель.

**Файлы:**
- `sections/ArtistsSection.tsx` строка 82: убрать `backdrop-blur-[1px]`
- `sections/EcosystemSection.tsx` строка 76: убрать `backdrop-blur-[1px]`
- `components/SectionFrame.tsx` строка 35: убрать `backdrop-blur-[1px]`

Заменить `bg-black/35 backdrop-blur-[1px]` → `bg-black/40` — чуть увеличить непрозрачность для компенсации.

#### 3b. Троттлинг `CursorAtmosphere`
**Файл:** `components/CursorAtmosphere.tsx`

Добавить `requestAnimationFrame`-троттлинг:
```tsx
let rafId = 0;
const update = (event: PointerEvent) => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    document.documentElement.style.setProperty("--cursor-x", ...);
    document.documentElement.style.setProperty("--cursor-y", ...);
  });
};
```

#### 3c. Троттлинг `ScrollBackground`
**Файл:** `components/ScrollBackground.tsx`

Обернуть обновление в `requestAnimationFrame`:
```tsx
let rafId = 0;
const unsubscribe = scrollYProgress.on("change", (v) => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  });
});
```

#### 3d. Vanta.js — оставить как есть
Vanta.js TRUNK отображается одинаково на мобильных и десктопе — по запросу пользователя изменений нет. Эффект уже использует `scaleMobile: 1.0`.

#### 3e. Убрать `priority` с изображений нижних секций
**Файлы:**
- `sections/EcosystemSection.tsx` строка 73: убрать `priority`
- `components/SectionFrame.tsx` строка 33: убрать `priority` — используется для Live, Projects, Contacts

Оставить `priority` только на HeroSection и ArtistsSection — они выше фолда.

#### 3f. Оптимизация анимаций артистов
**Файл:** `sections/ArtistsSection.tsx`

Заменить бесконечные `y`/`rotateZ` анимации на CSS-анимации с `will-change`:
- Убрать `animate` с `repeat: Infinity` из framer-motion
- Добавить CSS-класс с `@keyframes float` и `animation-fill-mode: both`
- Это перенесёт анимации на compositor thread, освободив main thread

---

## Порядок выполнения

1. Исправить z-index Header и body::before — самый быстрый и заметный фикс
2. Убрать backdrop-blur-[1px] со всех секций — сразу улучшит производительность
3. Переписать позиционирование артистов на алгоритмическое
4. Добавить троттлинг в CursorAtmosphere и ScrollBackground
5. Оптимизировать Vanta.js на мобильных
6. Убрать лишние priority с изображений
7. Заменить framer-motion бесконечные анимации на CSS-анимации
