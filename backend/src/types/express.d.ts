import type { auth } from "../auth.ts"; // adjust path

type User = (typeof auth.$Infer.Session)["user"];

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {}; // needed to make TS treat this as a module
