1. EcosystemSection — удалить фоновую картинку

Убрать <Image src="/assets/images/artists.png"> и оверлей bg-black/40 (строки 67-75)
Удалить файл public/assets/images/artists.png

2. VantaBackground — хаос от скорости скролла

При скролле chaos увеличивается с 3.2 → ~7-8 пропорционально скорости
При остановке скролла — spring-возврат к базовому значению 3.2
Уже есть prefers-reduced-motion проверка и effectRef

3. SectionFrame — секции на полный экран

Добавить min-h-screen в SectionFrame
EcosystemSection НЕ использует SectionFrame — она остаётся как есть (половина страницы)

4. Artists — уменьшить шрифты + лёгкий ховер

Мобильный: clamp(2.45rem, 10vw, 4.8rem) → меньше
Десктоп: clamp(4.8rem, 8vw, 8.2rem) → меньше
Hover scale: 1.1 → 1.05

5. Instagram SVG — заменить на outline-only

Создать /brand_logo/instagram.svg (только контур, без круга-фона)
Обновить маппинг в BrandSocialIcon.tsx (instagram-circle.svg → instagram.svg)
Удалить instagram-circle.svg
Проблема: invert на SVG с серым кругом-фоном = белый blob

6. Projects — стандартизировать внутренний layout карточки

Фиксированная зона изображения с aspect-ratio (4/3)
line-clamp для title и description
mt-auto для кнопок
Добавить поле image?: string в тип Project
Добавить загрузку изображения в ProjectForm
Все карточки идентичной структуры (не контент, а каркас)

7. ❌ ПРОПУЩЕН — YouTube playlist (оставляем как есть)

8. Artists — миграция с absolute на CSS Grid/Flexbox

Убрать getArtistPosition() и абсолютное позиционирование
Перейти на CSS Grid — артисты не залезают друг на друга
Авто-масштабирование размера шрифта в зависимости от количества артистов

