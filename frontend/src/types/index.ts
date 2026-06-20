export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  activeGroup?: string | null;
}

export type GroupRole = "admin" | "member";

export interface GroupMember {
  userId: string;
  name?: string;
  avatarUrl?: string;
  role: GroupRole;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  maxMembers: number;
  members: GroupMember[];
  createdAt: string;
}

export interface Semester {
  id: string;
  name: string;
  subjects: string[];
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ProxyEntryDTO {
  id: string;
  semester: string;
  subject?: string;
  givenBy: string;
  givenTo: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface PartnerBalance {
  userId: string;
  net: number;
  given: number;
  received: number;
}

export interface MemberBalance {
  userId: string;
  net: number;
  given: number;
  received: number;
  perPartner: PartnerBalance[];
}

export interface ActivityItem {
  id: string;
  givenBy: string;
  givenTo: string;
  subject?: string;
  note?: string;
  date: string;
}
