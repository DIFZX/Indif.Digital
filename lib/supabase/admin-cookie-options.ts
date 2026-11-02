import "server-only";

export const adminCookieOptions = {
  name: "indif-sales-auth",
  path: "/admin",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 8 * 60 * 60,
};
