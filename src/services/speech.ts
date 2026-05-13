export function speak(text: string, lang: string = 'hi-IN') {
  if (!('speechSynthesis' in window)) {
    console.error("Speech synthesis not supported");
    return;
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  
  // Try to find a better voice if available
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

export function createSpeechRecognizer(onResult: (text: string) => void, onEnd: () => void) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error("Speech recognition not supported");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN'; // Default to English (India) for input

  recognition.onresult = (event: any) => {
    const result = event.results[0][0].transcript;
    onResult(result);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
