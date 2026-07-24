"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List } from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm w-full min-h-[120px] max-w-none p-3 focus:outline-none text-sm bg-surface-bright",
      },
    },
    onUpdate: ({ editor }) => {
      // Pass the HTML back to the form
      onChange(editor.getHTML());
    },
  });

  // Handle external value changes (like when AI generates text)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 flex items-center gap-1 p-2 border-b">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${
            editor.isActive("bold") ? "bg-gray-200 text-indigo-700" : "text-gray-600"
          }`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${
            editor.isActive("italic") ? "bg-gray-200 text-indigo-700" : "text-gray-600"
          }`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${
            editor.isActive("bulletList") ? "bg-gray-200 text-indigo-700" : "text-gray-600"
          }`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
