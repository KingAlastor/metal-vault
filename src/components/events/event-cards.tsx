import { formatDateAndTime } from "@/lib/general/date";
import UserAvatar from "../auth/user-avatar";
import { Card, CardContent, CardHeader } from "../ui/card";
import { EventCardsProps } from "./event-types";
import { EventCard } from "./event-card";
import { EventDropdownMenu } from "./event-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { fetchUserFavBandsFullData } from "@/lib/data/user/followArtists/follow-artists-data-actions";

export const EventCards = ({ events }: EventCardsProps) => {
  const {
    data: favbands,
    isLoading: isFavBandsLoading,
    isError: isFavBandsError,
  } = useQuery({
    queryKey: ["favbands"],
    queryFn: () => fetchUserFavBandsFullData(),
  });
  
  if (isFavBandsLoading) return <div>Loading...</div>;
  if (isFavBandsError)
  return <div>Error loading events.</div>;

  return (
    <div>
      {events.map((event) => {
        return (
          <Card key={event.id} className="mb-4 w-full">
            <CardHeader className="p-4 pt-2 pb-1">
              <div className="flex justify-between items-center">
                <div className="flex">
                  <div className="flex justify-center items-center">
                    <UserAvatar avatarUrl={event.user.image} size={30} />
                  </div>
                  <div className="flex flex-col pl-2">
                    <div>
                      {event.user.userName
                        ? event.user.userName
                        : event.user.name}
                    </div>
                    <div className="xs-font">
                      {formatDateAndTime(event.createdAt)}
                    </div>
                  </div>
                </div>
                <EventDropdownMenu {...event} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1 pb-1">
              <EventCard event={event} favbands={favbands} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
