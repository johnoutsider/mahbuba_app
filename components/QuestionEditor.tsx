"use client";

import { useState } from "react";
import type { AnswerOption, MatchingPair, Question, QuestionData, QuestionLang, QuestionType } from "@/lib/types";

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Variantli",
  true_false: "To'g'ri/Noto'g'ri",
  matching: "Moslashtirish",
};

export function QuestionEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Question;
  onSave: (data: QuestionData) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<QuestionType>(initial?.type ?? "multiple_choice");
  const [lang, setLang] = useState<QuestionLang>(initial?.promptLang ?? "ar");
  const [error, setError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [promptTransliteration, setPromptTransliteration] = useState(initial?.promptTransliteration ?? "");
  const [options, setOptions] = useState<string[]>(
    initial?.options?.map((o) => o.text) ?? ["", ""]
  );
  const [correctIndex, setCorrectIndex] = useState(
    initial?.options && initial.correctOptionId
      ? initial.options.findIndex((o) => o.id === initial.correctOptionId)
      : 0
  );

  const [statement, setStatement] = useState(initial?.statement ?? "");
  const [trueFalseCorrect, setTrueFalseCorrect] = useState(initial?.isCorrect ?? true);

  const [instruction, setInstruction] = useState(initial?.instruction ?? "");
  const [pairs, setPairs] = useState<{ left: string; leftTranslit: string; right: string }[]>(
    initial?.pairs?.map((p) => ({
      left: p.left.text,
      leftTranslit: p.left.transliteration ?? "",
      right: p.right.text,
    })) ?? [
      { left: "", leftTranslit: "", right: "" },
      { left: "", leftTranslit: "", right: "" },
    ]
  );

  function handleSave() {
    if (type === "multiple_choice") {
      if (!prompt.trim()) return setError("Savol matnini kiriting");
      if (options.some((t) => !t.trim())) return setError("Barcha variantlarni to'ldiring");
      const opts: AnswerOption[] = options.map((text, i) => ({
        id: String.fromCharCode(97 + i),
        text: text.trim(),
      }));
      onSave({
        type,
        promptLang: lang,
        order: 0,
        prompt: prompt.trim(),
        promptTransliteration: promptTransliteration.trim() || undefined,
        options: opts,
        correctOptionId: opts[correctIndex]?.id,
      });
    } else if (type === "true_false") {
      if (!statement.trim()) return setError("Gapni kiriting");
      onSave({
        type,
        promptLang: lang,
        order: 0,
        statement: statement.trim(),
        isCorrect: trueFalseCorrect,
      });
    } else {
      if (pairs.some((p) => !p.left.trim() || !p.right.trim())) {
        return setError("Barcha juftliklarni to'ldiring");
      }
      const matchingPairs: MatchingPair[] = pairs.map((p, i) => ({
        id: `p${i + 1}`,
        left: { text: p.left.trim(), transliteration: p.leftTranslit.trim() || undefined },
        right: { text: p.right.trim() },
      }));
      onSave({
        type,
        promptLang: lang,
        order: 0,
        instruction: instruction.trim() || "Moslashtiring",
        pairs: matchingPairs,
      });
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
      <div className="flex gap-2">
        {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1 rounded-full text-sm border ${
              type === t ? "bg-green-600 text-white border-green-600" : "border-gray-300"
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as QuestionLang)}
        className="border rounded-lg px-3 py-2"
      >
        <option value="ar">Arabcha</option>
        <option value="uz">O&apos;zbekcha</option>
        <option value="en">Inglizcha</option>
      </select>

      {type === "multiple_choice" && (
        <div className="space-y-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Savol matni"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            value={promptTransliteration}
            onChange={(e) => setPromptTransliteration(e.target.value)}
            placeholder="Transliteratsiya (ixtiyoriy)"
            className="w-full border rounded-lg px-3 py-2"
          />
          <p className="text-sm font-medium">Variantlar (to&apos;g&apos;risini belgilang)</p>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
              />
              <input
                value={opt}
                onChange={(e) =>
                  setOptions(options.map((o, idx) => (idx === i ? e.target.value : o)))
                }
                placeholder={`Variant ${i + 1}`}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              {options.length > 2 && (
                <button
                  onClick={() => {
                    setOptions(options.filter((_, idx) => idx !== i));
                    if (correctIndex >= options.length - 1) setCorrectIndex(options.length - 2);
                  }}
                  className="text-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {options.length < 4 && (
            <button onClick={() => setOptions([...options, ""])} className="text-green-700 text-sm">
              + Variant qo&apos;shish
            </button>
          )}
        </div>
      )}

      {type === "true_false" && (
        <div className="space-y-3">
          <input
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Gap"
            className="w-full border rounded-lg px-3 py-2"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={trueFalseCorrect}
              onChange={(e) => setTrueFalseCorrect(e.target.checked)}
            />
            Bu gap to&apos;g&apos;ri
          </label>
        </div>
      )}

      {type === "matching" && (
        <div className="space-y-3">
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Ko'rsatma (ixtiyoriy, default: Moslashtiring)"
            className="w-full border rounded-lg px-3 py-2"
          />
          <p className="text-sm font-medium">Juftliklar</p>
          {pairs.map((p, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <input
                  value={p.left}
                  onChange={(e) =>
                    setPairs(pairs.map((x, idx) => (idx === i ? { ...x, left: e.target.value } : x)))
                  }
                  placeholder={`Chap ${i + 1}`}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <input
                  value={p.leftTranslit}
                  onChange={(e) =>
                    setPairs(
                      pairs.map((x, idx) => (idx === i ? { ...x, leftTranslit: e.target.value } : x))
                    )
                  }
                  placeholder="Transliteratsiya"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <input
                value={p.right}
                onChange={(e) =>
                  setPairs(pairs.map((x, idx) => (idx === i ? { ...x, right: e.target.value } : x)))
                }
                placeholder={`O'ng ${i + 1}`}
                className="flex-1 border rounded-lg px-3 py-2 self-start"
              />
              {pairs.length > 2 && (
                <button
                  onClick={() => setPairs(pairs.filter((_, idx) => idx !== i))}
                  className="text-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setPairs([...pairs, { left: "", leftTranslit: "", right: "" }])}
            className="text-green-700 text-sm"
          >
            + Juftlik qo&apos;shish
          </button>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button onClick={handleSave} className="bg-green-600 text-white rounded-lg px-4 py-2 font-semibold">
          Saqlash
        </button>
        <button onClick={onCancel} className="text-gray-600 px-4 py-2">
          Bekor qilish
        </button>
      </div>
    </div>
  );
}
