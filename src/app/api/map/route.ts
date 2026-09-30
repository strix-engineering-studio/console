import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { mapRepository } from "@/features/map/repositories/map.repository";
export async function GET() {
  if (!(await isApiAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ data: await mapRepository.places() });
}
