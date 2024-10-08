import React from "react";
import VoiceInput from "@/components/avatar/VoiceInput";
import ZippyAvatar from "@/components/avatar/ZippyAvatar";
import PaperAirplane from "@/components/icons/PaperAirplane";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";

export default function AvatarApp() {
  const { visemeID, isPlaying, text, avatarSay, handleTextChange, handleSynthesis } = useSpeechSynthesis();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSynthesis();
  };
  const handleTranscriptChange = (transcript: string) => {
    handleTextChange({ target: { value: transcript } } as React.ChangeEvent<HTMLInputElement>);
  };
  return (
    <div className="w-screen h-screen items-center justify-center flex flex-col mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flux justify-center items-center w-[500px] relative">
          <ZippyAvatar visemeID={visemeID} />
          {avatarSay ? (
            <div className="absolute top-[-50px] left-[400px] w-[400px] bg-white p-2 rounded-lg shadow-lg text-xs">
              {avatarSay}
            </div>
          ) : null}
          <h1 className="text-2xl font-bold text-center text-blue-600">Zippy Talking Avatar</h1>
        </div>
        
        <div className="h-10 relative my-4">
        <VoiceInput onTranscriptChange={handleTranscriptChange} />
          <br />
          <br />
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            className="border-2 border-gray-300 bg-gray-100 h-10 w-[600px] pl-[20px] pr-[120px] rounded-lg text-sm mb-2"
            placeholder="Write something..."
            maxLength={100}
          />
          <button
            className={`
            bg-blue-500 text-white font-bold py-2 px-3 rounded-r-lg absolute bottom-0 right-0 w-[50px] h-10 
            ${isPlaying ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"}
          `}
            type="submit"
            disabled={isPlaying}
          >
            <PaperAirplane />
          </button>
        </div>
      </form>
    </div>
  );
}
