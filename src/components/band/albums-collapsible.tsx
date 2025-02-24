import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { TrackList } from "./tracks-collapsible";
import { AlbumListProps } from "./band-cards-types";

export function AlbumList({ albums }: AlbumListProps) {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          Albums
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        {albums.map((album) => (
          <Collapsible key={album.id}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                {album.name_pretty} (
                {album.release_date
                  ? new Date(album.release_date).getFullYear()
                  : "Unknown"}
                )
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4">
              <TrackList tracks={album.album_tracks} />
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
