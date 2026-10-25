import { useTheme } from "../../app/AppProviders/ThemeContext.ts";
import IconMoon from "../../assets/IconMoon.tsx";
import IconSun from "../../assets/IconSun.tsx";
import "./FloatingThemeToggle.css";

/**
 * Switches the whole app between the dark and light theme.
 *
 * `useTheme` is a custom hook that reads the theme state shared by
 * ThemeProvider through React context. Changing it there updates
 * <html data-theme="...">, which theme.css turns into new colors.
 *
 * The icon shows the theme you will GET when you click, and the
 * aria-label says the same in words for screen readers.
 */
export default function FloatingThemeToggle() {
  const { theme, setTheme } = useTheme();

  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextTheme} theme`;

  return (
    <button
      type="button"
      className="floating-theme-toggle"
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      title={label}
    >
      {nextTheme === "light" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
