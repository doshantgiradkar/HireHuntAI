import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Home from "./home/page";


export default async function Page() {
  const { userId } = auth();

  if (userId) {
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata.role;

    if (role === "recruiter") {
      redirect("/recruiter/dashboard");
    } else if (role === "candidate") {
      redirect("/candidate/dashboard");
    } else {
      redirect("/unauthorized");
    }
  }

  return <Home />;
}