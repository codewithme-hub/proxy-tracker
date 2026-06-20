import { api } from "./client";
import type { ProxyEntryDTO, MemberBalance, ActivityItem } from "../types";

export async function createEntry(
  groupId: string,
  payload: { semesterId: string; givenTo: string; subject?: string; date?: string; note?: string }
) {
  const { data } = await api.post<{ entry: ProxyEntryDTO }>(
    `/groups/${groupId}/proxies`,
    payload
  );
  return data.entry;
}

export async function listEntries(
  groupId: string,
  params?: { semesterId?: string; subject?: string; limit?: number }
) {
  const { data } = await api.get<{ entries: ProxyEntryDTO[] }>(`/groups/${groupId}/proxies`, {
    params,
  });
  return data.entries;
}

export async function deleteEntry(groupId: string, entryId: string) {
  await api.delete(`/groups/${groupId}/proxies/${entryId}`);
}

export async function getBalances(
  groupId: string,
  params?: { semesterId?: string; subject?: string }
) {
  const { data } = await api.get<{ balances: MemberBalance[] }>(
    `/groups/${groupId}/proxies/balances`,
    { params }
  );
  return data.balances;
}

export async function getActivity(
  groupId: string,
  params?: { semesterId?: string; subject?: string; limit?: number }
) {
  const { data } = await api.get<{ activity: ActivityItem[] }>(
    `/groups/${groupId}/proxies/activity`,
    { params }
  );
  return data.activity;
}
