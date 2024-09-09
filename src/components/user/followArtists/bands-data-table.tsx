"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  VisibilityState,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useWindowSize from "@/lib/hooks/get-window-size";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  favorites: Record<string, boolean>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  favorites,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState(favorites);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const size = useWindowSize();

  useEffect(() => {
    const columns = getColumnVisibilityBySize(size.width);
    console.log("size width: ", size.width);
    setColumnVisibility(columns);
  }, [size.width]);

  useEffect(() => {
    setRowSelection(favorites);
  }, [favorites]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter bands..."
          value={
            (table.getColumn("namePretty")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("namePretty")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-black text-white"
        />        
      </div>
      <div className="rounded-md border text-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={row.getIsSelected() ? "bg-gray-800" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

const getColumnVisibilityBySize = (width: number) => {
  switch (true) {
    case width > 1000:
      return {
        namePretty: true,
        country: true,
        genreTags: true,
        followers: true,
        status: true,
      };
    case width <= 1000 && width > 800:
      return {
        namePretty: true,
        country: true,
        genreTags: true,
        followers: true,
        status: false,
      };
    case width <= 800 && width > 600:
      return {
        namePretty: true,
        country: true,
        genreTags: true,
        followers: false,
        status: false,
      };
    case width <= 600 && width > 400:
      return {
        namePretty: true,
        country: true,
        genreTags: false,
        followers: false,
        status: false,
      };
    case width <= 400 && width > 320:
      return {
        namePretty: true,
        country: false,
        genreTags: false,
        followers: false,
        status: false,
      };
    default:
      return {
        namePretty: true,
        country: false,
        genreTags: false,
        followers: false,
        status: false,
      };
  }
};
