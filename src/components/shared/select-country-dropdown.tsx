"use client";

import React, { useEffect, useState } from "react";
import { useController, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Country {
  name: {
    common: string;
  };
  cca2: string;
}

interface CountrySelectDropdownProps {
  control: Control<any>;
  name: string;
  placeholder?: string;
}

export function CountrySelectDropdown({
  control,
  name,
  placeholder = "Select location",
}: CountrySelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (open && !hasFetched && !loading) {
      const fetchCountries = async () => {
        setLoading(true);
        try {
          const response = await fetch("https://restcountries.com/v3.1/all");
          const data = await response.json();
          const sortedCountries = [...data].sort((a: Country, b: Country) =>
            a.name.common.localeCompare(b.name.common)
          );
          setCountries(sortedCountries);
          setHasFetched(true);
        } catch (error) {
          console.error("Failed to fetch countries:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCountries();
    }
  }, [open, hasFetched, loading]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full min-w-fit max-w-[200px] justify-between",
            !field.value && "text-muted-foreground"
          )}
        >
          {field.value ? field.value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-2">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      value={country.name.common}
                      key={country.cca2}
                      onSelect={() => {
                        field.onChange(country.name.common);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          country.name.common === field.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {country.name.common}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
