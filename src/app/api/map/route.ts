import { NextResponse } from "next/server";
import { z } from "zod";
import { isApiAdmin } from "@/lib/auth/api-session";
import { mapRepository } from "@/features/map/repositories/map.repository";
import type { MapBounds } from "@/features/map/types";
const querySchema = z.object({
  limit: z.coerce.number().int().min(10).default(10),
  cursor: z.string().trim().min(1).max(200).optional(),
  north: z.coerce.number().min(-90).max(90).optional(),
  south: z.coerce.number().min(-90).max(90).optional(),
  east: z.coerce.number().min(-180).max(180).optional(),
  west: z.coerce.number().min(-180).max(180).optional(),
}).refine((value) => {
  const boundCount = [value.north, value.south, value.east, value.west].filter((item) => item !== undefined).length;
  return boundCount === 0 || boundCount === 4 && value.north! > value.south!;
}, { message: "Provide valid map bounds." });

export async function GET(request: Request) {
  if (!(await isApiAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid map page." }, { status: 400 });
  const bounds: MapBounds | undefined = parsed.data.north === undefined ? undefined : {
    north: parsed.data.north,
    south: parsed.data.south!,
    east: parsed.data.east!,
    west: parsed.data.west!,
  };
  try {
    return NextResponse.json({ data: await mapRepository.places({ cursor: parsed.data.cursor, limit: parsed.data.limit, bounds }) });
  } catch {
    return NextResponse.json({ error: "Map locations are unavailable." }, { status: 503 });
  }
}
