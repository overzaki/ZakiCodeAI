# Redux Editor State Management

This document describes the Redux-based state management system for the editor functionality, which replaces the previous URL parameter approach.

## Overview

The editor state is now managed through Redux, providing a cleaner and more maintainable solution compared to passing data through URL parameters with special characters.

## Architecture

### Redux Store Structure

```typescript
interface EditorState {
  message: string;
  selectedCategories: string[];
}
```

### Files

- `src/redux/slices/editorSlice.ts` - Redux slice for editor state
- `src/redux/hooks/useEditor.ts` - Custom hook for accessing editor state
- `src/redux/store/store.tsx` - Main Redux store configuration

## Usage

### In Components

```typescript
import { useEditor } from '@/redux/hooks/useEditor';

const MyComponent = () => {
  const {
    message,
    selectedCategories,
    setMessage,
    setSelectedCategories,
    addCategory,
    removeCategory,
    clearEditor,
  } = useEditor();

  // Use the state and actions as needed
};
```

### Available Actions

- `setMessage(message: string)` - Set the editor message
- `setSelectedCategories(categories: string[])` - Set all selected categories
- `addCategory(category: string)` - Add a category to the selection
- `removeCategory(category: string)` - Remove a category from the selection
- `clearEditor()` - Clear all editor state

## Features

### Persistence

The editor state is automatically persisted to localStorage, so the state survives page refreshes.

### Type Safety

Full TypeScript support with proper typing for all state and actions.

### Performance

Individual selectors are available for better performance when only specific parts of the state are needed.

## Migration from URL Parameters

### Before (URL Parameters)

```typescript
// Sending data
const params = new URLSearchParams();
params.set('q', message.trim());
if (selectedCategories.length) params.set('cats', selectedCategories.join(','));
intlRouter.push(`/editor?${params.toString()}`);

// Receiving data
const search = useSearchParams();
const initialMessage = search.get('q') || '';
const initialCats = (search.get('cats') || '').split(',').filter(Boolean);
```

### After (Redux)

```typescript
// Sending data
const { setMessage, setSelectedCategories } = useEditor();
setMessage(message.trim());
setSelectedCategories(selectedCategories);
intlRouter.push('/editor');

// Receiving data
const { message, selectedCategories } = useEditor();
```

## Benefits

1. **Clean URLs** - No more special characters in URLs
2. **Better UX** - State persists across page refreshes
3. **Type Safety** - Full TypeScript support
4. **Maintainability** - Centralized state management
5. **Performance** - Efficient state updates and selectors
6. **Scalability** - Easy to extend with additional state properties
