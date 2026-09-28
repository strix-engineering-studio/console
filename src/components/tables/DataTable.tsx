import React, { useState } from "react";

import {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Spinner } from "@/components/ui/spinner";

import { DataTableToolbar, DataTableFilter } from "./DataTableToolbar";

import { DataTablePagination } from "./DataTablePagination";

import { DataTableSortIcon } from "./DataTableSortIcon";

import { DataTableProps } from "@/types/datatable.types";
import { Database } from "lucide-react";

export function DataTable<TData, TValue>({
  columns,
  data,

  loading = false,

  // Search
  search,
  searchKey,
  onSearchChange,
  searchPlaceholder = "Search...",
  manualSearch = false,

  // Search validation
  searchMaxLength,
  searchPattern,

  // Sorting
  sorting,
  onSortingChange,
  manualSorting = false,

  // Filtering
  filters,
  onFiltersChange,
  manualFiltering = false,

  // Pagination
  pagination,
  onPaginationChange,
  manualPagination = false,

  totalRows,
  pageCount,

  // Column visibility
  columnVisibility,
  onColumnVisibilityChange,

  // Row selection
  rowSelection,
  onRowSelectionChange,

  // Features
  enableSearch = true,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableColumnVisibility = true,
  enableRowSelection = false,

  enableExportExcel = false,
  enableRefresh = false,

  onExportExcel,
  onRefresh,

  toolbar,

  /**
   * Filter dropdown configuration.
   *
   * These filters are rendered by the toolbar
   * inside the Filters button.
   */
  filterOptions = [],

  emptyIcon = <Database />,
  emptyMessage = "No records found.",

  onRowClick,
}: DataTableProps<TData, TValue> & {
  filterOptions?: DataTableFilter[];

  /**
   * Optional search validation.
   *
   * If omitted, the search input behaves
   * exactly as before.
   */
  searchMaxLength?: number;
  searchPattern?: RegExp;
}) {
  /*
   * -------------------------------------------------------
   * Internal state
   * -------------------------------------------------------
   */

  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  const [internalFilters, setInternalFilters] = useState<ColumnFiltersState>(
    [],
  );

  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: pagination?.pageSize ?? 10,
    },
  );

  const [internalVisibility, setInternalVisibility] = useState<VisibilityState>(
    {},
  );

  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});

  /*
   * -------------------------------------------------------
   * Controlled / uncontrolled state
   * -------------------------------------------------------
   */

  const sortingState = sorting ?? internalSorting;

  const filterState = filters ?? internalFilters;

  const paginationState = pagination ?? internalPagination;

  const visibilityState = columnVisibility ?? internalVisibility;

  const rowSelectionState = rowSelection ?? internalRowSelection;

  /*
   * -------------------------------------------------------
   * React Table
   * -------------------------------------------------------
   */

  const table = useReactTable({
    data,
    columns,

    getCoreRowModel: getCoreRowModel(),

    /*
     * Client-side sorting is only enabled when
     * manualSorting is false.
     */
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),

    /*
     * Client-side filtering is only enabled when
     * manualFiltering is false.
     */
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),

    /*
     * Client-side pagination is only enabled when
     * manualPagination is false.
     */
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),

    manualSorting,
    manualFiltering,
    manualPagination,

    /*
     * Prevent React Table from automatically resetting
     * the page index when data/filter/sort changes.
     *
     * This is particularly useful for server-side pagination.
     */
    autoResetPageIndex: false,

    /*
     * Required for manual/server-side pagination.
     */
    pageCount: manualPagination ? pageCount : undefined,

    state: {
      sorting: sortingState,
      columnFilters: filterState,
      pagination: paginationState,
      columnVisibility: visibilityState,
      rowSelection: rowSelectionState,
    },

    /*
     * Sorting
     */
    onSortingChange: onSortingChange ?? setInternalSorting,

    /*
     * Filtering
     */
    onColumnFiltersChange: onFiltersChange ?? setInternalFilters,

    /*
     * Pagination
     */
    onPaginationChange: onPaginationChange ?? setInternalPagination,

    /*
     * Column visibility
     */
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalVisibility,

    /*
     * Row selection
     */
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,

    enableRowSelection,
  });

  /*
   * -------------------------------------------------------
   * Loading state
   * -------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Render
   * -------------------------------------------------------
   */

  return (
    <div>
      <DataTableToolbar
        table={table}
        toolbar={toolbar}

        enableSearch={enableSearch}

        search={search}
        searchKey={searchKey}
        manualSearch={manualSearch}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}

        /*
         * Search validation
         */
        searchMaxLength={searchMaxLength}
        searchPattern={searchPattern}

        enableFiltering={enableFiltering}
        filterOptions={filterOptions}

        enableExportCSV={true}
      />

      <div className="bg-card my-5 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = enableSorting && header.column.getCanSort();

                  return (
                    <TableHead
                      key={header.id}
                      className={canSort ? "cursor-pointer select-none" : ""}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}

                          {header.column.getCanSort() && (
                            <DataTableSortIcon
                              direction={header.column.getIsSorted()}
                            />
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  className={
                    onRowClick ? "hover:bg-muted/50 cursor-pointer" : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-32 text-center"
                >
                  {emptyIcon && (
                    <div className="text-muted-foreground flex justify-center p-2 text-center">
                      {emptyIcon}
                    </div>
                  )}
                  <p className="text-muted-foreground text-sm">
                    {emptyMessage}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && (
        <DataTablePagination
          table={table}
          manualPagination={manualPagination}
          totalRows={totalRows}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  );
}
