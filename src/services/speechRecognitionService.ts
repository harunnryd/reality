export type TranscriptCallback = (text: string, isFinal: boolean) => void;

interface IWindowSpeechRecognition extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private onTranscriptCallback: TranscriptCallback | null = null;
  private currentLanguage = "en-US";
  private shouldRestart = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === "undefined") return;
    const win = window as IWindowSpeechRecognition;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    this.recognition = new SpeechRecognitionClass();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLanguage;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (finalTranscript.trim() && this.onTranscriptCallback) {
        this.onTranscriptCallback(finalTranscript.trim(), true);
      } else if (interimTranscript.trim() && this.onTranscriptCallback) {
        this.onTranscriptCallback(interimTranscript.trim(), false);
      }
    };

    this.recognition.onerror = () => {};

    this.recognition.onend = () => {
      if (this.shouldRestart && this.isListening) {
        try {
          this.recognition?.start();
        } catch {}
      }
    };
  }

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    const win = window as IWindowSpeechRecognition;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public start(onTranscript: TranscriptCallback, lang = "en-US"): boolean {
    this.onTranscriptCallback = onTranscript;
    this.currentLanguage = lang;
    this.shouldRestart = true;

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) return false;

    try {
      this.recognition.lang = lang;
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch {
      return false;
    }
  }

  public stop(): void {
    this.shouldRestart = false;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
