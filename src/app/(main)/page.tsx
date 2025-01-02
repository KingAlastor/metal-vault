import PostsPage from "@/components/posts/posts-page";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const user = session?.user;
  
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostsPage user={user}/>
      </div>
    </main>
  );
}
