"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";
import type { ZodType } from "zod";

type Props<T extends FieldValues> = {
  schema: ZodType<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  className?: string;
  formOptions?: Omit<UseFormProps<T>, "resolver" | "defaultValues">;
};

export function FormWrapper<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  formOptions,
}: Props<T>) {
  const form = useForm<T>({
    ...formOptions,
    defaultValues,
    resolver: zodResolver(schema as never) as Resolver<T>,
  });
  const flattenErrors = (value: unknown, path = ""): string[] => {
    if (!value || typeof value !== "object") return [];
    const record = value as Record<string, unknown>;
    if ("message" in record && typeof record.message === "string")
      return [`${path || "form"} → ${record.message}`];
    return Object.entries(record).flatMap(([key, child]) =>
      flattenErrors(child, path ? `${path}.${key}` : key),
    );
  };
  const errors = flattenErrors(form.formState.errors);
  const errorPaths = errors.map((error) => error.split(" → ")[0]);
  return (
    <FormProvider {...form}>
      <form
        className={className}
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {children}
        {Object.keys(form.formState.errors).length > 0 && (
          <p role="alert" className="text-sm text-destructive">
            Please correct the highlighted fields.
          </p>
        )}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-3 rounded border p-3 text-xs text-muted-foreground">
            <summary>Form diagnostics</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {JSON.stringify(
                {
                  values: form.getValues(),
                  errors,
                  fieldPaths: errorPaths,
                  dirtyFields: form.formState.dirtyFields,
                  touchedFields: form.formState.touchedFields,
                  submitCount: form.formState.submitCount,
                  isSubmitting: form.formState.isSubmitting,
                },
                null,
                2,
              )}
            </pre>
          </details>
        )}
      </form>
    </FormProvider>
  );
}
