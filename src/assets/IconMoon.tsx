/**
 * Filled crescent moon, drawn with currentColor so the parent CSS sets
 * its color. Sized with `1em`, like IconSun.
 * Shown in light mode on the FloatingNavBar theme toggle.
 */
export default function IconMoon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
      />
    </svg>
  );
}
