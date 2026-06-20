import { api } from "./client";
import type { Semester } from "../types";

export async function listSemesters(groupId: string) {
  const { data } = await api.get<{ semesters: Semester[] }>(`/groups/${groupId}/semesters`);
  return data.semesters;
}

export async function createSemester(
  groupId: string,
  payload: { name: string; subjects?: string[]; makeActive?: boolean }
) {
  const { data } = await api.post<{ semester: Semester }>(
    `/groups/${groupId}/semesters`,
    payload
  );
  return data.semester;
}

export async function updateSemester(
  groupId: string,
  semesterId: string,
  payload: Partial<{ name: string; subjects: string[]; makeActive: boolean }>
) {
  const { data } = await api.patch<{ semester: Semester }>(
    `/groups/${groupId}/semesters/${semesterId}`,
    payload
  );
  return data.semester;
}

export async function deleteSemester(groupId: string, semesterId: string) {
  await api.delete(`/groups/${groupId}/semesters/${semesterId}`);
}
