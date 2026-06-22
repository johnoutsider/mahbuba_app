"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { QuestionEditor } from "@/components/QuestionEditor";
import { addQuestion, deleteQuestion, fetchQuestions, updateQuestion } from "@/lib/firestore";
import type { Question, QuestionData } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Variantli",
  true_false: "To'g'ri/Noto'g'ri",
  matching: "Moslashtirish",
};

function summary(q: Question) {
  return q.prompt ?? q.statement ?? q.instruction ?? "";
}

export default function CollectionEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);

  async function refresh() {
    setLoading(true);
    setQuestions(await fetchQuestions(id));
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAdd(data: QuestionData) {
    await addQuestion(id, data);
    setAdding(false);
    toast.success("Savol qo'shildi");
    refresh();
  }

  async function handleUpdate(data: QuestionData) {
    if (!editing) return;
    await updateQuestion(id, editing.id, data);
    setEditing(null);
    toast.success("Savol saqlandi");
    refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteQuestion(id, deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Savol o'chirildi");
    refresh();
  }

  return (
    <>
      <h1 className="text-xl font-bold mb-4">Savollar</h1>

      {adding ? (
        <div className="mb-6">
          <QuestionEditor onSave={handleAdd} onCancel={() => setAdding(false)} />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="bg-green-600 text-white rounded-lg px-4 py-2 font-semibold mb-6"
        >
          + Savol qo&apos;shish
        </button>
      )}

      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : questions.length === 0 ? (
        <p className="text-gray-500">Hozircha savol yo&apos;q</p>
      ) : (
        <ul className="space-y-2">
          {questions.map((q) => (
            <li key={q.id} className="border rounded-lg px-4 py-3">
              {editing?.id === q.id ? (
                <QuestionEditor initial={q} onSave={handleUpdate} onCancel={() => setEditing(null)} />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{summary(q)}</p>
                    <p className="text-gray-500 text-sm">{TYPE_LABELS[q.type]}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setEditing(q)} className="text-sm text-blue-600">
                      Tahrirlash
                    </button>
                    <button onClick={() => setDeleteTarget(q)} className="text-sm text-red-600">
                      O&apos;chirish
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Savol o&apos;chirilsinmi?</AlertDialogTitle>
            <AlertDialogDescription>Bu amalni qaytarib bo&apos;lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>O&apos;chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
