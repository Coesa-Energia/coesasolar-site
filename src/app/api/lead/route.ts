import { handleLeadRequest } from "@/lib/leads/bitrix-lead";

export const runtime = "nodejs";
export const POST = handleLeadRequest;
