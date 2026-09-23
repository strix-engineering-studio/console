import type { Table } from "@tanstack/react-table";
import { Filter } from "lucide-react";

import { buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface DataTableFilter {
  key: string;
  label: string;
  placeholder?: string;
  options: {
    label: string;
    value: string;
  }[];
}

interface FilterDropdownProps<TData> {
  table: Table<TData>;
  filters: DataTableFilter[];
}

export function FilterDropdown<TData>({
  table,
  filters,
}: FilterDropdownProps<TData>) {
  const getFilterColumn = (key: string) =>
    table.getAllLeafColumns().find((column) => column.id === key);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={buttonVariants({ variant: "outline" })}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </button>
        }
      />

      <DropdownMenuContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="mb-2 block text-sm font-medium">
                {filter.label}
              </label>

              <Select
                value={
                  (getFilterColumn(filter.key)?.getFilterValue() as string) ??
                  ""
                }
                onValueChange={(value) =>
                  getFilterColumn(filter.key)?.setFilterValue(
                    value === "ALL" ? undefined : value,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={filter.placeholder ?? filter.label}
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>

                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
