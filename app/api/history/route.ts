import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

// Redirect to the actual history API in the chat group
export { GET } from "../../(chat)/api/history/route"; 