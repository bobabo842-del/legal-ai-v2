"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [laws, setLaws] = useState<any[]>([]);

  async function loadLaws() {
    const res = await fetch("/api/laws");

    const data = await res.json();

    setLaws(data.laws || []);
  }

  async function deleteLaw(lawName: string) {
    const confirmDelete = confirm(
      `حذف ${lawName} ؟`
    );

    if (!confirmDelete) return;

    await fetch("/api/delete-law", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        lawName,
      }),
    });

    loadLaws();
  }

  useEffect(() => {
    loadLaws();
  }, []);

  return (
    <div
      style={{
        padding: 30,
        direction: "rtl",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          marginBottom: 30,
        }}
      >
        إدارة القوانين
      </h1>

      {laws.map((law, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: 20,
            marginBottom: 20,
            borderRadius: 10,
          }}
        >
          <h2>{law.lawName}</h2>

          <p>
            عدد المواد:
            {" "}
            {law._count.lawName}
          </p>

          <button
            onClick={() =>
              deleteLaw(law.lawName)
            }
            style={{
              background: "red",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            حذف القانون
          </button>
        </div>
      ))}
    </div>
  );
}