import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { Buffer } from "buffer";

//const AZURE_SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
//const AZURE_SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;
//const AZURE_VOICE_NAME = process.env.NEXT_PUBLIC_AZURE_VOICE_NAME;

const AZURE_SPEECH_KEY = "edb8f1c0e1d84aabbae3943efc7dfbfd";
const AZURE_SPEECH_REGION = "eastus";
const AZURE_VOICE_NAME = "en-US-AvaMultilingualNeural";

if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION || !AZURE_VOICE_NAME) {
  throw new Error("Azure API keys are not defined");
}

function buildSSML(message: string) {
  return `<speak version="1.0"
  xmlns="http://www.w3.org/2001/10/synthesis"
  xmlns:mstts="https://www.w3.org/2001/mstts"
  xml:lang="en-US">
  <voice name="en-US-JennyNeural">
      <mstts:viseme type="redlips_front"/>
      <mstts:express-as style="excited">
          <prosody rate="-8%" pitch="23%">
              ${message}
          </prosody>
      </mstts:express-as>
      <mstts:viseme type="sil"/>
      <mstts:viseme type="sil"/>
  </voice>
  </speak>`;
}

const textToSpeech = async (message: string) => {
  console.log("textToSpeech function invoked with message:", message); // Log the input message

  return new Promise((resolve, reject) => {
    try {
      console.log("Building SSML for the message...");
      const ssml = buildSSML(message);
      console.log("SSML built successfully:", ssml); // Log the generated SSML

      console.log("Initializing SpeechConfig...");
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
      speechConfig.speechSynthesisOutputFormat = 5; // mp3
      speechConfig.speechSynthesisVoiceName = AZURE_VOICE_NAME;
      console.log("SpeechConfig initialized with voice name:", AZURE_VOICE_NAME); // Log SpeechConfig details

      let visemes: { offset: number; id: number }[] = [];

      const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);

      synthesizer.visemeReceived = function (s, e) {
        console.log("Viseme received with audioOffset:", e.audioOffset, "and visemeId:", e.visemeId); // Log viseme details
        visemes.push({
          offset: e.audioOffset / 10000,
          id: e.visemeId,
        });
      };

      console.log("Starting speech synthesis...");
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          console.log("Speech synthesis result:", result); // Log the full result object
          const { audioData } = result;
          if (!audioData) {
            console.error("Error: audioData is undefined.");
            reject(new Error("No audio data returned from Azure Speech SDK."));
            return;
          }

          console.log("Audio data received with byte length:", audioData.byteLength); // Log audio data byte length
          synthesizer.close();
          const audioBuffer = Buffer.from(audioData);
          console.log("Audio buffer created successfully with length:", audioBuffer.length); // Log buffer details
          resolve({ audioBuffer, visemes });
        },
        (error) => {
          console.error("Error during speech synthesis:", error); // Log errors
          synthesizer.close();
          reject(error);
        }
      );
    } catch (error) {
      console.error("Error initializing text-to-speech:", error); // Log initialization errors
      reject(error);
    }
  });
};

export default textToSpeech;
