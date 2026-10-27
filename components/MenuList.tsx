import type { MenuCategory } from "@/types/content";

interface MenuListProps {
  menu: MenuCategory[];
}

/** Меню бара: категории → позиции (название, описание, цена). */
export function MenuList({ menu }: MenuListProps) {
  const categories = [...menu].sort((a, b) => a.order - b.order);
  if (categories.length === 0) return null;

  return (
    <div className="mt-10 space-y-10 sm:mt-14">
      {categories.map((category) => {
        const items = [...category.items].sort((a, b) => a.order - b.order);
        return (
          <div key={category.id}>
            <h3 className="font-bebas text-2xl uppercase tracking-wide text-stone-100 sm:text-3xl">
              {category.title}
            </h3>
            <div className="mt-4 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {items.map((item) => (
                <div key={item.id} className="border-b border-white/8 pb-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-100">
                      {item.name}
                    </p>
                    <span className="shrink-0 text-sm text-stone-300/70">
                      {item.price}
                    </span>
                  </div>
                  {item.description ? (
                    <p className="mt-1 text-xs leading-5 text-stone-400/70">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}