"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  fetchCollections,
  fetchGroups,
  fetchStudentProgress,
  fetchStudents,
} from "@/lib/firestore";
import type { CollectionProgress, QuestionCollection, UserProfile } from "@/lib/types";

export default function ResultsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<{ code: string; title: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [collections, setCollections] = useState<QuestionCollection[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [progressByStudent, setProgressByStudent] = useState<Record<string, CollectionProgress[]>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [g, c] = await Promise.all([fetchGroups(user.uid), fetchCollections(user.uid)]);
      setGroups(g);
      setCollections(c);
      if (g.length > 0) setSelectedGroup(g[0].code);
    })();
  }, [user]);

  useEffect(() => {
    if (!selectedGroup) return;
    fetchStudents(selectedGroup).then(setStudents);
  }, [selectedGroup]);

  async function toggleExpand(uid: string) {
    if (expanded === uid) {
      setExpanded(null);
      return;
    }
    setExpanded(uid);
    if (!progressByStudent[uid]) {
      const progress = await fetchStudentProgress(uid);
      setProgressByStudent((prev) => ({ ...prev, [uid]: progress }));
    }
  }

  const titleById = Object.fromEntries(collections.map((c) => [c.id, c.title]));

  return (
    <>
      <h1 className="text-xl font-bold mb-4">Natijalar</h1>
      {groups.length === 0 ? (
        <p className="text-gray-500">Avval guruh yarating</p>
      ) : (
        <>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="border rounded-lg px-3 py-2 mb-6"
          >
            {groups.map((g) => (
              <option key={g.code} value={g.code}>
                {g.code}
              </option>
            ))}
          </select>
          {students.length === 0 ? (
            <p className="text-gray-500">Bu guruhda talaba yo&apos;q</p>
          ) : (
            <ul className="space-y-2">
              {students.map((s) => (
                <li key={s.uid} className="border rounded-lg px-4 py-3">
                  <button onClick={() => toggleExpand(s.uid)} className="w-full text-left">
                    <p className="font-semibold">{s.fullName}</p>
                    <p className="text-gray-500 text-sm">
                      Ball: {s.totalBall} • To&apos;g&apos;ri javob:{" "}
                      {s.totalAnswered === 0 ? 0 : Math.round((s.totalCorrect / s.totalAnswered) * 100)}%
                      ({s.totalCorrect}/{s.totalAnswered})
                    </p>
                  </button>
                  {expanded === s.uid && (
                    <ul className="mt-3 space-y-1 border-t pt-3">
                      {(progressByStudent[s.uid] ?? []).length === 0 ? (
                        <li className="text-gray-500 text-sm">Hali hech narsa yechilmagan</li>
                      ) : (
                        progressByStudent[s.uid].map((p) => (
                          <li key={p.collectionId} className="text-sm flex justify-between">
                            <span>{titleById[p.collectionId] ?? p.collectionId}</span>
                            <span>
                              {p.completed ? "Tugatilgan" : "Tugatilmagan"} • Eng yaxshi:{" "}
                              {Math.round(p.bestScorePct * 100)}%
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
