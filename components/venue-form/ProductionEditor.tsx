"use client";

import { ListEditor } from "@/components/venue-form/ListEditor";
import type {
  ProductionPackage,
  ProductionSection,
  ServiceGroup,
  ServiceItem,
} from "@/types/content";

interface ProductionEditorProps {
  production: ProductionSection;
  onChange: (production: ProductionSection) => void;
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-stone-100 outline-none transition focus:border-stone-100/35";
const smallLabelClass =
  "mb-1 block text-[0.65rem] uppercase tracking-[0.24em] text-stone-400/60";

/** Редактор секции Production: пакеты и прайс-лист услуг. */
export function ProductionEditor({ production, onChange }: ProductionEditorProps) {
  function updatePackage(index: number, patch: Partial<ProductionPackage>) {
    const packages = [...production.packages];
    packages[index] = { ...packages[index], ...patch };
    onChange({ ...production, packages });
  }

  function updateGroup(index: number, patch: Partial<ServiceGroup>) {
    const services = [...production.services];
    services[index] = { ...services[index], ...patch };
    onChange({ ...production, services });
  }

  function updateItem(
    groupIndex: number,
    itemIndex: number,
    patch: Partial<ServiceItem>,
  ) {
    const services = [...production.services];
    const items = [...services[groupIndex].items];
    items[itemIndex] = { ...items[itemIndex], ...patch };
    services[groupIndex] = { ...services[groupIndex], items };
    onChange({ ...production, services });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={smallLabelClass}>Eyebrow</label>
          <input
            className={inputClass}
            value={production.eyebrow}
            onChange={(event) =>
              onChange({ ...production, eyebrow: event.target.value })
            }
          />
        </div>
        <div>
          <label className={smallLabelClass}>Title</label>
          <input
            className={inputClass}
            value={production.title}
            onChange={(event) =>
              onChange({ ...production, title: event.target.value })
            }
          />
        </div>
      </div>

      <ListEditor
        label="Description paragraphs"
        values={production.description}
        onChange={(description) => onChange({ ...production, description })}
        multiline
      />

      <div>
        <label className={smallLabelClass}>Services list title</label>
        <input
          className={inputClass}
          value={production.servicesTitle}
          onChange={(event) =>
            onChange({ ...production, servicesTitle: event.target.value })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-300/70">
          Packages
        </p>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...production,
              packages: [
                ...production.packages,
                {
                  id: "pkg-" + Date.now().toString(36),
                  title: "",
                  bullets: [],
                  order: production.packages.length + 1,
                },
              ],
            })
          }
          className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
        >
          + Add package
        </button>
      </div>

      {production.packages.map((pkg, index) => (
        <div
          key={pkg.id}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/3 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className={smallLabelClass}>Title</label>
              <input
                className={inputClass}
                value={pkg.title}
                onChange={(event) =>
                  updatePackage(index, { title: event.target.value })
                }
              />
            </div>
            <div>
              <label className={smallLabelClass}>Label</label>
              <input
                className={inputClass}
                value={pkg.label ?? ""}
                onChange={(event) =>
                  updatePackage(index, { label: event.target.value })
                }
              />
            </div>
            <div>
              <label className={smallLabelClass}>Tagline</label>
              <input
                className={inputClass}
                value={pkg.tagline ?? ""}
                onChange={(event) =>
                  updatePackage(index, { tagline: event.target.value })
                }
              />
            </div>
            <div>
              <label className={smallLabelClass}>Price (empty = Custom)</label>
              <input
                className={inputClass}
                value={pkg.price ?? ""}
                onChange={(event) =>
                  updatePackage(index, { price: event.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={smallLabelClass}>Description</label>
              <input
                className={inputClass}
                value={pkg.description ?? ""}
                onChange={(event) =>
                  updatePackage(index, { description: event.target.value })
                }
              />
            </div>
            <div>
              <label className={smallLabelClass}>Result line</label>
              <input
                className={inputClass}
                value={pkg.result ?? ""}
                onChange={(event) =>
                  updatePackage(index, { result: event.target.value })
                }
              />
            </div>
          </div>
          <ListEditor
            label="Bullets"
            values={pkg.bullets}
            onChange={(bullets) => updatePackage(index, { bullets })}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.24em] text-stone-400/60">
              Order
              <input
                type="number"
                min={0}
                className={inputClass + " max-w-20"}
                value={pkg.order}
                onChange={(event) =>
                  updatePackage(index, { order: Number(event.target.value) })
                }
              />
            </label>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...production,
                  packages: production.packages.filter((_, i) => i !== index),
                })
              }
              className="text-xs uppercase tracking-[0.2em] text-red-400/70 hover:text-red-400"
            >
              Remove package
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-300/70">
          Service groups
        </p>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...production,
              services: [
                ...production.services,
                {
                  id: "grp-" + Date.now().toString(36),
                  title: "",
                  order: production.services.length + 1,
                  items: [],
                },
              ],
            })
          }
          className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
        >
          + Add group
        </button>
      </div>

      {production.services.map((group, groupIndex) => (
        <div
          key={group.id}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/3 p-4"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className={smallLabelClass}>Group title</label>
              <input
                className={inputClass}
                value={group.title}
                onChange={(event) =>
                  updateGroup(groupIndex, { title: event.target.value })
                }
              />
            </div>
            <div className="w-20">
              <label className={smallLabelClass}>Order</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={group.order}
                onChange={(event) =>
                  updateGroup(groupIndex, { order: Number(event.target.value) })
                }
              />
            </div>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...production,
                  services: production.services.filter(
                    (_, i) => i !== groupIndex,
                  ),
                })
              }
              className="h-11 rounded-xl px-3 text-red-400/70 transition hover:text-red-400"
            >
              Remove
            </button>
          </div>

          {group.items.map((item, itemIndex) => (
            <div key={item.id} className="flex items-end gap-3 pl-2">
              <div className="flex-1">
                <input
                  className={inputClass}
                  value={item.name}
                  placeholder="Name"
                  onChange={(event) =>
                    updateItem(groupIndex, itemIndex, {
                      name: event.target.value,
                    })
                  }
                />
              </div>
              <div className="w-32">
                <input
                  className={inputClass}
                  value={item.price}
                  placeholder="Price"
                  onChange={(event) =>
                    updateItem(groupIndex, itemIndex, {
                      price: event.target.value,
                    })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const services = [...production.services];
                  const items = [...group.items];
                  items.splice(itemIndex, 1);
                  services[groupIndex] = { ...group, items };
                  onChange({ ...production, services });
                }}
                className="h-11 rounded-xl px-2 text-red-400/70 transition hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              updateGroup(groupIndex, {
                items: [
                  ...group.items,
                  {
                    id: "svc-" + Date.now().toString(36),
                    name: "",
                    price: "",
                    order: group.items.length + 1,
                  },
                ],
              })
            }
            className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
          >
            + Add item
          </button>
        </div>
      ))}
    </div>
  );
}
