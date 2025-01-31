import { NextApiRequest, NextApiResponse } from "next";
import openAIchain from "./openai";
import textToSpeech from "./azureTTS";

interface SpeechData {
  audioBuffer: Buffer;
  visemes: { offset: number; id: number }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Handler invoked"); // Log the function call

  if (req.method === "POST") {
    console.log("POST request received with body:", req.body); // Log the method and request body

    const message = req.body.message;
    console.log("Message extracted from request:", message); // Log extracted message

    try {
      const openAIResponse = await openAIchain.invoke(message);
      console.log("OpenAI response received:", openAIResponse); // Log OpenAI response

      const speechData = (await textToSpeech(openAIResponse)) as SpeechData;
      console.log("Text-to-speech data generated:", {
        audioBufferLength: speechData.audioBuffer.length,
        visemes: speechData.visemes,
      }); // Log speech data details

      res.status(200).json({
        response: openAIResponse,
        audioBuffer: speechData.audioBuffer,
        visemes: speechData.visemes,
      });
    } catch (error) {
      console.error("Error occurred in handler:", error); // Log error
      res.status(500).json({ error: "Error processing request" });
    }
  } else {
    console.warn("Received non-POST request with method:", req.method); // Log unexpected method
    res.status(405).json({ error: "Method not allowed" });
  }
}
