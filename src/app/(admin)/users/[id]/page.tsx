"use client";

import { useParams } from "next/navigation";

import { UserDetailsPage } from "@/features/users/pages/UserDetailsPage";
import { useUserQuery } from "@/features/users/hooks/useUsers";

export default function UserDetailRoutePage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { data: user, isLoading } = useUserQuery(userId);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6">User not found.</div>;
  }

  return (
    <UserDetailsPage
      user={user}
      onEdit={() => undefined}
      onDelete={() => undefined}
      onSuspend={() => undefined}
      onActivate={() => undefined}
    />
  );
}
