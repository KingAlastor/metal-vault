import React, { useState } from 'react';
import { useController, Control } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from 'lucide-react';
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
  countries: Country[];
  placeholder?: string;
}

export function CountrySelectDropdown({ control, name, countries, placeholder = "Select location" }: CountrySelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[200px] justify-between",
            !field.value && "text-muted-foreground"
          )}
        >
          {field.value
            ? countries.find(
                (country) => country.name.common === field.value
              )?.name.common
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

