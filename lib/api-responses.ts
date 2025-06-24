import { NextResponse } from "next/server";

export function createErrorResponse(message: string, status: number) {
  return new Response(message, { status });
}

export function createUnauthorizedResponse() {
  return createErrorResponse("Unauthorized", 401);
}

export function createBadRequestResponse(message: string = "Bad Request") {
  return createErrorResponse(message, 400);
}

export function createNotFoundResponse(message: string = "Not Found") {
  return createErrorResponse(message, 404);
}

export function createInternalErrorResponse(
  message: string = "Internal Server Error"
) {
  return createErrorResponse(message, 500);
}

export function createJsonResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}
