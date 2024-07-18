import { Button } from "@/components/ui/button";
import getSession from "@/lib/auth/getSession";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();
  const user = session?.user;

  return (
    <main>
      <div className="text-white">
        <Button className="bg-black text-white" variant="outline">
          <Link href="/post">
            <span className="dropdown-options">Create Post</span>
          </Link>
        </Button>
      </div>
    </main>
  );
}
