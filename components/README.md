# Components Directory

## Overview
This directory contains reusable React components organized by function. All components follow TypeScript best practices with full type safety.

## Component Categories

### UI Components (`/ui`)
Base UI components built with shadcn/ui and Tailwind CSS:
- `Button` - Accessible button component with variants
- `Card` - Container component for card layouts
- `Dialog` - Modal dialog component
- `Input` - Form input with accessibility support
- `Slider` - Range slider input
- `Toaster` - Toast notification system
- `Toast` - Individual toast message

### Media Components
- `ImageComparisonSlider` - Interactive before/after image comparison
- `ImageComparisonHybrid` - Hybrid comparison with multiple modes
- `LiveComparison` - Real-time image comparison viewer

### Auth Components (`/auth`)
- `LoginModal` - Authentication modal for signup/login
- `AuthProvider` - Context provider for auth state
- `ProtectedRoute` - Route guard for authenticated pages

### Theme Components
- `ThemeProvider` - Theme context provider (dark/light mode)
- `ThemeSwitcher` - UI control to toggle themes

### Schema Components (`/schemas`)
JSON-LD structured data for SEO:
- `OrganizationSchema` - Organization details schema
- `SoftwareAppSchema` - Application features schema
- `BreadcrumbSchema` - Navigation breadcrumb schema
- `FAQSchema` - FAQ rich snippets schema

## Component Best Practices

### TypeScript
- All props must be typed with interfaces
- Use `React.FC<Props>` for functional components
- Export prop interfaces for reusability

Example:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export function Button({ variant = 'primary', loading, ...props }: ButtonProps) {
  // Component code
}
```

### Accessibility
- Use semantic HTML (`button`, `a`, `nav`, etc.)
- Include ARIA labels for interactive elements
- Ensure keyboard navigation support
- Test with screen readers (NVDA, JAWS)

### Styling
- Use Tailwind CSS for styling
- Follow the project's color scheme
- Maintain responsive design (mobile-first)
- Use CSS-in-JS for dynamic styles only when necessary

### Performance
- Use React.memo for expensive components
- Implement lazy loading where appropriate
- Minimize prop drilling with context
- Use useCallback for memoized callbacks

## Common Patterns

### Image Optimization
All image components should:
```typescript
<Image
  src={url}
  alt="Descriptive text"
  fill // for container queries
  sizes="(min-width: 1024px) 50vw, 100vw" // responsive sizes
  priority={isAboveFold} // preload critical images
  className="object-cover"
/>
```

### Form Components
Always validate inputs:
```typescript
interface FormProps {
  onSubmit: (data: FormData) => Promise<void>
}

export function Form({ onSubmit }: FormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Validation logic
    // Call onSubmit
  }
}
```

## Adding New Components

1. Create component file: `/components/ComponentName.tsx`
2. Define prop interface
3. Add TypeScript types
4. Include JSDoc comments
5. Export component
6. Add to appropriate category
7. Update this README

Example template:
```typescript
'use client'

import React from 'react'

/**
 * ComponentName - Brief description
 * @param props - Component props
 * @returns React component
 */
interface ComponentNameProps {
  // Props definition
}

export function ComponentName(props: ComponentNameProps) {
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}

/**
 * Export type for prop extension
 */
export type { ComponentNameProps }
```

## Component Testing

All components should be testable with:
- Unit tests for logic
- Integration tests for interactions
- Accessibility tests (WCAG AA minimum)
- Visual regression tests (optional)

Run tests:
```bash
npm run test
```

## Performance Monitoring

Monitor component performance:
- Use React DevTools Profiler
- Check Core Web Vitals impact
- Profile with Lighthouse
- Monitor bundle size contribution

## Component Versioning

When making breaking changes:
1. Update component prop interface
2. Update TypeScript types
3. Update documentation in README
4. Update all usages in the app
5. Increment version in package.json patch version

## Related Documentation

- [Accessibility Guidelines](./ACCESSIBILITY.md)
- [Styling Guide](../STYLING.md)
- [TypeScript Guide](../TS_GUIDE.md)
