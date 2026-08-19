import { apiGet } from "@/shared/api/client";
import type {
  DirectoryFilters,
  FacetResponse,
  UserResponse,
} from "../model/types";
export function toSearchParams(filters: DirectoryFilters, page?: number) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  filters.hobbies.forEach((v) => params.append("hobby", v));
  filters.nationalities.forEach((v) => params.append("nationality", v));
  filters.ageRanges.forEach((v) => params.append("ageRange", v));
  params.set("sortBy", filters.sortBy);
  params.set("sortDirection", filters.sortDirection);
  if (page) {
    params.set("page", String(page));
    params.set("limit", "30");
  }
  return params;
}
export const fetchUsers = (
  filters: DirectoryFilters,
  page: number,
  signal?: AbortSignal,
) =>
  apiGet<UserResponse>(`/api/users?${toSearchParams(filters, page)}`, signal);
export const fetchFacets = (filters: DirectoryFilters, signal?: AbortSignal) =>
  apiGet<FacetResponse>(`/api/users/facets?${toSearchParams(filters)}`, signal);
