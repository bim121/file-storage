'use client';

import { useRef, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import mammoth from 'mammoth';
import { api } from '../../../../convex/_generated/api';
import { useMutation } from 'convex/react';
import { Doc } from '../../../../convex/_generated/dataModel';

export default function WordEditor({ 
    file, 
}: { 
    file: Doc<"files">
}) {
  const [editorData, setEditorData] = useState<string>('');  
  const editorRef = useRef<any>(null);

  const [docxBuffer, setDocxBuffer] = useState<Uint8Array | null>(null);

  const getFileUrl = useMutation(api.files.getUrl);

  const handleOpenDocx = async () => {
    try {
      getFileUrl({ fileId: file.fileId }).then(async (url) => {
      if (!url) {
        return;
      }
      const response =  fetch(url);
      const arrayBuffer =  await (await response).arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const { value } =  await mammoth.convertToHtml({ arrayBuffer: uint8.buffer });
      setEditorData(value);
      setDocxBuffer(uint8);
      });
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleOpenDocx}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
      >
        Открыть Word
      </button>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Сохранить
      </button>
      <div className="mt-6">
        <CKEditor
          editor={ClassicEditor as any}
          data={editorData}
          onReady={(editor) => (editorRef.current = editor)}
          onChange={(event, editor) => setEditorData(editor.getData())}
        />
      </div>
    </div>
  );
}
