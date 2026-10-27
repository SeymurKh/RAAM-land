"use client";

import type { MenuCategory, MenuItem } from "@/types/content";

interface MenuEditorProps {
  menu: MenuCategory[];
  onChange: (menu: MenuCategory[]) => void;
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-stone-100 outline-none transition focus:border-stone-100/35";

/** Редактор меню бара: категории → позиции (название, описание, цена). */
export function MenuEditor({ menu, onChange }: MenuEditorProps) {
  function updateCategory(index: number, patch: Partial<MenuCategory>) {
    const next = [...menu];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function updateItem(
    categoryIndex: number,
    itemIndex: number,
    patch: Partial<MenuItem>,
  ) {
    const next = [...menu];
    const items = [...next[categoryIndex].items];
    items[itemIndex] = { ...items[itemIndex], ...patch };
    next[categoryIndex] = { ...next[categoryIndex], items };
    onChange(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="mb-0 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
          Menu
        </label>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...menu,
              {
                id: `category-${Date.now()}`,
                title: "",
                order: menu.length + 1,
                items: [],
              },
            ])
          }
          className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
        >
          + Add category
        </button>
      </div>

      {menu.map((category, categoryIndex) => (
        <div
          key={category.id}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/3 p-4"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.24em] text-stone-400/60">
                Category title
              </label>
              <input
                className={inputClass}
                value={category.title}
                onChange={(event) =>
                  updateCategory(categoryIndex, { title: event.target.value })
                }
                placeholder="Cocktails"
              />
            </div>
            <div className="w-20">
              <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.24em] text-stone-400/60">
                Order
              </label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={category.order}
                onChange={(event) =>
                  updateCategory(categoryIndex, {
                    order: Number(event.target.value),
                  })
                }
              />
            </div>
            <button
              type="button"
              onClick={() =>
                onChange(menu.filter((_, i) => i !== categoryIndex))
              }
              className="h-11 rounded-xl px-3 text-red-400/70 transition hover:text-red-400"
            >
              Remove
            </button>
          </div>

          {category.items.map((item, itemIndex) => (
            <div key={item.id} className="flex items-end gap-3 pl-2">
              <div className="flex-1">
                <input
                  className={inputClass}
                  value={item.name}
                  placeholder="Name"
                  onChange={(event) =>
                    updateItem(categoryIndex, itemIndex, {
                      name: event.target.value,
                    })
                  }
                />
              </div>
              <div className="hidden flex-[2] sm:block">
                <input
                  className={inputClass}
                  value={item.description ?? ""}
                  placeholder="Description (optional)"
                  onChange={(event) =>
                    updateItem(categoryIndex, itemIndex, {
                      description: event.target.value,
                    })
                  }
                />
              </div>
              <div className="w-28">
                <input
                  className={inputClass}
                  value={item.price}
                  placeholder="Price"
                  onChange={(event) =>
                    updateItem(categoryIndex, itemIndex, {
                      price: event.target.value,
                    })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = [...menu];
                  const items = [...next[categoryIndex].items];
                  items.splice(itemIndex, 1);
                  next[categoryIndex] = { ...next[categoryIndex], items };
                  onChange(next);
                }}
                className="h-11 rounded-xl px-2 text-red-400/70 transition hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const next = [...menu];
              next[categoryIndex] = {
                ...next[categoryIndex],
                items: [
                  ...next[categoryIndex].items,
                  {
                    id: `item-${Date.now()}`,
                    name: "",
                    price: "",
                    order: next[categoryIndex].items.length + 1,
                  },
                ],
              };
              onChange(next);
            }}
            className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
          >
            + Add item
          </button>
        </div>
      ))}
    </div>
  );
}