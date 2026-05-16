"use client";

import { useState } from "react";

export default function LawyerPage() {
  const [question, setQuestion] = useState("");

  const [answer, setAnswer] = useState("");

  const askAI = async () => {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    setAnswer(data.result);
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">
        Egyptian Legal AI
      </h1>

      <textarea
        className="border p-3 w-full h-40"
        placeholder="اسأل عن أي قضية أو مادة قانونية..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        onClick={askAI}
        className="bg-black text-white px-5 py-2 rounded mt-3"
      >
        اسأل AI
      </button>

      <div className="mt-10 border p-5 rounded whitespace-pre-wrap">
        {answer}
      </div>
    </div>
  );
}