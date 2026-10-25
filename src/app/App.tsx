import { useEffect } from "react";
import NavBar from "../features/navigation/NavBar.jsx";

declare global {
  interface Window {
    reactIsReady: boolean;
  }
}

export default function App() {
  useEffect(() => {
    window.reactIsReady = true;

    const splashLogo = document.getElementById("splash-logo");
    const splashBackground = document.getElementById("splash-background");
    const root = document.getElementById("root");

    if (!splashLogo || !splashBackground || !root) {
      return;
    }

    // Trigger the visual transition: both splash background and logo
    // will transition their opacity to the same level to keep a uniform color.
    splashBackground.classList.add("ready");
    splashLogo.classList.add("ready");

    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== splashBackground || event.propertyName !== "opacity") return;

      // Reveal the app root and move the splash behind the app content
      root.classList.add("visible");
      splashBackground.classList.add("background");

      // Clean up listener
      splashBackground.removeEventListener("transitionend", handleTransitionEnd);
    };

    // Attach to splashBackground so we observe the container opacity end
    splashBackground.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      splashBackground.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, []);

  return (
    <div className="App">
      <NavBar />
    </div>
  );
}

export function Home() {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the home page of the application.</p>
    </div>
  );
}

export function AdvancedSearch() {
  return (
    <div>
      <h1>Advanced Search</h1>
      <p>This is the advanced search page of the application.</p>
    </div>
  );
}

export function Favorites() {
  return (
    <div>
      <h1>Favorites</h1>
      <p>This is the favorites page of the application.</p>
    </div>
  );
}

export function Collection() {
  return (
    <div>
      <h1>Collection</h1>
      <p>This is the collection page of the application.</p>
    </div>
  );
}

export function Decks() {
  return (
    <div>
      <h1>Decks</h1>
      <p>This is the decks page of the application.</p>
    </div>
  );
}