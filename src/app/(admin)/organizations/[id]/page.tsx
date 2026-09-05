"use client";

import { useParams } from "next/navigation";

import CommunityDetailsPage from "@/features/organizations/pages/OrganizationDetailsPage";
import { useCommunityQuery } from "@/features/organizations/hooks/useCommunity";

export default function CommunityDetailRoutePage() {
  const params = useParams<{ id: string }>();
  const communityId = params.id;
  const { data: community, isLoading } = useCommunityQuery(communityId);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!community) {
    return <div className="p-6">Community not found.</div>;
  }

  return <CommunityDetailsPage />;
}
