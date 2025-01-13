import { auth } from "@/auth";
import { EventsPage } from "@/components/events/events-page";

export default async function Page() {
    const session = await auth();
    const user = session?.user;

  return <EventsPage user={user} />
}