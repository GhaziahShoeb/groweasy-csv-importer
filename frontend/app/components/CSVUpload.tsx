"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

export default function CSVUpload({
  onParsed,
  onFile,
}: {
  onParsed: (rows: any[], headers: string[]) => void;
  onFile: (file: File) => void;
}) {
  const [fileName, setFileName] = useState("");

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    setFileName(file.name);
    onFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        onParsed(result.data as any[], result.meta.fields || []);
      },
    });
  }, [onParsed, onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed border-buttercup-500 bg-buttercup-50 rounded-xl p-10 text-center cursor-pointer hover:bg-buttercup-100 transition">
      <input {...getInputProps()} />
      {isDragActive ? <p className="text-buttercup-700 font-medium">Drop the CSV here...</p> : <p className="text-gray-700">Drag & drop CSV, or click to browse</p>}
      {fileName && <p className="mt-2 text-sm text-buttercup-700">{fileName}</p>}
    </div>
  );
}