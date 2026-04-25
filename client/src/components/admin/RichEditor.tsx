import { useCallback, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered, Quote, Code,
  Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
  Undo, Redo, AlignLeft, AlignCenter, AlignRight, Sparkles, X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "w-9 h-9 flex items-center justify-center border border-transparent transition-colors",
        active ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:border-border",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-border mx-0.5" />;
}

export default function RichEditor({ value, onChange, placeholder, className }: RichEditorProps) {
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showYoutubePrompt, setShowYoutubePrompt] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNotes, setAiNotes] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.admin.upload.useMutation();
  const reviseMutation = trpc.admin.ai.revise.useMutation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-primary underline underline-offset-4" },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "w-full" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Haberin içeriğini yaz..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: { class: "w-full aspect-video" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "article-content focus:outline-none min-h-[24rem] px-6 py-6",
      },
    },
  });

  const handleLinkApply = useCallback(() => {
    if (!editor) return;
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setShowLinkPrompt(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setUploadingImage(true);
      try {
        const result = await uploadMutation.mutateAsync({ dataUrl, folder: "articles" });
        editor?.chain().focus().setImage({ src: result.url }).run();
        setShowImagePrompt(false);
        setImageUrl("");
      } catch (err: any) {
        alert(err?.message ?? "Yükleme başarısız.");
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageFromUrl = () => {
    if (!imageUrl || !editor) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImagePrompt(false);
    setImageUrl("");
  };

  const handleYoutube = () => {
    if (!youtubeUrl || !editor) return;
    editor.commands.setYoutubeVideo({ src: youtubeUrl });
    setShowYoutubePrompt(false);
    setYoutubeUrl("");
  };

  const handleAIRevise = async () => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (currentHtml.replace(/<[^>]*>/g, "").trim().length < 20) {
      alert("Düzeltme için en az 20 karakter gerekli.");
      return;
    }
    setAiBusy(true);
    setAiNotes(null);
    try {
      const result = await reviseMutation.mutateAsync({ text: currentHtml });
      if (result) {
        editor.commands.setContent(result.revised);
        onChange(result.revised);
        setAiNotes(result.notes);
        setAiOpen(true);
      }
    } catch (err: any) {
      alert(err?.message ?? "AI düzeltmesi başarısız.");
    } finally {
      setAiBusy(false);
    }
  };

  if (!editor) return null;

  return (
    <div className={cn("border border-border bg-background", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30 sticky top-0 z-10">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Kalın (⌘B)">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="İtalik (⌘I)">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Altı çizili (⌘U)">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Üstü çizili">
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Başlık 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Başlık 3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Madde listesi">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numaralı liste">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Alıntı">
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Kod">
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Sola hizala">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Ortala">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Sağa hizala">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => { setLinkUrl(editor.getAttributes("link").href ?? ""); setShowLinkPrompt(true); }} active={editor.isActive("link")} title="Link ekle">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowImagePrompt(true)} title="Görsel ekle">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowYoutubePrompt(true)} title="YouTube videosu ekle">
          <YoutubeIcon className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Geri al">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="İleri">
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleAIRevise}
            disabled={aiBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-press text-primary-foreground font-ui text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-60"
            title="OpenAI ile metni düzelt"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {aiBusy ? "Düzeltiyor..." : "AI Düzelt"}
          </button>
        </div>
      </div>

      {/* AI notes */}
      {aiOpen && aiNotes && aiNotes.length > 0 && (
        <div className="bg-press/5 border-b border-press/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="kicker text-press flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> AI Editör Notları
            </div>
            <button onClick={() => setAiOpen(false)} className="text-muted-foreground hover:text-press">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm font-reading text-foreground/80">
            {aiNotes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Link prompt modal */}
      {showLinkPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLinkPrompt(false)}>
          <div className="bg-background border border-border p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-3">Link Ekle</h3>
            <input
              type="url"
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-border mb-4 focus:outline-none focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleLinkApply()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLinkPrompt(false)} className="px-4 py-2 text-sm font-ui border border-border hover:border-press hover:text-press transition-colors">
                İptal
              </button>
              <button onClick={handleLinkApply} className="px-4 py-2 text-sm font-ui bg-primary text-primary-foreground font-semibold">
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image prompt modal */}
      {showImagePrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowImagePrompt(false)}>
          <div className="bg-background border border-border w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-lg">Görsel Ekle</h3>
              <button onClick={() => setShowImagePrompt(false)} className="text-muted-foreground hover:text-press">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex border-b border-border">
              <button
                onClick={() => setImageTab("upload")}
                className={cn("flex-1 py-2.5 text-sm font-ui font-semibold transition-colors",
                  imageTab === "upload" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                Yükle
              </button>
              <button
                onClick={() => setImageTab("url")}
                className={cn("flex-1 py-2.5 text-sm font-ui font-semibold transition-colors",
                  imageTab === "url" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                URL'den
              </button>
            </div>
            <div className="p-5">
              {imageTab === "upload" ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(f);
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full p-8 border-2 border-dashed border-border hover:border-primary transition-colors text-center disabled:opacity-60"
                  >
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-ui text-sm">
                      {uploadingImage ? "Yükleniyor..." : "Dosya seçmek için tıkla"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">JPG · PNG · WebP (max 10MB)</div>
                  </button>
                </>
              ) : (
                <div>
                  <input
                    type="url"
                    autoFocus
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-border mb-3 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleImageFromUrl}
                    disabled={!imageUrl}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground font-ui text-sm font-semibold disabled:opacity-50"
                  >
                    Ekle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* YouTube prompt */}
      {showYoutubePrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowYoutubePrompt(false)}>
          <div className="bg-background border border-border p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-3">YouTube Videosu</h3>
            <input
              type="url"
              autoFocus
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-border mb-4 focus:outline-none focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleYoutube()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowYoutubePrompt(false)} className="px-4 py-2 text-sm font-ui border border-border hover:border-press hover:text-press transition-colors">
                İptal
              </button>
              <button onClick={handleYoutube} disabled={!youtubeUrl} className="px-4 py-2 text-sm font-ui bg-primary text-primary-foreground font-semibold disabled:opacity-50">
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
