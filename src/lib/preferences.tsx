import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";
export type Lang = "en" | "es" | "fr" | "de";

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    home: "Home", browse: "Browse", watchlist: "Watchlist", genres: "Genres",
    search: "Search…", signIn: "Sign in", signOut: "Sign out", settings: "Settings",
    profile: "Profile", appearance: "Appearance", language: "Language", account: "Account",
    theme: "Theme", dark: "Dark", light: "Light", save: "Save changes", saving: "Saving…",
    displayName: "Display name", bio: "Bio", email: "Email", avatar: "Profile picture",
    upload: "Upload", change: "Change", remove: "Remove",
  },
  es: {
    home: "Inicio", browse: "Explorar", watchlist: "Mi lista", genres: "Géneros",
    search: "Buscar…", signIn: "Entrar", signOut: "Salir", settings: "Ajustes",
    profile: "Perfil", appearance: "Apariencia", language: "Idioma", account: "Cuenta",
    theme: "Tema", dark: "Oscuro", light: "Claro", save: "Guardar", saving: "Guardando…",
    displayName: "Nombre", bio: "Biografía", email: "Correo", avatar: "Foto de perfil",
    upload: "Subir", change: "Cambiar", remove: "Quitar",
  },
  fr: {
    home: "Accueil", browse: "Parcourir", watchlist: "Ma liste", genres: "Genres",
    search: "Rechercher…", signIn: "Connexion", signOut: "Déconnexion", settings: "Paramètres",
    profile: "Profil", appearance: "Apparence", language: "Langue", account: "Compte",
    theme: "Thème", dark: "Sombre", light: "Clair", save: "Enregistrer", saving: "Enregistrement…",
    displayName: "Nom affiché", bio: "Bio", email: "E-mail", avatar: "Photo de profil",
    upload: "Téléverser", change: "Changer", remove: "Retirer",
  },
  de: {
    home: "Start", browse: "Stöbern", watchlist: "Merkliste", genres: "Genres",
    search: "Suchen…", signIn: "Anmelden", signOut: "Abmelden", settings: "Einstellungen",
    profile: "Profil", appearance: "Darstellung", language: "Sprache", account: "Konto",
    theme: "Thema", dark: "Dunkel", light: "Hell", save: "Speichern", saving: "Speichert…",
    displayName: "Anzeigename", bio: "Bio", email: "E-Mail", avatar: "Profilbild",
    upload: "Hochladen", change: "Ändern", remove: "Entfernen",
  },
};

type Ctx = {
  theme: Theme; setTheme: (t: Theme) => void; toggleTheme: () => void;
  lang: Lang; setLang: (l: Lang) => void;
  t: (k: string) => string;
};

const PrefCtx = createContext<Ctx>({} as Ctx);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const t = (typeof localStorage !== "undefined" && (localStorage.getItem("theme") as Theme)) || "dark";
    const l = (typeof localStorage !== "undefined" && (localStorage.getItem("lang") as Lang)) || "en";
    setThemeState(t);
    setLangState(l);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    try { localStorage.setItem("lang", lang); } catch {}
  }, [lang]);

  const t = (k: string) => DICT[lang]?.[k] ?? DICT.en[k] ?? k;

  return (
    <PrefCtx.Provider value={{
      theme, setTheme: setThemeState, toggleTheme: () => setThemeState(theme === "dark" ? "light" : "dark"),
      lang, setLang: setLangState, t,
    }}>
      {children}
    </PrefCtx.Provider>
  );
}

export const usePreferences = () => useContext(PrefCtx);
