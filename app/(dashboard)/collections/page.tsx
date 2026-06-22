"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { createCollection, deleteCollection, fetchCollections } from "@/lib/firestore";
import type { QuestionCollection } from "@/lib/types";
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

export default function CollectionsPage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<QuestionCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<QuestionCollection | null>(null);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    setCollections(await fetchCollections(user.uid));
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim()) return;
    await createCollection(user.uid, title.trim(), 0.7);
    setTitle("");
    toast.success("To'plam yaratildi");
    refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteCollection(deleteTarget.id);
    toast.success(`"${deleteTarget.title}" o'chirildi`);
    setDeleteTarget(null);
    refresh();
  }

  return (
    <>
      <h1 className="text-xl font-bold mb-4">To&apos;plamlar</h1>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Yangi to'plam sarlavhasi"
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <button className="bg-green-600 text-white rounded-lg px-4 py-2 font-semibold">
          Yaratish
        </button>
      </form>
      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : collections.length === 0 ? (
        <p className="text-gray-500">Hozircha to&apos;plam yo&apos;q</p>
      ) : (
        <ul className="space-y-2">
          {collections.map((c) => (
            <li key={c.id} className="border rounded-lg px-4 py-3 flex items-center justify-between">
              <Link href={`/collections/${c.id}`} className="flex-1">
                <span className="font-semibold">{c.title}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {c.questionCount} ta savol • O&apos;tish: {Math.round(c.passThreshold * 100)}%
                </span>
              </Link>
              <button onClick={() => setDeleteTarget(c)} className="text-red-600 text-sm">
                O&apos;chirish
              </button>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>To&apos;plam o&apos;chirilsinmi?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.title}&quot; butunlay o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi.
            </AlertDialogDescription>
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
