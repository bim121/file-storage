'use client';

import { useRef, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import mammoth from 'mammoth';
import { api } from '../../../../convex/_generated/api';
import { useMutation } from 'convex/react';
import { Doc } from '../../../../convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const HtmlDocx: any = require('html-docx-js/dist/html-docx');

export default function WordEditor({ 
    file, 
}: { 
    file: Doc<"files">
}) {
  const [editorData, setEditorData] = useState<string>('');  
  const editorRef = useRef<any>(null);

  const [docxBuffer, setDocxBuffer] = useState<Uint8Array | null>(null);

  const router = useRouter(); 

  const { toast } = useToast();

  const getFileUrl = useMutation(api.files.getUrl);
  const updateFile = useMutation(api.files.updateFileContent);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleOpenDocx = async () => {
    try {
      const url = await getFileUrl({ fileId: file.fileId });
      if (!url) return;

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      try {
        const uint8 = new Uint8Array(arrayBuffer);
        const { value } = await mammoth.convertToHtml({ arrayBuffer: uint8.buffer });

        if (value && value.trim() !== "") {
          setEditorData(value);
          setDocxBuffer(uint8);
        } else {
          throw new Error("DOCX content empty, fallback to raw HTML");
        }
      } catch (e) {
        console.warn("Не удалось распарсить как DOCX, пробуем как HTML", e);

        const cleanedHtml = cleanUpGarbage(arrayBuffer);
        setEditorData(cleanedHtml);
      }
    } catch (error) {
      console.error("Ошибка загрузки файла:", error);
    }
  };

  function cleanUpGarbage(arrayBuffer: ArrayBuffer): string {
    const decoder = new TextDecoder("utf-8");

    const byteArray = new Uint8Array(arrayBuffer);

    const numberOfBytesToRemove = 3375; 

    const cleanedArrayBuffer = byteArray.slice(numberOfBytesToRemove);

    return decoder.decode(cleanedArrayBuffer);
  }

  const handleSaveDocx = async () => {
    const htmlContent = editorRef.current?.getData();

    if (!htmlContent) return;

    const converted = HtmlDocx.asBlob(htmlContent); 

    const uploadUrl = await generateUploadUrl(); 

    await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      },
      body: converted,
    }).then(async res => {
      const { storageId } = await res.json();

      await updateFile({
        fileId: file.fileId,
        newStorageId: storageId,
      });

      toast({
        variant: "success",
        title: "Document save",
        description: "Документ успешно сохранён."
      });
        router.push(`/dashboard/files`);
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Document don't save",
        description: "Ошибка при сохранении."
      });
      toast({ title: "Ошибка при сохранении", variant: "destructive" });
    });
  }

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
        onClick={handleSaveDocx}
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
