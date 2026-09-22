export function getContentRating(item: any): string | null {
  const movieUS = item?.release_dates?.results?.find((r: any) => r.iso_3166_1 === "US");
  const movieCert = movieUS?.release_dates?.find((r: any) => r.certification)?.certification;
  if (movieCert) return movieCert;

  const tvUS = item?.content_ratings?.results?.find((r: any) => r.iso_3166_1 === "US");
  return tvUS?.rating || null;
}

export function isMatureRating(rating?: string | null): boolean {
  if (!rating) return false;
  return /^(R|NC-17|TV-MA|MA15\+|R18\+|18|18A|X)$/i.test(rating.trim());
}

export function isSafeTitle(item: any): boolean {
  return item?.adult !== true;
}
