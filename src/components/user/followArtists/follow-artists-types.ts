export type DataTableBand = {
  id: string;
  namePretty: string;
  genreTags: string[];
  country: string | null;
  status: string | null;
  followers: number | null;
  rating?: number;
}