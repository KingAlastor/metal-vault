"use client";

import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useRef, useState } from "react";
import { getEventsBySearchTerm, SearchTermEvent } from "@/lib/data/events-data";

type searchInputProps = {
  inputPlaceholder: string;
  clearInput: boolean;
};

type EventSearchBarProps = {
  searchInputProps: searchInputProps;
  onBandSelect: (band: SearchTermEvent) => void;
  value?: string;
};

export function EventSearchBar({
  searchInputProps,
  onBandSelect,
  value = "",
}: EventSearchBarProps) {
  const [events, setEvents] = useState<SearchTermEvent[]>([]);
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
      fetchEvents(value);
    }, 300);
  };

  const fetchEvents = async (searchTerm: string) => {
    if (searchTerm.length > 0) {
      const events = await getEventsBySearchTerm(searchTerm);
      if (events.length < 50) {
        setEvents(events);
        setIsCommandOpen(true);
      }
    }
    else {
      setEvents([]);
    }
  };

  const handleSelect = (band: SearchTermEvent) => {
    onBandSelect(band);
    if (searchInputProps.clearInput) {
      setInputValue("");
    } else {
      setInputValue(band.event_name);
    }
    setEvents([]);
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
    if (events.length > 0) {
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
      {isCommandOpen && events.length > 0 && (
        <Command className="rounded-lg border shadow-md">
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandGroup heading="Events" className="text-muted-foreground">
              {events.map((event) => (
                <CommandItem
                  key={event.id}
                  onSelect={() => handleSelect(event)}
                >
                  {event.eventData}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </div>
  );
}
