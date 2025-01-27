import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  const user = session?.user;

  return (
    <div>
      Add possible post view page, maybe for edit
    </div>
  )
};