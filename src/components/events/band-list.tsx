import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface BandListProps {
  bands: string[];
  onRemove: (band: string) => void;
}

export function BandList({ bands, onRemove }: BandListProps) {
  return (
    <div className="overflow-y-auto max-h-[100px] w-full rounded-md border p-1">
      {bands.map((bandJson, index) => {
        const band = JSON.parse(bandJson);
        return (
          <div key={index} className="flex justify-between items-center mb-1">
            <span className='m-font ml-1'>
              {band.namePretty} ({band.genreTags.join(", ")}) ({band.country})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(bandJson)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}