import { CreatePost } from "@/components/posts/create-post-form";


export default async function Home() {

  return (
    <main>
      <div className="text-white">
        <CreatePost />
      </div>
    </main>
  );
}
