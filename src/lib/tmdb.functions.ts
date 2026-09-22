import { createServerFn } from "@tanstack/react-start";

const TMDB_BASE = "https://api.themoviedb.org/3";
const SAFE_PARAMS = { include_adult: "false" };

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not configured");
  const url = new URL(TMDB_BASE + path);
  url.searchParams.set("api_key", apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const getTrending = createServerFn({ method: "GET" }).handler(async () => {
  return tmdb<{ results: any[] }>("/trending/all/week", SAFE_PARAMS);
});

export const getCategory = createServerFn({ method: "GET" })
  .inputValidator((data: { category: string }) => data)
  .handler(async ({ data }) => {
    const map: Record<string, string> = {
      popular: "/movie/popular",
      top_rated: "/movie/top_rated",
      upcoming: "/movie/upcoming",
      now_playing: "/movie/now_playing",
      tv_popular: "/tv/popular",
      tv_top_rated: "/tv/top_rated",
    };
    const path = map[data.category] ?? "/movie/popular";
    return tmdb<{ results: any[] }>(path, SAFE_PARAMS);
  });

export const getMovieDetails = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number; type?: string }) => data)
  .handler(async ({ data }) => {
    const type = data.type === "tv" ? "tv" : "movie";
    const append = type === "tv" ? "videos,credits,similar,content_ratings" : "videos,credits,similar,release_dates";
    return tmdb<any>(`/${type}/${data.id}`, { append_to_response: append });
  });

export const searchTmdb = createServerFn({ method: "GET" })
  .inputValidator((data: { query: string }) => data)
  .handler(async ({ data }) => {
    if (!data.query.trim()) return { results: [] };
    return tmdb<{ results: any[] }>("/search/multi", { query: data.query, include_adult: "false" });
  });

export const getGenres = createServerFn({ method: "GET" }).handler(async () => {
  const [movie, tv] = await Promise.all([
    tmdb<{ genres: any[] }>("/genre/movie/list"),
    tmdb<{ genres: any[] }>("/genre/tv/list"),
  ]);
  return { movie: movie.genres, tv: tv.genres };
});

export const getWatchProviders = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number; type?: "movie" | "tv"; region?: string }) => data)
  .handler(async ({ data }) => {
    const type = data.type === "tv" ? "tv" : "movie";
    const res = await tmdb<{ results: Record<string, any> }>(`/${type}/${data.id}/watch/providers`);
    const region = (data.region ?? "US").toUpperCase();
    return { region, providers: res.results?.[region] ?? null, all: res.results ?? {} };
  });

export const getEmbedUrl = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number | string; type?: "movie" | "tv"; season?: number; episode?: number }) => data)
  .handler(async ({ data }) => {
    const type = data.type === "tv" ? "tv" : "movie";
    const base = process.env.VIDSRC_BASE ?? "https://vidsrc.xyz/embed";
    const token = process.env.VIDSRC_TOKEN;
    const tmdbId = encodeURIComponent(String(data.id));
    let url =
      type === "movie"
        ? `${base}/movie?tmdb=${tmdbId}`
        : `${base}/tv?tmdb=${tmdbId}${data.season ? `&season=${data.season}` : ""}${data.episode ? `&episode=${data.episode}` : ""}`;
    if (token) url += `&token=${encodeURIComponent(token)}`;
    return { url, type, id: String(data.id) };
  });

export const getRandomMovie = createServerFn({ method: "GET" })
  .inputValidator((data: { type?: "movie" | "tv"; genreId?: number }) => data)
  .handler(async ({ data }) => {
    const type = data.type === "tv" ? "tv" : "movie";
    const params: Record<string, string> = {
      sort_by: "popularity.desc",
      include_adult: "false",
      "vote_count.gte": "50",
    };
    if (data.genreId) params.with_genres = String(data.genreId);

    const first = await tmdb<{ total_pages: number }>(`/discover/${type}`, params);
    const maxPage = Math.min(first.total_pages || 1, 500);
    const page = Math.floor(Math.random() * maxPage) + 1;
    const result = await tmdb<{ results: any[] }>(`/discover/${type}`, { ...params, page: String(page) });
    const items = result.results?.filter((item: any) => item.poster_path) ?? [];
    const item = items[Math.floor(Math.random() * items.length)] ?? result.results?.find((x: any) => x.adult !== true);
    if (!item) throw new Error("No safe title found");
    return { ...item, media_type: type };
  });

export const discoverByGenre = createServerFn({ method: "GET" })
  .inputValidator((data: {
    genreId: number;
    type?: "movie" | "tv";
    sortBy?: string;
    year?: number;
    minRating?: number;
    page?: number;
  }) => data)
  .handler(async ({ data }) => {
    const type = data.type === "tv" ? "tv" : "movie";
    const params: Record<string, string> = {
      with_genres: String(data.genreId),
      sort_by: data.sortBy || "popularity.desc",
      page: String(data.page ?? 1),
      include_adult: "false",
    };
    if (data.year) {
      params[type === "movie" ? "primary_release_year" : "first_air_date_year"] = String(data.year);
    }
    if (typeof data.minRating === "number" && data.minRating > 0) {
      params["vote_average.gte"] = String(data.minRating);
      params["vote_count.gte"] = "50";
    }
    if (type === "movie") {
      params.certification_country = "US";
      params["certification.lte"] = "PG-13";
    }
    return tmdb<{ results: any[]; total_pages: number; page: number }>(`/discover/${type}`, params);
  });

