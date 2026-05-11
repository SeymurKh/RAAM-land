# План правок: Hero-кнопки, Header-навигация и 3D-логотип

## Анализ текущего состояния

### 1. Hero-кнопки (`sections/HeroSection.tsx`)

```tsx
<FluidButton href="#artists">Artists</FluidButton>
<FluidButton href="#projects" className="bg-black/20">Projects</FluidButton>
```

Обе кнопки используют один и тот же компонент `FluidButton` с одинаковым `baseClass`:
- `min-h-12` — одинаковая минимальная высота
- `px-6` — одинаковый горизонтальный padding
- `text-sm` — одинаковый размер шрифта

**Проблема:** Визуально кнопки могут отличаться из-за разной ширины текста ("Artists" vs "Projects"). `bg-black/20` у Projects не влияет на размер. Поскольку `FluidButton` — это `inline-flex`, ширина подстраивается под контент. Чтобы сделать их одинаковой ширины, нужно задать `min-width` или `flex-1`.

**Решение:** Добавить `min-w-[160px]` или `w-full` + `max-w-[180px]` обеим кнопкам, чтобы они были одинаковой ширины, равной ширине кнопки "Projects" (которая чуть шире из-за букв).

---

### 2. Header-навигация (`components/Header.tsx`)

```tsx
<div className="hidden items-center gap-9 md:flex">
  {navItems.map((item) => (
    <a
      key={item.href}
      href={item.href}
      className="text-xs uppercase tracking-[0.32em] text-stone-200/62 transition hover:text-stone-50"
    >
      {item.label}
    </a>
  ))}
</div>
```

Сейчас это обычные `<a>` ссылки, а не кнопки. Пользователь хочет, чтобы они были кнопками одного размера, равного размеру кнопки "Artists" из Hero.

**Проблема:** Текст "Contact Us" длиннее "Artists", "Live", "Projects". Нужно сделать все кнопки одинаковой ширины.

**Решение:** Заменить `<a>` на `FluidButton` (компонент уже существует и используется в Hero). Добавить `min-w-[120px]` или `w-full` + `max-w-[140px]` для единого размера. Либо использовать `FluidButton` напрямую с одинаковым `className`.

---

### 3. Hero-логотип 3D с анимацией при наведении (`sections/HeroSection.tsx`)

```tsx
<Image
  src="/assets/images/logo.png"
  alt="RAAM"
  width={800}
  height={340}
  sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
  className="h-48 w-auto sm:h-64 lg:h-80"
  priority
/>
```

Сейчас логотип — статичное изображение. Нужно сделать 3D-эффект с анимацией при движении курсора.

**Решение:** Использовать Framer Motion + CSS `transform-style: preserve-3d` + `perspective`. При движении мыши логотип наклоняется (tilt) по осям X/Y, создавая иллюзию 3D-объёма. Дополнительно — мягкое свечение/тень, реагирующее на положение курсора.

**Техническая реализация:**
- Оборачиваем логотип в `motion.div` с `perspective(800px)`
- Отслеживаем `pointermove` внутри контейнера логотипа
- Вычисляем rotateX/rotateY на основе положения курсора относительно центра логотипа
- Добавляем `transform-style: preserve-3d` для дочерних элементов
- Плавный выход анимации при убирании курсора (mouseleave → rotate к 0)

---

## Детальный план реализации

### Задача 1: Hero-кнопки одинакового размера

**Файл:** `sections/HeroSection.tsx`

**Изменения:**
- Добавить обеим кнопкам `FluidButton` одинаковый `className` с фиксированной минимальной шириной:
  ```tsx
  <FluidButton href="#artists" className="min-w-[160px]">Artists</FluidButton>
  <FluidButton href="#projects" className="min-w-[160px] bg-black/20">Projects</FluidButton>
  ```
- Значение `min-w-[160px]` подобрать так, чтобы обе кнопки были равны ширине "Projects" (самой широкой).

---

### Задача 2: Header-кнопки одинакового размера

**Файл:** `components/Header.tsx`

**Изменения:**
- Заменить `<a>` на `FluidButton` в десктопной навигации (строка 73-81)
- Установить одинаковый размер через `className`:
  ```tsx
  <FluidButton href={item.href} className="min-w-[120px] text-center">
    {item.label}
  </FluidButton>
  ```
- Убрать лишние стили (tracking, text-xs и т.д.), так как `FluidButton` уже имеет свои стили
- **Важно:** `FluidButton` имеет `text-sm` и `tracking-[0.2em]`, что может отличаться от текущего `text-xs` и `tracking-[0.32em]`. Нужно согласовать с пользователем, оставить стили `FluidButton` или кастомизировать.

---

### Задача 3: 3D-логотип с hover-анимацией

**Новый файл:** `components/Logo3D.tsx` (выделенный клиентский компонент)

**Изменения в `sections/HeroSection.tsx`:**
- Импортировать и использовать `Logo3D` вместо прямого `<Image>` для логотипа

**Компонент `Logo3D.tsx`:**
```tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function Logo3D() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);

  function handlePointerMove(e: React.PointerEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2); // -1 to 1
    const y = (e.clientY - centerY) / (rect.height / 2); // -1 to 1
    setRotateY(x * 15); // max 15deg
    setRotateX(-y * 15);
    setGlowX((e.clientX - rect.left) / rect.width * 100);
    setGlowY((e.clientY - rect.top) / rect.height * 100);
  }

  function handlePointerLeave() {
    setRotateX(0);
    setRotateY(0);
    setGlowX(50);
    setGlowY(50);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        perspective: "800px",
        transformStyle: "preserve-3d",
      }}
      className="relative"
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <Image
          src="/assets/images/logo.png"
          alt="RAAM"
          width={800}
          height={340}
          sizes="(min-width: 1024px) 753px, (min-width: 640px) 602px, 452px"
          className="h-48 w-auto sm:h-64 lg:h-80"
          priority
          style={{
            filter: `drop-shadow(0 ${20 + Math.abs(rotateY) * 2}px ${30 + Math.abs(rotateY) * 3}px rgba(0,0,0,0.6))`,
          }}
        />
        {/* Блик, следующий за курсором */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.12), transparent 60%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
```

---

## Файлы для изменений

| Файл | Действие |
|------|----------|
| `sections/HeroSection.tsx` | Изменить className кнопок + заменить логотип на Logo3D |
| `components/Header.tsx` | Заменить `<a>` на `FluidButton` в десктопной навигации |
| `components/Logo3D.tsx` | **Создать** новый компонент с 3D-анимацией |

## Проверка

1. Hero-кнопки визуально одинаковой ширины
2. Header-кнопки визуально одинаковой ширины, равной ширине кнопки Artists
3. Логотип наклоняется при движении мыши, плавно возвращается при убирании курсора
4. Нет поломки existing функциональности (модалки, фото, админка)
5. `npm run build` проходит без ошибок