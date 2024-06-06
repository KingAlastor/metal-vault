import { auth } from "@/auth";
import { cache } from "react";

export default cache(auth);

// not used for the time being