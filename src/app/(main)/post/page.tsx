import getSession from "@/lib/auth/getSession";

export default async function Page() {
  const session = await getSession();
  const user = session?.user;

  return (
    <div>
      Add possible post view page, maybe for edit
    </div>
  )
};