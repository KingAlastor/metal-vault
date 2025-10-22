import PostsPage from "@/components/posts/posts-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User",
};

export default async function Home() {  
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostsPage />
      </div>
    </main>
  );
}
