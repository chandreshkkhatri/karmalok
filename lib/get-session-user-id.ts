export function getSessionUserId(session: any): string | null {
  if (!session || !session.user) return null;

  // next-auth with database adapter exposes .user.id (can be ObjectId or string)
  const idField = session.user.id;
  if (typeof idField === "string") return idField;
  if (typeof idField === "object" && idField !== null && "id" in idField) {
    return (idField as any).id as string;
  }

  // JWT-only providers often have `sub`
  if (typeof (session.user as any).sub === "string") {
    return (session.user as any).sub as string;
  }

  // Fallback to email
  if (typeof session.user.email === "string") return session.user.email;

  return null;
} 