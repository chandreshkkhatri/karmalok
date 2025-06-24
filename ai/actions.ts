import { generateObject } from "ai";
import { z } from "zod";

import { geminiFlashModel } from ".";

export async function generateChatResponse({ message }: { message: string }) {
  const { object: chatResponse } = await generateObject({
    model: geminiFlashModel,
    prompt: message,
    schema: z.object({
      response: z.string().describe("Generic chat response"),
    }),
  });
  return chatResponse;
}
