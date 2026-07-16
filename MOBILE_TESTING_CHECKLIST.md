# clar1ty Mobile Testing Checklist

## Viewports to Test
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] Android Galaxy S21 (360px)
- [ ] Android Pixel 6 (412px)
- [ ] Tablet iPad (768px)
- [ ] Tablet iPad Pro (1024px+)

## Navigation & Header
- [ ] Navigation bar is sticky and accessible
- [ ] Mobile hamburger menu toggles correctly
- [ ] Logo/home link is appropriately sized
- [ ] Account button/menu is finger-friendly (44px+ touch target)
- [ ] Navigation links don't overlap on mobile
- [ ] Breadcrumbs are readable on mobile (not too condensed)

## Typography & Readability
- [ ] Heading sizes scale appropriately (hero to sm breakpoints)
- [ ] Body text is readable (16px minimum on mobile)
- [ ] Line height is comfortable (1.5-1.6 for body)
- [ ] Line length is not too wide (max ~65 chars for readability)
- [ ] No text is cut off or overlapping
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)

## Layout & Spacing
- [ ] Content has proper padding on mobile (px-4 minimum)
- [ ] Sections stack vertically on mobile (flex-col)
- [ ] Grid layouts reduce to 1-2 columns on mobile
- [ ] Margins/gaps are proportional (not too tight or loose)
- [ ] No horizontal scrolling needed (except deliberate carousels)
- [ ] Buttons stack vertically or inline appropriately

## Forms & Inputs
- [ ] Input fields are tall enough (h-10 md:h-12)
- [ ] Touch targets are 44x44px minimum
- [ ] Labels are above inputs (not overlaid)
- [ ] Placeholders are visible (contrast check)
- [ ] Error messages are clear and positioned well
- [ ] Form buttons are full-width on mobile (or stacked)
- [ ] Mobile keyboard doesn't cover form fields
- [ ] Number inputs show numeric keyboard
- [ ] Email inputs show email keyboard

## Images & Media
- [ ] Images scale responsively (no overflow)
- [ ] Image sizes are optimized for mobile (use responsive images)
- [ ] Alt text is present on all images
- [ ] Lazy loading is implemented for below-fold images
- [ ] Videos are responsive and don't overflow container
- [ ] Image aspect ratios are maintained

## Buttons & CTAs
- [ ] All buttons meet 44x44px touch target minimum
- [ ] Button text doesn't wrap awkwardly
- [ ] Primary CTA is prominent and accessible
- [ ] Hover states work with touch (focus states visible)
- [ ] Disabled states are clear and non-interactive
- [ ] Icon buttons have adequate padding

## Pages to Test

### Home/Landing Page
- [ ] Hero section is visually balanced on mobile
- [ ] Features section cards stack properly
- [ ] Testimonials/social proof is readable
- [ ] CTA buttons are prominent
- [ ] Newsletter signup form is usable
- [ ] Footer is organized and scrollable

### Pricing Page
- [ ] Plan cards stack vertically on mobile
- [ ] Comparison table is scrollable (not cut off)
- [ ] PAYG credit packs are readable in grid
- [ ] FAQ items expand/collapse on mobile
- [ ] CTA buttons are accessible

### Profile Page
- [ ] Credit balance is clearly displayed
- [ ] Account settings form is usable
- [ ] Billing info is readable
- [ ] Account actions buttons don't overflow
- [ ] Sign out button is easily accessible

### Enhance Studio
- [ ] Step indicator is readable
- [ ] Preset cards stack nicely
- [ ] Mode selection is clear
- [ ] File upload area is touch-friendly
- [ ] Processing status is visible
- [ ] Results comparison slider works on touch
- [ ] Download button is accessible

### FAQ/Support
- [ ] Expandable items work on mobile
- [ ] Search/filter is usable
- [ ] Contact form is accessible
- [ ] Links are properly spaced

## Performance
- [ ] Pages load quickly on 4G (simulate with DevTools)
- [ ] Lighthouse Mobile Score >80
- [ ] Largest Contentful Paint (LCP) <2.5s
- [ ] Cumulative Layout Shift (CLS) <0.1
- [ ] First Input Delay (FID) <100ms
- [ ] Images are properly optimized (WebP support)

## Accessibility
- [ ] Touch targets are 44x44px minimum
- [ ] Focus states are visible on all interactive elements
- [ ] Color is not the only means of conveying info
- [ ] Text has sufficient contrast (WCAG AA)
- [ ] Forms have proper labels and hints
- [ ] Error messages are associated with inputs
- [ ] Skip navigation link works

## Orientation
- [ ] Portrait orientation works correctly
- [ ] Landscape orientation is usable
- [ ] No content is hidden based on orientation
- [ ] Layout adapts appropriately to orientation changes

## Common Mobile Issues to Check
- [ ] [ ] No text is too small to read (minimum 16px)
- [ ] [ ] No elements overflow the viewport
- [ ] [ ] Touch areas are appropriately sized (not too close together)
- [ ] [ ] Modals/dialogs don't cover critical content
- [ ] [ ] Videos/animations don't cause jank
- [ ] [ ] Mobile keyboard doesn't cover important form fields
- [ ] [ ] Links have adequate spacing (minimum 8px)
- [ ] [ ] Icons scale properly and are recognizable
- [ ] [ ] Spinners/loading states are visible
- [ ] [ ] Error states are clear and actionable

## Browser Testing
- [ ] Safari (iOS)
- [ ] Chrome (Android)
- [ ] Firefox (Android)
- [ ] Samsung Internet

## Device-Specific Issues
- [ ] Notch/punch-hole handling (viewport-fit: cover)
- [ ] Safe area insets are respected
- [ ] Status bar doesn't interfere with content
- [ ] Home indicator on iOS doesn't cover buttons

## Testing Tools
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Lighthouse (Mobile audit)
- WebAIM Color Contrast Checker
- Real device testing (iPhone, Android)

## Sign-Off Checklist
- [ ] All pages tested on minimum 3 mobile devices
- [ ] Lighthouse Mobile Score >80 on all pages
- [ ] No horizontal scrolling (except deliberate)
- [ ] All interactive elements are touch-friendly (44x44px)
- [ ] Accessibility requirements met (WCAG AA)
- [ ] Performance targets met (LCP <2.5s, CLS <0.1)
- [ ] Forms are usable on mobile
- [ ] Images/media display correctly
- [ ] No content is hidden or inaccessible on mobile
