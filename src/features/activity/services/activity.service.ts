import { apiRequest, jsonBody } from "@/lib/api/client";
import type { Activity } from "../types";
import type { ActivityInput } from "../schemas";
export const activityService = {
  list: () => apiRequest<Activity[]>("/api/activities"),
  create: (input: ActivityInput) => apiRequest<Activity>("/api/activities", jsonBody(input)),
};
