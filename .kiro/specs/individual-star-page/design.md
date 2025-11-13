# Design Document

## Overview

The individual star page feature adds a dedicated detail view for each star in the system. Users can navigate to `/star/[id]` to view comprehensive information about a specific star, with a back button to return to the home page. The design leverages Next.js 14+ App Router features including dynamic routing, loading states, and error handling, while maintaining visual consistency with the existing star card design.

## Architecture

### Routing Structure

The feature uses Next.js App Router dynamic routing:

```
app/
├── star/
│   └── [id]/
│       ├── page.tsx          # Main star detail page
│       ├── loading.tsx        # Loading UI (Next.js Suspense)
│       └── error.tsx          # Error boundary
```

### Data Flow

1. User navigates to `/star/[id]` (e.g., `/star/42`)
2. Next.js extracts the `id` parameter from the URL
3. Page component calls `getStarById(id)` server-side
4. While loading, `loading.tsx` displays skeleton UI
5. On success, star data renders in the page
6. On error (not found or database failure), `error.tsx` handles display

### Component Hierarchy

```
StarDetailPage (app/star/[id]/page.tsx)
├── BackButton (inline component)
├── Star Photo Section
├── Star Information Section
│   ├── Star Name
│   ├── Details Grid (Constellation, Distance, Magnitude)
│   └── Full Description
└── Error State (handled by error.tsx)
```

## Components and Interfaces

### 1. Star Detail Page (`app/star/[id]/page.tsx`)

**Purpose**: Main page component that fetches and displays star data

**Props**:
```typescript
interface PageProps {
  params: Promise<{ id: string }>;
}
```

**Key Features**:
- Server component (default in App Router)
- Fetches star data using `getStarById()`
- Handles not found case (star doesn't exist)
- Renders star information with space theme styling

**Layout Structure**:
- Full-page layout with galaxy background (inherited from root layout)
- Back button at top-left
- Centered content container (max-width for readability)
- Large star photo (hero section)
- Information grid below photo

### 2. Loading State (`app/star/[id]/loading.tsx`)

**Purpose**: Displays while star data is being fetched

**Implementation**:
- Uses Next.js Suspense boundary (automatic with `loading.tsx`)
- Skeleton UI matching the star detail page layout
- Pulsing animation similar to `StarGalleryLoading`
- Space-themed colors (slate/indigo)

**Structure**:
```
- Back button skeleton
- Large photo skeleton (aspect-video)
- Name skeleton
- Details grid skeleton
- Description skeleton (multiple lines)
```

### 3. Error Handling (`app/star/[id]/error.tsx`)

**Purpose**: Handles errors including "star not found" and database failures

**Props**:
```typescript
interface ErrorProps {
  error: Error;
  reset: () => void;
}
```

**Features**:
- Client component (required for error boundaries)
- Displays user-friendly error message
- "Return to Home" button with space theme styling
- Distinguishes between "not found" and other errors

### 4. Back Button Component

**Purpose**: Navigation control to return to home page

**Implementation**:
- Uses Next.js `Link` component for client-side navigation
- Positioned at top-left with fixed or absolute positioning
- Space-themed styling:
  - Indigo/slate gradient background
  - Border with indigo glow
  - Hover effects (brightness, shadow)
  - Left arrow icon (← or SVG)
- Accessible (keyboard navigation, ARIA labels)

**Styling**:
```css
- Background: gradient from indigo-600 to indigo-800
- Border: indigo-500 with glow effect
- Text: slate-50
- Hover: increased brightness and shadow
- Padding: comfortable click target (min 44x44px)
```

## Data Models

### Star Interface (Existing)

```typescript
interface Star {
  id: number;
  name: string;
  photo_url: string;
  description: string;
  distance_light_years: number;
  constellation: string;
  magnitude: number;
  created_at: string;
}
```

No new data models required. The feature uses the existing `Star` interface and `getStarById()` function from `lib/supabase/stars.ts`.

## Styling and Theme

### Color Palette (Matching Star Card)

- **Background Gradients**: `from-slate-900/80 to-indigo-950/80`
- **Borders**: `border-indigo-500/30`
- **Shadows**: `shadow-indigo-500/20`, hover: `shadow-indigo-400/40`
- **Text Colors**:
  - Primary (headings): `text-slate-50`
  - Secondary (labels): `text-slate-400`
  - Accent (values): `text-indigo-200`
  - Body: `text-slate-300`

### Layout Specifications

**Page Container**:
- Max width: `max-w-4xl` (64rem)
- Centered: `mx-auto`
- Padding: `px-6 py-8`
- Min height: `min-h-screen`

**Back Button**:
- Position: Top-left, `absolute` or in flex container
- Margin: `m-6` or `mt-6 ml-6`
- Size: `px-6 py-3` (comfortable click target)

**Star Photo**:
- Aspect ratio: `aspect-[16/9]` or `aspect-video`
- Width: Full container width
- Border radius: `rounded-xl`
- Object fit: `object-cover`

**Information Section**:
- Padding: `p-8`
- Background: Same gradient as Star Card
- Border radius: `rounded-xl`
- Border: `border border-indigo-500/30`

**Details Grid**:
- Grid: `grid-cols-3` (3 columns for constellation, distance, magnitude)
- Gap: `gap-6`
- Responsive: `grid-cols-1 sm:grid-cols-3`

### Typography

- **Star Name**: `text-4xl font-bold` (larger than card)
- **Section Labels**: `text-xs uppercase tracking-wider`
- **Detail Values**: `text-lg font-medium`
- **Description**: `text-base leading-relaxed`

## Error Handling

### Error Scenarios

1. **Star Not Found** (ID doesn't exist)
   - Message: "Star not found. This star may have been removed or the link is incorrect."
   - Action: "Return to Home" button
   - Status: Graceful, non-blocking

2. **Database Error** (Connection or query failure)
   - Message: "Unable to load star data. Please try again later."
   - Action: "Return to Home" button + "Try Again" button (uses `reset()`)
   - Status: User-friendly, with recovery option

3. **Invalid ID** (Non-numeric or malformed)
   - Handled by `getStarById()` returning null
   - Treated as "Star Not Found"

### Error UI Design

- Centered content
- Space-themed styling (matching overall theme)
- Clear, concise error message
- Prominent action buttons
- Icon or illustration (optional, e.g., broken star icon)

## Accessibility

### Semantic HTML

- `<main>` for page content
- `<article>` for star information
- `<h1>` for star name
- `<dl>`, `<dt>`, `<dd>` for details grid (optional, semantic)
- `<button>` or `<a>` for back button

### ARIA Labels

- Back button: `aria-label="Return to home page"`
- Star photo: Descriptive `alt` text including name, constellation, distance
- Error state: `role="alert"` for error messages

### Keyboard Navigation

- Back button: Focusable, operable with Enter/Space
- All interactive elements: Visible focus indicators
- Tab order: Logical (back button → content)

### Focus Management

- Focus indicators: `focus:ring-2 focus:ring-indigo-400 focus:outline-none`
- High contrast: Ensure text meets WCAG AA standards

## Testing Strategy

### Unit Tests

- Test `getStarById()` function (already exists)
- Test error handling logic
- Test component rendering with mock data

### Integration Tests

- Test navigation from home page to star detail page
- Test back button navigation
- Test loading state display
- Test error state display

### Manual Testing Checklist

1. Navigate to valid star detail page
2. Verify all star information displays correctly
3. Click back button, verify navigation to home
4. Navigate to invalid star ID, verify error handling
5. Test keyboard navigation (Tab, Enter)
6. Test on mobile viewport (responsive design)
7. Test with slow network (loading state)
8. Test with database error (error boundary)

### Accessibility Testing

- Screen reader testing (NVDA/JAWS)
- Keyboard-only navigation
- Color contrast verification (WCAG AA)
- Focus indicator visibility

## Implementation Notes

### Next.js Features Used

1. **App Router**: Dynamic routing with `[id]` folder
2. **Server Components**: Default for page.tsx (data fetching)
3. **Suspense Boundaries**: Automatic with loading.tsx
4. **Error Boundaries**: Automatic with error.tsx
5. **Image Optimization**: Next.js `<Image>` component

### Performance Considerations

- Server-side data fetching (no client-side loading delay)
- Image optimization with Next.js Image component
- Minimal JavaScript (mostly server components)
- Efficient CSS (Tailwind utility classes)

### Code Reusability

- Reuse existing `getStarById()` function
- Reuse color/styling patterns from `StarCard`
- Reuse loading skeleton patterns from `StarGalleryLoading`
- Consistent error handling patterns

## Future Enhancements (Out of Scope)

- Share button for star details
- Related stars section
- Star comparison feature
- Breadcrumb navigation
- Star favoriting/bookmarking
- Comments or notes on stars
