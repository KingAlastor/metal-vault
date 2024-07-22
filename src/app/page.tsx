import PostsPage from "@/components/posts/posts-page";

export default async function Home() {

  return (
    <main>
      <div className="text-white">
        <PostsPage/>
      </div>
    </main>
  );
}
