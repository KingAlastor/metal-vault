import { auth, signOut } from "@/auth";

const SettingsPage = async () => {
  const session = await auth();

  return ( 
    <div className="text-white">
      {JSON.stringify(session)}
      <form action={async () => {
        "use server";

        await signOut({redirectTo: "/"});
      }}>
        <button type="submit">
          Sign out
        </button>
      </form>
    </div>
   );
}
 
export default SettingsPage;