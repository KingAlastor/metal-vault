"use client";

import { useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  VisibilityState,
  getFilteredRowModel,
  getPaginationRowModel,
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
import useWindowSize from "@/lib/hooks/get-window-size";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ReleasesDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
    },
  });

  const size = useWindowSize();

  useEffect(() => {
    const columns = getColumnVisibilityBySize(size.width);
    setColumnVisibility(columns);
  }, [size.width]);

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search for a band..."
          value={(table.getColumn("bandName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("bandName")?.setFilterValue(event.target.value)
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
        bandName: true,
        albumName: true,
        type: true,
        genreTags: true,
        releaseDate: true,
      };
    case width <= 1000 && width > 800:
      return {
        bandName: true,
        albumName: true,
        type: true,
        genreTags: true,
        releaseDate: false,
      };
    case width <= 800 && width > 600:
      return {
        bandName: true,
        albumName: true,
        type: true,
        genreTags: false,
        releaseDate: false,
      };
    case width <= 600 && width > 400:
      return {
        bandName: true,
        albumName: true,
        type: false,
        genreTags: false,
        releaseDate: false,
      };
    case width <= 400:
      return {
        bandName: true,
        albumName: false,
        type: false,
        genreTags: false,
        releaseDate: false,
      };
    default:
      return {
        bandName: true,
        albumName: true,
        type: true,
        genreTags: true,
        releaseDate: true,
      };
  }
};
