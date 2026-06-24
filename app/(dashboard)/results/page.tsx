"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { fetchAllStudents, fetchCollections, fetchStudentProgress } from "@/lib/firestore";
import type { CollectionProgress, QuestionCollection, UserProfile } from "@/lib/types";

export default function ResultsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [collections, setCollections] = useState<QuestionCollection[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressByStudent, setProgressByStudent] = useState<Record<string, CollectionProgress[]>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [studentList, collectionList] = await Promise.all([
          fetchAllStudents(),
          fetchCollections(user.uid),
        ]);
        setStudents(studentList);
        setCollections(collectionList);
      } catch (err) {
        console.error(err);
        setError("Natijalarni yuklash uchun ruxsat yetarli emas yoki Firebase rules hali yangilanmagan.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function toggleExpand(uid: string) {
    if (expanded === uid) {
      setExpanded(null);
      return;
    }
    setExpanded(uid);
    if (!progressByStudent[uid]) {
      try {
        const progress = await fetchStudentProgress(uid);
        setProgressByStudent((prev) => ({ ...prev, [uid]: progress }));
      } catch (err) {
        console.error(err);
        toast.error("Talaba progressini o'qish uchun ruxsat yetarli emas");
        setExpanded(null);
      }
    }
  }

  const titleById = Object.fromEntries(collections.map((c) => [c.id, c.title]));

  return (
    <>
      <h1 className="text-xl font-bold mb-4">Natijalar</h1>
      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : students.length === 0 ? (
        <p className="text-gray-500">Hali talaba yo&apos;q</p>
      ) : (
        <ul className="space-y-2">
          {students.map((student) => {
            const accuracy =
              student.totalAnswered === 0
                ? 0
                : Math.round((student.totalCorrect / student.totalAnswered) * 100);

            return (
              <li key={student.uid} className="border rounded-lg px-4 py-3">
                <button onClick={() => toggleExpand(student.uid)} className="w-full text-left">
                  <p className="font-semibold">{student.fullName}</p>
                  <p className="text-gray-500 text-sm">
                    Ball: {student.totalBall ?? 0} | To&apos;g&apos;ri javob: {accuracy}% (
                    {student.totalCorrect ?? 0}/{student.totalAnswered ?? 0})
                  </p>
                </button>
                {expanded === student.uid && (
                  <ul className="mt-3 space-y-1 border-t pt-3">
                    {(progressByStudent[student.uid] ?? []).length === 0 ? (
                      <li className="text-gray-500 text-sm">Hali hech narsa yechilmagan</li>
                    ) : (
                      progressByStudent[student.uid].map((progress) => (
                        <li
                          key={progress.collectionId}
                          className="text-sm flex flex-col gap-0.5 sm:flex-row sm:justify-between"
                        >
                          <span className="min-w-0">
                            {titleById[progress.collectionId] ?? progress.collectionId}
                          </span>
                          <span className="text-gray-500 sm:text-foreground shrink-0">
                            {progress.completed ? "Tugatilgan" : "Tugatilmagan"} | Eng yaxshi:{" "}
                            {Math.round(progress.bestScorePct * 100)}%
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
