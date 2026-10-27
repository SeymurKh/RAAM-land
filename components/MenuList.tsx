import type { MenuCategory, MenuItem } from "@/types/content";

interface MenuListProps {
  menu: MenuCategory[];
}

/** Хвост вида «(330 ml)» в названии — мелким серым курсивом, как в макете. */
function ItemName({ name }: { name: string }) {
  const match = name.match(/^(.*?)\s*(\([^)]*\))$/);
  if (!match) return <>{name}</>;
  return (
    <>
      {match[1]}{" "}
      <span className="text-xs italic text-stone-500">{match[2]}</span>
    </>
  );
}

/** Строка меню: «· Название … цена», состав — серым курсивом под строкой. */
function MenuRow({ item }: { item: MenuItem }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[0.95rem] leading-6 text-stone-100">
          <span className="text-stone-400">· </span>
          <ItemName name={item.name} />
        </span>
        <span className="shrink-0 text-[0.95rem] leading-6 text-stone-200/80">
          … {item.price}
        </span>
      </div>
      {item.description ? (
        <p className="mt-0.5 text-sm italic leading-5 text-stone-500">
          ({item.description})
        </p>
      ) : null}
    </div>
  );
}

/** Категория меню: красный заголовок либо белый текст на красной плашке (banner). */
function MenuCategoryBlock({ category }: { category: MenuCategory }) {
  const items = [...category.items].sort((a, b) => a.order - b.order);
  return (
    <div>
      <h3
        className={
          category.banner
            ? "bg-[#E82919] px-4 py-2 font-bebas text-2xl uppercase tracking-wide text-white"
            : "font-bebas text-2xl uppercase tracking-wide text-[#E82919]"
        }
      >
        {category.title}
      </h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <MenuRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

/** Меню бара: слева барные категории, справа — с красными баннерами (коктейли). */
export function MenuList({ menu }: MenuListProps) {
  const categories = [...menu].sort((a, b) => a.order - b.order);
  if (categories.length === 0) return null;

  const left = categories.filter((category) => !category.banner);
  const right = categories.filter((category) => category.banner);

  return (
    <div className="mt-10 grid gap-x-14 gap-y-8 sm:mt-14 lg:grid-cols-2">
      <div className="space-y-8">
        {left.map((category) => (
          <MenuCategoryBlock key={category.id} category={category} />
        ))}
      </div>
      {right.length > 0 ? (
        <div className="space-y-8">
          {right.map((category) => (
            <MenuCategoryBlock key={category.id} category={category} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
