"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { createGroup, deleteGroup, fetchGroups } from "@/lib/firestore";
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

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<{ code: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    setGroups(await fetchGroups(user.uid));
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !code.trim()) return;
    await createGroup(user.uid, code.trim().toUpperCase(), title.trim());
    setCode("");
    setTitle("");
    toast.success("Guruh yaratildi");
    refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteGroup(deleteTarget);
    toast.success(`"${deleteTarget}" guruhi o'chirildi`);
    setDeleteTarget(null);
    refresh();
  }

  return (
    <>
      <h1 className="text-xl font-bold mb-4">Guruhlar</h1>
      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Guruh kodi (masalan: A1)"
          className="border rounded-lg px-3 py-2 sm:w-40"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sarlavha"
          className="border rounded-lg px-3 py-2 flex-1 min-w-0"
        />
        <button className="bg-green-600 text-white rounded-lg px-4 py-2 font-semibold shrink-0">
          Yaratish
        </button>
      </form>
      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-500">Hozircha guruh yo&apos;q</p>
      ) : (
        <ul className="space-y-2">
          {groups.map((g) => (
            <li
              key={g.code}
              className="border rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <span className="min-w-0">
                <span className="font-semibold">{g.code}</span>
                <span className="text-gray-500 text-sm block sm:inline sm:ml-2">{g.title}</span>
              </span>
              <button
                onClick={() => setDeleteTarget(g.code)}
                className="text-red-600 text-sm self-end sm:self-auto shrink-0"
              >
                O&apos;chirish
              </button>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Guruh o&apos;chirilsinmi?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget}&quot; guruhi o&apos;chiriladi. Bu guruhdagi talabalar kodi endi yangi
              ro&apos;yxatdan o&apos;tishda ishlamaydi.
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
