import { CreatePost } from "@/components/posts/CreatePost";


export default async function Home() {

  return (
    <main>
      <div className="text-white">
        <CreatePost />
      </div>
    </main>
  );
}
