import { useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Download, FileText } from 'lucide-react';

export default function Docs() {
  const [content, setContent] = useState('<h1>Untitled Document</h1><p>Start typing here...</p>');
  const [title, setTitle] = useState('Untitled Document');

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const downloadDoc = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.html`;
    a.click();
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm">
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold text-slate-800 border-none outline-none w-full"
            placeholder="Document Title"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => applyFormat('bold')} className="p-2 hover:bg-slate-100 rounded transition" title="Bold">
            <Bold className="w-5 h-5" />
          </button>
          <button onClick={() => applyFormat('italic')} className="p-2 hover:bg-slate-100 rounded transition" title="Italic">
            <Italic className="w-5 h-5" />
          </button>
          <button onClick={() => applyFormat('underline')} className="p-2 hover:bg-slate-100 rounded transition" title="Underline">
            <Underline className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-2" />

          <select onChange={(e) => applyFormat('fontSize', e.target.value)} className="px-3 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="3">Normal</option>
            <option value="1">Small</option>
            <option value="5">Large</option>
            <option value="7">Huge</option>
          </select>

          <div className="w-px h-6 bg-slate-200 mx-2" />

          <button onClick={() => applyFormat('justifyLeft')} className="p-2 hover:bg-slate-100 rounded transition" title="Align Left">
            <AlignLeft className="w-5 h-5" />
          </button>
          <button onClick={() => applyFormat('justifyCenter')} className="p-2 hover:bg-slate-100 rounded transition" title="Align Center">
            <AlignCenter className="w-5 h-5" />
          </button>
          <button onClick={() => applyFormat('justifyRight')} className="p-2 hover:bg-slate-100 rounded transition" title="Align Right">
            <AlignRight className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-2" />

          <button onClick={() => applyFormat('insertUnorderedList')} className="p-2 hover:bg-slate-100 rounded transition" title="Bullet List">
            <List className="w-5 h-5" />
          </button>
          <button onClick={() => applyFormat('insertOrderedList')} className="p-2 hover:bg-slate-100 rounded transition" title="Numbered List">
            <ListOrdered className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <button onClick={downloadDoc} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg min-h-full">
          <div
            contentEditable
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            className="p-16 outline-none prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
            style={{ minHeight: '800px' }}
          />
        </div>
      </div>
    </div>
  );
}
