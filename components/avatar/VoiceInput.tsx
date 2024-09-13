import React, { useState, useEffect } from "react";
import 'regenerator-runtime/runtime'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
}

function VoiceInput({ onTranscriptChange }: VoiceInputProps) {
  const [isClient, setIsClient] = useState(false);
  const {
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  const startListening = () => SpeechRecognition.startListening({ continuous: true });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (finalTranscript != "") {
      onTranscriptChange(finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript, onTranscriptChange, resetTranscript]);

  if (!isClient) {
    return null;
  }

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <button
    className="bg-blue-500 text-white font-bold py-2 px-3 rounded-lg"
      type="button"
    onTouchStart={startListening}
    onMouseDown={startListening}
    onTouchEnd={SpeechRecognition.stopListening}
    onMouseUp={SpeechRecognition.stopListening}
  >{listening ? 'Listening...' : 'Hold to Listen'}</button>
  );
}

export default VoiceInput;