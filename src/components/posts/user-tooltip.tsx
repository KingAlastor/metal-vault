import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PropsWithChildren } from "react";

interface UserTooltipProps extends PropsWithChildren {
  user: UserData;
}

type UserData = {
  name: string,
  image: string,
  role: string,
}


export function UserToolTip({children, user}: UserTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{user.name}</TooltipTrigger>
        <TooltipContent>
          <p>User Information</p>
          <p>{user.name}</p>
          <p>{user.role}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
