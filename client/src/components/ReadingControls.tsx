import { useState, useEffect, useRef } from "react";
import { Headphones, Pause, Play, Square, Type, Maximize2, Minimize2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface ReadingControlsProps {
  articleTitle: string;
  articleContent: string;
  readingTime: number;
  readingMode: boolean;
  onToggleReadingMode: () => void;
}

function stripHtml(html: string): string {
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ReadingControls({
  articleTitle,
  articleContent,
  readingTime,
  readingMode,
  onToggleReadingMode,
}: ReadingControlsProps) {
  const { fontSize, increaseFontSize, decreaseFontSize } = useAccessibility();
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!supported) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }
    if (speaking) return;

    const plainText = `${articleTitle}. ${stripHtml(articleContent)}`;
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = "tr-TR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Prefer Turkish voice if available
    const voices = window.speechSynthesis.getVoices();
    const turkishVoice = voices.find((v) => v.lang.startsWith("tr"));
    if (turkishVoice) utterance.voice = turkishVoice;

    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setPaused(false);
  };

  const handlePause = () => {
    if (!supported || !speaking) return;
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const handleStop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 border-y border-border rounded-none">
      {/* Reading time */}
      <div className="flex items-center gap-1.5 px-3 text-sm font-ui text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="font-semibold">{readingTime} dakikalık okuma</span>
      </div>

      <div className="h-6 w-px bg-border mx-1" />

      {/* TTS controls */}
      {supported && (
        <div className="flex items-center gap-1">
          {!speaking && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-sm font-ui font-semibold text-sm hover:brightness-110 transition-all"
              aria-label="Haberi dinle"
            >
              <Headphones className="w-4 h-4" />
              <span>Haberi Dinle</span>
            </button>
          )}
          {speaking && !paused && (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-sm font-ui font-semibold text-sm hover:brightness-110 transition-all"
              aria-label="Duraklat"
            >
              <Pause className="w-4 h-4" />
              <span>Duraklat</span>
            </button>
          )}
          {speaking && paused && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-sm font-ui font-semibold text-sm hover:brightness-110 transition-all"
              aria-label="Devam et"
            >
              <Play className="w-4 h-4" />
              <span>Devam Et</span>
            </button>
          )}
          {speaking && (
            <button
              onClick={handleStop}
              className="h-9 w-9 flex items-center justify-center bg-background border border-border hover:bg-muted transition-colors"
              aria-label="Durdur"
              title="Durdur"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="h-6 w-px bg-border mx-1" />

      {/* Font size */}
      <div className="flex items-center border border-border bg-background rounded-sm overflow-hidden">
        <button
          onClick={decreaseFontSize}
          disabled={fontSize === "sm"}
          className="px-3 h-9 text-sm font-bold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center"
          aria-label="Yazıyı küçült"
          title="Yazıyı küçült"
        >
          <Type className="w-3 h-3" />
        </button>
        <span className="px-3 h-9 text-xs font-ui font-semibold flex items-center border-x border-border bg-muted/40 uppercase">
          {fontSize === "sm" && "Küçük"}
          {fontSize === "md" && "Normal"}
          {fontSize === "lg" && "Büyük"}
          {fontSize === "xl" && "XL"}
        </span>
        <button
          onClick={increaseFontSize}
          disabled={fontSize === "xl"}
          className="px-3 h-9 text-base font-bold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center"
          aria-label="Yazıyı büyüt"
          title="Yazıyı büyüt"
        >
          <Type className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1" />

      {/* Reading mode */}
      <button
        onClick={onToggleReadingMode}
        className={cn(
          "flex items-center gap-2 px-3 py-2 font-ui font-semibold text-sm rounded-sm transition-all",
          readingMode
            ? "bg-foreground text-background"
            : "bg-background border border-border hover:border-primary hover:text-primary"
        )}
        aria-pressed={readingMode}
        title={readingMode ? "Okuma modundan çık" : "Okuma modu"}
      >
        {readingMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        <span className="hidden sm:inline">{readingMode ? "Modu Kapat" : "Okuma Modu"}</span>
      </button>
    </div>
  );
}
