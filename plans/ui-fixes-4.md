# UI Fixes — 4 правки

## Правка 1: Footer — увеличить и отделить от ContactsSection

**Файл:** `components/PageShell.tsx` (строка 41)

**Текущее:**
```html
<footer className="border-t border-white/8 bg-[#080706] py-3 text-center">
  <p className="text-[0.65rem] tracking-[0.2em] uppercase text-stone-400/50">
    © {new Date().getFullYear()} RAAM — Room All About Music
  </p>
</footer>
```

**Изменить на:**
- `py-3` → `py-8 sm:py-10`
- `text-[0.65rem]` → `text-xs`
- `border-white/8` → `border-white/5`
- Добавить `mt-8` для отделения от ContactsSection

---

## Правка 2: ContactsSection — flyout при ховере в десктопе

**Файл:** `sections/ContactsSection.tsx`

**Логика:**
- Десктоп (`lg:`): показывать только Book-панель на полную ширину
- Добавить триггер-кнопку в Book-панели для показа Contact
- При ховере на триггер — Contact-панель выезжает справа как flyout (абсолютный блок, анимация translate-x)
- Мобильный: оставить текущее поведение с табами без изменений

**Ключевые изменения:**
- Обернуть Contact-контент в абсолютно позиционированный flyout-контейнер
- Добавить состояние `isContactHovered` или CSS `group-hover`
- Показать триггер-кнопку в Book-панели только на `lg:`
- Flyout появляется с `translate-x` анимацией

---

## Правка 3: ArtistModal — перенос буквы в имени Farik Interlude

**Файл:** `components/ArtistModal.tsx` (строка 130)

**Текущий класс h3:**
```
mt-3 text-3xl font-semibold uppercase leading-[0.86] tracking-normal text-white text-balance break-words sm:mt-5 sm:text-5xl lg:text-6xl
```

**Изменить на:**
```
mt-3 text-3xl font-semibold uppercase leading-[0.86] tracking-normal text-white text-balance sm:mt-5 sm:text-5xl lg:text-6xl lg:tracking-tight
```

- Убрать `break-words` — слово INTERLUDE будет переноситься целиком
- Добавить `lg:tracking-tight` — лёгкое уплотнение на десктопе

---

## Правка 4: Logo3D — уменьшить размер на мобильном (вариант A)

**Файл:** `components/Logo3D.tsx` (строка 83)

**Текущий класс Image:**
```
h-40 w-auto max-w-full sm:h-64 lg:h-80
```

**Изменить на:**
```
h-32 w-auto max-w-full sm:h-64 lg:h-80
```

- `h-40` → `h-32` (160px → 128px на мобильном)
