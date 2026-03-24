# GEMINI.md - EstateHub Frontend

## Project Overview
EstateHub is a modern, AI-powered Real Estate CRM frontend built with **React 19**, **TypeScript**, and **Vite**. The application features a clean, professional UI designed for real estate professionals to manage leads and close deals more effectively.

### Main Technologies
- **Framework:** React 19 (Functional Components)
- **Build Tool:** Vite
- **Language:** TypeScript
- **HTTP Client:** Axios (with interceptors for JWT)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Styling:** Vanilla CSS with CSS Variables and utility classes (see `src/index.css`)

### Architecture
The project follows a standard React component-based architecture:
- `src/main.tsx`: Entry point.
- `src/App.tsx`: Main layout and routing.
- `src/api/`: API client and integration logic.
- `src/components/`: Reusable UI components (Hero, Features, Pricing, LoginForm).
- `src/index.css`: Global styles and design tokens (colors, spacing, typography).

## Mandatory Engineering Standards

### Validation & Error Handling
- **Preemptive Validation**: ALWAYS validate form inputs on the frontend before attempting an API call. This improves UX and reduces unnecessary server load.
- **Field-Specific Errors**: NEVER display field-level validation errors in a general alert at the top of the form. Use the `mapBackendErrors` utility to assign errors to their respective fields and display them directly under the input components.
- **Input Consistency**: All form inputs should use the standard `Input`, `Select`, or `Textarea` components which already support an `error` prop for consistent styling.

## Building and Running

### Prerequisites
- Node.js (Latest LTS recommended)
- npm

### Development Commands
- **Install Dependencies:** `npm install`
- **Start Dev Server:** `npm run dev` (runs on [http://localhost:5173](http://localhost:5173))
- **Build for Production:** `npm run build`
- **Lint Code:** `npm run lint`
- **Preview Production Build:** `npm run preview`

## Development Conventions

### Styling
- **CSS Variables:** Use the design tokens defined in `:root` within `src/index.css` for consistency (e.g., `var(--primary)`, `var(--radius)`).
- **Utility Classes:** Leverage existing utility classes like `.container`, `.grid`, `.btn`, and `.card`.
- **Inline Styles:** Used occasionally for specific layout adjustments within components, but preference is for CSS classes.

### Components
- Use **Functional Components** with TypeScript interfaces for props.
- Keep components focused and modular within the `src/components/` directory.
- Use `framer-motion` for smooth entrance animations and interactive elements.

### Icons
- Use `lucide-react` for all iconography.

### State Management
- Currently using React's built-in hooks (`useState`, etc.). For more complex state, consider Context API or a dedicated library if needed.
