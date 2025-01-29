import { Metadata } from "next";
import SignInPage from "../../../components/auth/sign-in-page";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function Page() {

  //TODO: add const user = session?.user;and redirect to main page

  return (
    <>
        Sign In
    </>
  )
}