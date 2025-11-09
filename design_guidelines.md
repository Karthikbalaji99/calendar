# Design Guidelines: Couples Calendar Web Application

## Design Approach
**Reference-Based with Custom Theming**: Drawing inspiration from Notion's flexible layouts and Linear's clean data presentation, enhanced with a playful panda-and-cookie theme. This is a personal, emotion-driven application requiring warm, inviting aesthetics balanced with functional data management.

## Core Design Principles
1. **Dual Identity**: Every feature supports Panda, Cookie, and Both categories with clear visual distinction
2. **Playful Professionalism**: Cute theme elements without sacrificing usability or readability
3. **Interactive Delight**: Smooth transitions, hover states, and micro-interactions enhance emotional connection
4. **Content-First**: Calendar, images, and data visualization are heroes; chrome is minimal

## Typography System
- **Primary Font**: Quicksand (rounded, friendly) for headings and primary UI via Google Fonts
- **Secondary Font**: Inter for body text and data displays
- **Hierarchy**:
  - Page Titles: text-4xl font-bold
  - Section Headers: text-2xl font-semibold
  - Card Titles: text-lg font-medium
  - Body Text: text-base
  - Captions/Meta: text-sm text-gray-600

## Layout & Spacing System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, and 12 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: gap-6 to gap-8
- Page margins: px-6 md:px-8
- Card spacing: space-y-4

**Grid System**:
- Gratitude Logs: Two equal columns (grid-cols-2) with gap-6
- Memories Gallery: Responsive masonry grid (grid-cols-2 md:grid-cols-3 lg:grid-cols-4)
- Task List: Single column with expandable cards
- Habit Tracker: Mixed layout with graphs above, daily checklist below

## Component Library

### Calendar (Homepage)
- Full-screen monthly view with date cells using aspect-square for perfect squares
- Each date cell shows mini indicators for events (small dots or icons)
- Hover state reveals floating card preview with event details, mini thumbnails
- Navigation header with month/year selector and today button
- Filter toggles (Panda/Cookie/Both) in top-right corner with toggle switch UI

### Navigation
- Persistent sidebar (w-64) with icon+label navigation items
- Tabs: Calendar, Gratitude, Memories, Journal, Tasks, Habits
- Each tab has corresponding panda/cookie themed icon
- Active state: filled background with subtle left border accent

### Gratitude Logs
- Two-column layout with clear headers "Panda → Cookie" and "Cookie → Panda"
- Daily entry cards with date, text area, and save button
- Timeline view showing past entries as stacked cards
- Entry cards: rounded corners (rounded-lg), elevation (shadow-md)

### Memories Gallery
- Masonry grid of image cards with captions
- Upload button (large, prominent) with drag-and-drop zone
- Each card shows image, date badge, and attribution (Panda/Cookie/Both)
- Lightbox modal for full-size viewing with navigation arrows

### Journal Entries
- Daily view with large text editor area
- Toolbar for text formatting, image uploads, sticker insertion
- Sticker palette as floating panel with draggable stickers
- Save button and auto-save indicator

### Task List & Habit Tracker
- Task cards with checkbox, title, assignee badge, due date
- Completion progress bar at top
- Habit tracker: grid of habits with daily checkboxes
- Graph visualization: line chart for trends, streak counter with celebratory animations
- Interactive charts using minimal, clean design

### Filter System
- Consistent filter bar across all views with three options:
  - "Panda" (panda icon)
  - "Cookie" (cookie icon)  
  - "Both" (combined icon)
- Toggle button group design with active state highlighting

## Theme Elements
- **Panda Identity**: Use bamboo leaf accents, paw print subtle patterns
- **Cookie Identity**: Use cookie crumb textures, chocolate chip dot patterns
- **Shared Elements**: Heart icons for combined items, intertwined design elements
- Use custom illustrated icons throughout (panda face, cookie, bamboo, hearts)

## Interaction Patterns
- Hover effects: Subtle scale transforms (scale-105), shadow elevation increases
- Transitions: Use duration-200 for micro-interactions, duration-300 for modals
- Loading states: Skeleton screens for data-heavy views
- Success feedback: Toast notifications with themed icons
- Form validation: Inline error messages in red-500 below inputs

## Images
- **Memories**: User-uploaded photos are primary content; display in cards with 16:9 or 1:1 aspect ratios
- **Journal Stickers**: Small decorative images/emojis users can place freely
- **Theme Graphics**: Subtle background patterns with panda/cookie motifs at low opacity (10-20%)
- **No Hero Image**: This is an application dashboard, not a marketing page

## Accessibility & Quality Standards
- Minimum touch target size: 44x44px for mobile
- Color contrast ratio: 4.5:1 for text, 3:1 for UI components
- Keyboard navigation: Full support with visible focus states (ring-2 ring-offset-2)
- Screen reader labels for all interactive elements
- Responsive breakpoints: mobile (base), tablet (md:768px), desktop (lg:1024px)