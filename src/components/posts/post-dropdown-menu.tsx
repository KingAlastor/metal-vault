import { MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

const PostDropdownMenu = () => {

  const handleAddToFavoritesClick = () => {
    console.log("clicked");
  };
  
  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Open menu</span>
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={handleAddToFavoritesClick}>
        <div className="dropdown-options">Save post</div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleAddToFavoritesClick}>
        <div className="dropdown-options">Report Post</div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}

export default PostDropdownMenu;