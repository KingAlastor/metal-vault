"use client";

import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useRef, useState } from "react";
import { getBandsBySearchTerm, SearchTermBand } from "@/lib/data/bands-data";

type searchInputProps = {
  inputPlaceholder: string;
  clearInput: boolean;
};

type BandSearchBarProps = {
  searchInputProps: searchInputProps;
  onBandSelect: (band: SearchTermBand) => void;
  value?: string;
};

export function BandSearchBar({
  searchInputProps,
  onBandSelect,
  value = "",
}: BandSearchBarProps) {
  const [bands, setBands] = useState<SearchTermBand[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInputValue(value); 
  }, [value]);

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
    if (searchTerm.length > 0) {
      const bands = await getBandsBySearchTerm(searchTerm);
      if (bands.length < 50) {
        setBands(bands);
        setIsCommandOpen(true);
      }
    }
    else {
      setBands([]);
    }
  };

  const handleSelect = (band: SearchTermBand) => {
    onBandSelect(band);
    if (searchInputProps.clearInput) {
      setInputValue("");
    } else {
      setInputValue(band.namePretty);
    }
    setBands([]);
    setIsCommandOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
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
      <Input
        type="text"
        placeholder={searchInputProps.inputPlaceholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
      />
      {isCommandOpen && bands.length > 0 && (
        <Command className="rounded-lg border shadow-md">
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandGroup heading="Bands" className="text-muted-foreground">
              {bands.map((band) => (
                <CommandItem
                  key={band.bandId}
                  onSelect={() => handleSelect(band)}
                >
                  {band.bandName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </div>
  );
}
