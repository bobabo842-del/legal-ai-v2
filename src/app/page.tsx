"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const [result, setResult] = useState("");

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setResult(data.text);
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">
        Legal AI Egypt
      </h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
          }
        }}
      />

      <button
        onClick={uploadFile}
        className="bg-black text-white px-4 py-2 rounded ml-3"
      >
        Upload PDF
      </button>

      <div className="mt-10 whitespace-pre-wrap border p-5 rounded">
        {result}
      </div>
    </div>
  );
}