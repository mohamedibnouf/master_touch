/** Storage key shared by bootstrap script and ThemeProvider. */
export const THEME_STORAGE_KEY = "theme";

/** Runs before paint in root layout (Server Component) to avoid theme flash. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var m=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var r=t==="system"?m:t;var d=document.documentElement;d.classList.remove("light","dark");d.classList.add(r);d.style.colorScheme=r;}catch(e){}})();`;
