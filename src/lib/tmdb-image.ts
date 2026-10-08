export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export type TmdbImageSize = "w200" | "w300" | "w342" | "w500" | "w780" | "original";

export const TMDB_IMG = (path: string | null | undefined, size: TmdbImageSize = "w342") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : "";
