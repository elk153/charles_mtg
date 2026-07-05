# React Folder Structures

## The Ultimate Modern React Folder Structure

```
my-react-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/             # Global static assets (images, icons, fonts)
│   ├── components/         # Shared, global UI components (buttons, inputs)
│   ├── config/             # Global configuration (API clients, constants)
│   ├── context/            # Global React Contexts
│   ├── features/           # Feature-based modules (The core of your app)
│   │   ├── auth/
│   │   │   ├── components/ # Auth-specific components (LoginForm)
│   │   │   ├── hooks/      # Auth-specific hooks (useAuth)
│   │   │   ├── services/   # Auth API calls
│   │   │   └── index.ts    # Public API for the auth feature
│   │   └── dashboard/
│   ├── hooks/              # Shared global custom hooks
│   ├── layouts/            # Layout components (Sidebar, Navbar, AuthLayout)
│   ├── routes/             # Routing configuration and page views
│   ├── services/           # Global API services / SDK initializations
│   ├── stores/             # Global state management (Zustand, Redux)
│   ├── styles/             # Global styles, Tailwind config, themes
│   ├── utils/              # Helper functions and formatters
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Application entry point
├── .env                    # Environment variables
├── package.json
└── tsconfig.json
```

### What to Locate Where

1. `src/components/` (Global UI)

Put dumb, reusable, and generic UI components here. These shouldn't contain business logic.

  * Examples: `Button.tsx`, `Modal.tsx`, `InputField.tsx`, `Table.tsx`.
  * Rule of thumb: If you can copy-paste this component into a completely different project and it still works, it belongs here.

2. `src/features/` (The Core Engine)

This is where 80% of your actual application logic lives. Split this directory by domain or user feature.

* How it works: If you have an e-commerce app, you might have features like cart/, products/, and checkout/.
* The `index.ts` file: Each feature should have an `index.ts` file acting as a "gatekeeper". It should export only what the rest of the app needs to see, keeping the feature's internal workings isolated.

3. `src/hooks/` & `src/utils/` (The Helpers)

* `hooks/`: Global custom hooks that aren't tied to a specific feature. Examples: `useDebounce`, `useLocalStorage`, `useWindowSize`.
* `utils/`: Pure, synchronous utility functions. Examples: `formatCurrency.ts`, `dateHelpers.ts`, `validateEmail.ts`.

4. `src/layouts/` & `src/routes/` (The Skeleton)

* `layouts/`: Structural components that wrap your pages. Examples: `RootLayout` (with top nav and sidebar), `AuthLayout` (centered card for login/signup).
* `routes/`: This is where you map your URLs to specific page components. In modern React, you might have an `AppRoutes.tsx` file here that imports pages like `Home.tsx`, `Profile.tsx`, and `NotFound.tsx`.

5. `src/stores/` & `src/context/` (The Brain)

* `stores/`: If you are using a global state manager like Zustand or Redux, keep your global slices/stores here (e.g., `themeStore.ts`, `notificationStore.ts`).
* `context/`: If you prefer native React Context for global app states (like a `ThemeContext`), house them here.

### 3 Golden Rules for Modern React Architecture

#### 💡 1. Co-locate as much as possible

Keep files that change together close together. If a component uses a specific CSS file or an icon that nothing else uses, put it right next to that component, not in a global folder.

#### 🛠️ 2. Avoid deeply nested folders

Try not to go deeper than 3 or 4 levels in your folder structure. If you find yourself importing a file like `../../../../../../components/Button`, it's time to flatten things out or set up absolute imports (so you can just type `@/components/Button`).

#### 🤫 3. Keep features independent

A feature (like `features/comments`) should rarely import something from inside another feature (like `features/analytics/internal-helper`). If two features need the exact same component or logic, move that shared piece up to the global `src/components/` or `src/hooks/` directories.

## The Simple Project Folder Structure


```

my-simple-app/
├── public/
├── src/
│   ├── assets/        # Images, SVG icons, and global styles
│   ├── components/    # Reusable UI pieces (Button, Card, Input)
│   ├── hooks/         # Custom React hooks (if you need them)
│   ├── views/         # The actual pages/screens of your app
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   └── Detail.tsx
│   ├── App.tsx        # App layout and basic routing
│   └── main.tsx       # Entry point
├── package.json
└── vite.config.ts
```

### Where to Put Things in a Simple Project

1. `src/views/` (Your Pages)

Instead of dividing your app by abstract "features," divide it by what the user sees on the screen.

* If your app has a home screen, an about page, and a settings page, create `Home.tsx`, `About.tsx`, and `Settings.tsx` right inside the views/ folder.
* Keep the specific logic, state, and minor sub-components for that page inside that single file.

2. `src/components/` (Shared Elements)

Only put a component here if it is used by more than one view.

* If both `Home.tsx` and `Detail.tsx` need a stylized button, create `src/components/Button.tsx`.
* If a component is only used on the Home page, just write it at the bottom of `Home.tsx` or create a file right next to it. Don't clutter your global components folder early on.

3. `src/App.tsx` (The Glue)

In a simple project, `App.tsx` is perfect for holding your global state (like a dark/light theme toggle) or managing your routing (using something lightweight like `react-router-dom` or `wouter`).

### The Rule of Evolution: When to Scale Up

Start with this simple setup. Do not over-engineer your folders on day one.

As your project grows, listen to the "pain points" of your directory:

Grow to `hooks/`: When your page component gets over 200 lines long because of useState and useEffect data fetching, move that logic out into a custom hook.

Grow to `features/`: When you notice you have 5 different files all handling "Authentication" or "Shopping Cart" logic scattered across different views, bundle them together into a feature folder.