import { Metadata } from "next";
import CustomOAuthSignIn from "@/components/auth/sign-in-page";
export const metadata: Metadata = {
  title: "Sign In",
};

export default function Page() {
  return (
    <>
      <CustomOAuthSignIn />
    </>
  );
}
