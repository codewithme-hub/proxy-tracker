import { api } from "./client";
import type { Group } from "../types";

export async function createGroup(name: string) {
  const { data } = await api.post<{ group: Group }>("/groups", { name });
  return data.group;
}

export async function joinGroup(inviteCode: string) {
  const { data } = await api.post<{ group: Group }>("/groups/join", { inviteCode });
  return data.group;
}

export async function getMyGroups() {
  const { data } = await api.get<{ groups: Group[] }>("/groups");
  return data.groups;
}

export async function getGroup(groupId: string) {
  const { data } = await api.get<{ group: Group }>(`/groups/${groupId}`);
  return data.group;
}

export async function setActiveGroup(groupId: string) {
  await api.post(`/groups/${groupId}/activate`, {});
}

export async function leaveGroup(groupId: string) {
  await api.post(`/groups/${groupId}/leave`, {});
}
