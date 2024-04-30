import Link from "next/link";
import Image from "next/image";
import { LoginButton } from "../auth/login-button";
import { Button } from "./button";

function Topbar() {
  return (
    <nav className="topbar">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/logo.svg" alt="Logo" width={28} height={28} />
        <p className="font-bold max-xs:hidden"> Metal Vault</p>
      </Link>
      <div className="flex items-center gap-1">
        <div className="ml-auto text-white">
          <LoginButton>
            <Button variant="secondary" size="lg">
              Sign In
            </Button>
          </LoginButton>
        </div>
      </div>
    </nav>
  );
}

export default Topbar;
