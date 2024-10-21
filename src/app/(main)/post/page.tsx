import { CreatePost } from "@/components/posts/create-post-form";
import getSession from "@/lib/auth/getSession";

export default async function Page() {
  const session = await getSession();
  const user = session?.user;

  return (
    <div>
      <CreatePost user={user}/>
    </div>
  )
};