'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { FontFamily } from '@tiptap/extension-font-family';
import { Image } from '@tiptap/extension-image';
import { Extension } from '@tiptap/core';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { useImageUpload } from '@/hooks/use-image-upload';

// Custom FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [fontSize, setFontSize] = useState('16');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadImage, isUploading } = useImageUpload({
    onSuccess: (imageUrl) => {
      if (editor) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    },
    onError: (error) => {
      alert(`Image upload failed: ${error}`);
    }
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] max-w-none p-6 overflow-auto resize-none',
      },
    },
  });

  if (!editor) {
    return <div className="min-h-[200px] border rounded-md animate-pulse bg-gray-50"></div>;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <div className="border rounded-md flex flex-col min-h-[400px]">
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50 flex-shrink-0">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          <strong>B</strong>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          <em>I</em>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          <s>S</s>
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Font Size Controls */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 px-2">Size:</span>
          <select
            value={fontSize}
            onChange={(e) => {
              const newSize = e.target.value;
              setFontSize(newSize);
              if (newSize === '16') {
                // Reset to default size
                editor.chain().focus().unsetFontSize().run();
              } else {
                // Apply font size to selected text
                editor.chain().focus().setFontSize(`${newSize}px`).run();
              }
            }}
            className="text-xs border rounded px-2 py-1 bg-white min-w-[100px]"
            disabled={disabled}
            title="Select text first, then choose font size"
          >
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px (Default)</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
            <option value="28">28px</option>
            <option value="32">32px</option>
          </select>
          <span className="text-xs text-gray-500">📝</span>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          H1
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          H2
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          H3
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          •
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          1.
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          ⫷
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          ≡
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          ⫸
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Link */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={editor.isActive('link') ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          🔗
        </Button>

        {/* Image */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          disabled={disabled || isUploading}
          title={isUploading ? "Uploading image..." : "Upload image"}
        >
          {isUploading ? '⏳' : '🖼️'}
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Quote and Code */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          &quot;
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-gray-200' : ''}
          disabled={disabled}
        >
          &lt;/&gt;
        </Button>

        {/* Undo/Redo */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo() || disabled}
        >
          ↶
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo() || disabled}
        >
          ↷
        </Button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="border-b p-2 bg-blue-50 flex gap-2 items-center">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL..."
            className="flex-1 px-2 py-1 border rounded text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
          />
          <Button type="button" size="sm" onClick={addLink}>
            Add Link
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowLinkInput(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="min-h-[300px] flex-grow overflow-hidden">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
          className="h-full [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:p-6 [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:prose [&_.ProseMirror]:prose-sm [&_.ProseMirror]:sm:prose [&_.ProseMirror]:lg:prose-lg [&_.ProseMirror]:xl:prose-2xl [&_.ProseMirror]:max-w-none"
        />
      </div>
    </div>
  );
}