import { useEffect } from "react";
import Home from "./home/page";
import { useUserStore } from "@/store/user.store";


export default function Page() {
  const clearUser = useUserStore(state => state.clearUser)
  useEffect(() => {
    clearUser();
  }, [clearUser]);
    return <Home />;
}
