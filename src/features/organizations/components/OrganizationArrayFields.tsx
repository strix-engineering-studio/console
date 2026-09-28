"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { OrganizationInput } from "../schemas";

const fields: Array<{
  name: keyof Pick<
    OrganizationInput,
    | "aliases"
    | "products"
    | "services"
    | "technologies"
    | "targetMarkets"
    | "hiringSignals"
    | "growthSignals"
    | "technologySignals"
    | "painPoints"
    | "opportunitySignals"
    | "tags"
  >;
  label: string;
}> = [
  { name: "aliases", label: "Other names" },
  { name: "products", label: "Products" },
  { name: "services", label: "Services" },
  { name: "technologies", label: "Technologies" },
  { name: "targetMarkets", label: "Target markets" },
  { name: "hiringSignals", label: "Hiring signals" },
  { name: "growthSignals", label: "Growth signals" },
  { name: "technologySignals", label: "Technology signals" },
  { name: "painPoints", label: "Pain points" },
  { name: "opportunitySignals", label: "Opportunity signals" },
  { name: "tags", label: "Tags" },
];

export function OrganizationArrayFields() {
  const { control } = useFormContext<OrganizationInput>();
  return (
    <>
      {fields.map(({ name, label }) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <label className="text-sm">
              {label}
              <textarea
                value={(field.value ?? []).join(", ")}
                onChange={(event) =>
                  field.onChange(
                    event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
                onBlur={field.onBlur}
                ref={field.ref}
                rows={2}
                placeholder="Separate items with commas"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
              />
            </label>
          )}
        />
      ))}
    </>
  );
}

function toLocalDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export function OrganizationDateField({
  name,
  label,
}: {
  name: "lastFundingDate" | "discoveredAt";
  label: string;
}) {
  const { control } = useFormContext<OrganizationInput>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="text-sm">
          {label}
          <input
            type="datetime-local"
            value={toLocalDateTime(field.value)}
            onChange={(event) =>
              field.onChange(
                event.target.value
                  ? new Date(event.target.value).toISOString()
                  : null,
              )
            }
            onBlur={field.onBlur}
            ref={field.ref}
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
          />
        </label>
      )}
    />
  );
}
