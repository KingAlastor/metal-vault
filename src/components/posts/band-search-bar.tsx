import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Check } from "lucide-react";
import { useState } from "react";

export function BandSearchBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const fetchBandNames = async (query: string) => {
    setIsLoading(true);
    // Simulate fetching data from the database
    const response = await fetch(`/api/bands?query=${query}`);
    const data = await response.json();
    setNameOptions(data);
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchBandNames(value);
        setComboboxOpen(true);
      }, 300);
    } else {
      setComboboxOpen(false);
    }
  };

  return (
    <div className="relative">
      <Input
        id="name"
        ref={inputRef}
        value={name}
        onChange={handleInputChange}
        className={cn("w-full")}
      />
      <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
        <PopoverContent className="w-[calc(100%-1rem)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search name..." />
            <CommandEmpty>
              {isLoading ? "Loading..." : "No name found."}
            </CommandEmpty>
            <CommandGroup>
              {nameOptions.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    setName(option);
                    setComboboxOpen(false);
                    inputRef.current?.focus();
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      name === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
