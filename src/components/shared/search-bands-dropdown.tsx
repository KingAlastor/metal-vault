"use client";

import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useRef, useState } from "react";
import { getBandsBySearchTerm } from "@/lib/data/bands/search-bands-data-actions";

export function BandSearchBar() {
  const [bands, setBands] = useState<{ bandId: string; bandName: string }[]>(
    []
  );
  const [inputValue, setInputValue] = useState("");
  const [selectedValues, setSelectedValues] = useState<
    { bandId: string; bandName: string }[]
  >([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchBands(value);
    }, 300);
  };

  const fetchBands = async (searchTerm: string) => {
    const bands = await getBandsBySearchTerm(searchTerm);
    if (bands.length < 20) {
      setBands(bands);
      setIsCommandOpen(true);
      console.log("Debounced value:");
    }
  };

  const handleSelect = (band: { bandId: string; bandName: string }) => {
    setSelectedValues((prev) => [...prev, band]);
    setInputValue("");
    setBands([]);
    setIsCommandOpen(false)
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsCommandOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputFocus = () => {
    if (bands.length > 0) {
      setIsCommandOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-sm space-y-4">
      <div>
        Add bands to favorites
      </div>
      <Input
        type="text"
        placeholder="Search bands from database..."
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
      />
      {isCommandOpen && bands.length > 0 && (
        <Command className="rounded-lg border shadow-md">
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandGroup heading="Results" className="text-muted-foreground">
              {bands.map((item) => (
                <CommandItem
                  key={item.bandId}
                  onSelect={() => handleSelect(item)}
                >
                  {item.bandName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      )}
      {selectedValues.length > 0 && (
        <div>
          <h3>Selected Bands:</h3>
          <ul>
            {selectedValues.map((value) => (
              <li key={value.bandId}>{value.bandName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
