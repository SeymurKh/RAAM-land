"use client";

import { ListEditor } from "@/components/venue-form/ListEditor";
import type { CoachingSection, Course, CoursePrice } from "@/types/content";

interface CoachingEditorProps {
  coaching: CoachingSection;
  onChange: (coaching: CoachingSection) => void;
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-stone-100 outline-none transition focus:border-stone-100/35";
const smallLabelClass =
  "mb-1 block text-[0.65rem] uppercase tracking-[0.24em] text-stone-400/60";

/** Редактор секции Coaching: DJ-курсы и цены. */
export function CoachingEditor({ coaching, onChange }: CoachingEditorProps) {
  function updateCourse(index: number, patch: Partial<Course>) {
    const courses = [...coaching.courses];
    courses[index] = { ...courses[index], ...patch };
    onChange({ ...coaching, courses });
  }

  function updatePrice(
    courseIndex: number,
    priceIndex: number,
    patch: Partial<CoursePrice>,
  ) {
    const courses = [...coaching.courses];
    const prices = [...courses[courseIndex].prices];
    prices[priceIndex] = { ...prices[priceIndex], ...patch };
    courses[courseIndex] = { ...courses[courseIndex], prices };
    onChange({ ...coaching, courses });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={smallLabelClass}>Eyebrow</label>
          <input
            className={inputClass}
            value={coaching.eyebrow}
            onChange={(event) =>
              onChange({ ...coaching, eyebrow: event.target.value })
            }
          />
        </div>
        <div>
          <label className={smallLabelClass}>Title</label>
          <input
            className={inputClass}
            value={coaching.title}
            onChange={(event) =>
              onChange({ ...coaching, title: event.target.value })
            }
          />
        </div>
      </div>

      <ListEditor
        label="Description paragraphs"
        values={coaching.description}
        onChange={(description) => onChange({ ...coaching, description })}
        multiline
      />

      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-300/70">
          Courses
        </p>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...coaching,
              courses: [
                ...coaching.courses,
                {
                  id: "course-" + Date.now().toString(36),
                  title: "",
                  order: coaching.courses.length + 1,
                  prices: [],
                },
              ],
            })
          }
          className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
        >
          + Add course
        </button>
      </div>

      {coaching.courses.map((course, index) => (
        <div
          key={course.id}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/3 p-4"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className={smallLabelClass}>Course title</label>
              <input
                className={inputClass}
                value={course.title}
                onChange={(event) =>
                  updateCourse(index, { title: event.target.value })
                }
              />
            </div>
            <div className="flex-1">
              <label className={smallLabelClass}>Note</label>
              <input
                className={inputClass}
                value={course.note ?? ""}
                placeholder="8 lessons"
                onChange={(event) =>
                  updateCourse(index, { note: event.target.value })
                }
              />
            </div>
            <div className="w-20">
              <label className={smallLabelClass}>Order</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={course.order}
                onChange={(event) =>
                  updateCourse(index, { order: Number(event.target.value) })
                }
              />
            </div>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...coaching,
                  courses: coaching.courses.filter((_, i) => i !== index),
                })
              }
              className="h-11 rounded-xl px-3 text-red-400/70 transition hover:text-red-400"
            >
              Remove
            </button>
          </div>

          {course.prices.map((price, priceIndex) => (
            <div key={price.id} className="flex items-end gap-3 pl-2">
              <div className="flex-[2]">
                <input
                  className={inputClass}
                  value={price.label}
                  placeholder="Label (e.g. Individual)"
                  onChange={(event) =>
                    updatePrice(index, priceIndex, { label: event.target.value })
                  }
                />
              </div>
              <div className="w-32">
                <input
                  className={inputClass}
                  value={price.price}
                  placeholder="Price"
                  onChange={(event) =>
                    updatePrice(index, priceIndex, { price: event.target.value })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const courses = [...coaching.courses];
                  const prices = [...course.prices];
                  prices.splice(priceIndex, 1);
                  courses[index] = { ...course, prices };
                  onChange({ ...coaching, courses });
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
              updateCourse(index, {
                prices: [
                  ...course.prices,
                  {
                    id: "price-" + Date.now().toString(36),
                    label: "",
                    price: "",
                    order: course.prices.length + 1,
                  },
                ],
              })
            }
            className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
          >
            + Add price
          </button>
        </div>
      ))}
    </div>
  );
}
