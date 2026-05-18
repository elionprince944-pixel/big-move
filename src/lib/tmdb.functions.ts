import { createServerFn } from "@tanstack/react-start";

const TMDB_BASE = "https://api.themoviedb.org/3";

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
  return tmdb<{ results: any[] }>("/trending/all/week");
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
    return tmdb<{ results: any[] }>(path);
  });

export const getMovieDetails = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number; type?: string }) => data)
  .handler(async ({ data }) => {
    const type = data.type === "tv" ? "tv" : "movie";
    return tmdb<any>(`/${type}/${data.id}`, { append_to_response: "videos,credits,similar" });
  });

export const searchTmdb = createServerFn({ method: "GET" })
  .inputValidator((data: { query: string }) => data)
  .handler(async ({ data }) => {
    if (!data.query.trim()) return { results: [] };
    return tmdb<{ results: any[] }>("/search/multi", { query: data.query });
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

export const discoverByGenre = createServerFn({ method: "GET" })
  .inputValidator((data: { genreId: number; type?: "movie" | "tv" }) => data)
  .handler(async ({ data }) => {
    const type = data.type === "tv" ? "tv" : "movie";
    return tmdb<{ results: any[] }>(`/discover/${type}`, {
      with_genres: String(data.genreId),
      sort_by: "popularity.desc",
    });
  });

