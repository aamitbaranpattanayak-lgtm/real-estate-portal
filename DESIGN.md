# HAVEN — Design System & Visual Specification

## 1. Visual Foundation & Current Tokens

### Typography
- **Primary Typeface**: `Plus Jakarta Sans` (Google Fonts, weights 300 to 800).
- **Hierarchy in Use**:
  - Display / Hero: `text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.12]`
  - Section Headings: `text-3xl sm:text-4xl font-bold tracking-tight`
  - Card Titles: `text-base font-semibold line-clamp-1`
  - Prices: `text-xl font-bold tracking-tight`
  - Overline / Eyebrows: `text-xs font-bold uppercase tracking-[0.2em]`
  - Micro-labels: `text-[10px]` to `text-[11px] uppercase tracking-wider`
  - Body: `text-xs sm:text-sm text-stone-500 leading-relaxed`

### Color Palette (Current State)
- **Background**: `#FAFAF8` (Warm Off-White / Natural Paper)
- **Surface**: `#FFFFFF` (Pure White)
- **Primary Brand**: `#14532D` (Deep Forest Green / Tailwind Green-900)
- **Primary Hover**: `#166534` (Tailwind Green-800)
- **Accent**: `#22C55E` (Emerald-500 / Electric Leaf)
- **Text Primary**: `#111827` (Near Black / Gray-900)
- **Text Secondary**: `#6B7280` (Muted Slate / Gray-500)
- **Border Subtle**: `#F3F4F6` / `stone-200/80`
- **Dark Sections**: `#0D2818` (Deep Woodland Green on Destination Grid) and `#111827` (Dark Charcoal Footer)

---

## 2. Component Primitives & Current Patterns

### Buttons
- **Primary CTA**: `bg-[#14532D] hover:bg-[#166534] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-all`
- **Secondary / Filter Pill**: `bg-stone-50 text-stone-700 border border-stone-200 text-xs font-bold px-4 py-2 rounded-xl hover:bg-stone-100`
- **Icon / Favorite Button**: `p-2.5 rounded-full bg-white/80 backdrop-blur-md text-stone-700 hover:text-rose-500`

### Input Fields & Controls
- **Standard Input**: `w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D]`
- **Select Dropdown**: Native styled `<select>` with rounded-xl and stone border.
- **Search Bar**: Floating input with embedded Lucide icons and inline action button.

### Cards & Surfaces
- **Property Card**: `bg-white rounded-2xl border border-stone-200/70 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col`
- **Modal Surface**: `bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden`
- **Status Badges**: `rounded-full text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider`

---

## 3. Layout Grid & Breakpoints
- **Breakpoints**: Tailwind standard (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
- **Container Max-Width**: `max-w-7xl mx-auto px-6 lg:px-12`.
- **Card Grids**: Standard 3-column responsive layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8`).
- **Catalog Layout**: 4-column layout (`grid-cols-1 lg:grid-cols-4`) with 1-column sticky desktop filter sidebar + 3-column property card grid.
