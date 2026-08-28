import { collectionHandler } from "@/lib/api/collection";
import { getExperience } from "@/lib/api/data";
import { API_BASE } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

export const GET = collectionHandler(`${API_BASE}/experience`, getExperience);
