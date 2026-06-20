import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getGroup } from "../api/groups";
import { listSemesters } from "../api/semesters";

export function useActiveGroup() {
  const activeGroupId = useAuthStore((s) => s.user?.activeGroup ?? null);

  const groupQuery = useQuery({
    queryKey: ["group", activeGroupId],
    queryFn: () => getGroup(activeGroupId!),
    enabled: !!activeGroupId,
  });

  const semestersQuery = useQuery({
    queryKey: ["semesters", activeGroupId],
    queryFn: () => listSemesters(activeGroupId!),
    enabled: !!activeGroupId,
  });

  const membersById = new Map(
    (groupQuery.data?.members ?? []).map((m) => [m.userId, m])
  );

  const activeSemester =
    semestersQuery.data?.find((s) => s.isActive) ?? semestersQuery.data?.[0] ?? null;

  return {
    groupId: activeGroupId,
    group: groupQuery.data,
    membersById,
    semesters: semestersQuery.data ?? [],
    activeSemester,
    isLoading: groupQuery.isLoading || semestersQuery.isLoading,
    hasGroup: !!activeGroupId,
  };
}
