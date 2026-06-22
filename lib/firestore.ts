import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  CollectionData,
  CollectionProgress,
  QuestionCollection,
  Question,
  QuestionData,
  UserProfile,
} from "./types";

export async function fetchCollections(ownerId: string): Promise<QuestionCollection[]> {
  // Single-field filter only (auto-indexed) + sort in JS, so the teacher app
  // needs no composite index. A teacher has at most a handful of collections.
  const snap = await getDocs(query(collection(db, "collections"), where("ownerId", "==", ownerId)));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as CollectionData) }))
    .sort((a, b) => a.order - b.order);
}

export async function createCollection(
  ownerId: string,
  title: string,
  passThreshold: number
): Promise<string> {
  // Reuse the ascending fetch (already-indexed) and take the last order,
  // so we don't need a second composite index in the other direction.
  const existing = await fetchCollections(ownerId);
  const nextOrder = existing.length ? existing[existing.length - 1].order + 1 : 1;
  const ref = await addDoc(collection(db, "collections"), {
    title,
    order: nextOrder,
    passThreshold,
    questionCount: 0,
    ownerId,
  });
  return ref.id;
}

export async function updateCollection(
  collectionId: string,
  data: { title?: string; passThreshold?: number }
) {
  await updateDoc(doc(db, "collections", collectionId), data);
}

export async function deleteCollection(collectionId: string) {
  const ref = doc(db, "collections", collectionId);
  const questions = await getDocs(collection(ref, "questions"));
  const batch = writeBatch(db);
  questions.docs.forEach((q) => batch.delete(q.ref));
  batch.delete(ref);
  await batch.commit();
}

export async function fetchQuestions(collectionId: string): Promise<Question[]> {
  const snap = await getDocs(
    query(collection(db, "collections", collectionId, "questions"), orderBy("order"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as QuestionData) }));
}

export async function addQuestion(collectionId: string, question: QuestionData) {
  const collectionRef = doc(db, "collections", collectionId);
  const existing = await getDocs(
    query(collection(collectionRef, "questions"), orderBy("order", "desc"), limit(1))
  );
  const nextOrder = existing.empty ? 0 : (existing.docs[0].data().order as number) + 1;
  const batch = writeBatch(db);
  batch.set(doc(collection(collectionRef, "questions")), { ...question, order: nextOrder });
  batch.update(collectionRef, { questionCount: increment(1) });
  await batch.commit();
}

export async function updateQuestion(
  collectionId: string,
  questionId: string,
  question: QuestionData
) {
  await updateDoc(doc(db, "collections", collectionId, "questions", questionId), { ...question });
}

export async function deleteQuestion(collectionId: string, questionId: string) {
  const collectionRef = doc(db, "collections", collectionId);
  const batch = writeBatch(db);
  batch.delete(doc(collectionRef, "questions", questionId));
  batch.update(collectionRef, { questionCount: increment(-1) });
  await batch.commit();
}

export async function createGroup(ownerId: string, code: string, title: string) {
  await setDoc(doc(db, "groups", code), { ownerId, title, createdAt: serverTimestamp() });
}

export async function fetchGroups(ownerId: string) {
  const snap = await getDocs(query(collection(db, "groups"), where("ownerId", "==", ownerId)));
  return snap.docs.map((d) => ({ code: d.id, title: (d.data().title as string) ?? "" }));
}

export async function deleteGroup(code: string) {
  await deleteDoc(doc(db, "groups", code));
}

export async function fetchStudents(groupCode: string): Promise<UserProfile[]> {
  const snap = await getDocs(
    query(
      collection(db, "users"),
      where("groupCode", "==", groupCode),
      orderBy("totalBall", "desc")
    )
  );
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) }));
}

export async function fetchStudentProgress(uid: string): Promise<CollectionProgress[]> {
  const snap = await getDocs(collection(db, "users", uid, "progress"));
  return snap.docs.map((d) => ({
    collectionId: d.id,
    ...(d.data() as Omit<CollectionProgress, "collectionId">),
  }));
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...(snap.data() as Omit<UserProfile, "uid">) };
}
