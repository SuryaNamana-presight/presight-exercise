export type User = {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
};
export type Facet = { value: string; count: number };
export type UserResponse = {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};
export type FacetResponse = { hobbies: Facet[]; nationalities: Facet[] };
export type SortField = "first_name" | "last_name" | "age" | "nationality";
export type DirectoryFilters = {
  search: string;
  hobbies: string[];
  nationalities: string[];
  sortBy: SortField;
  sortDirection: "asc" | "desc";
};
