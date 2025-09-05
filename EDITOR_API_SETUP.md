# Editor API Setup with RTK Query

This document describes the editor API integration implemented using Redux Toolkit Query (RTK Query) for the ZakiCode application.

## Overview

The editor API system includes:

- Page generation using AI
- Frontend structure management
- Real-time diagram updates
- Persistent state management

## API Endpoints

### Page Generation

- `POST /webhook/builder` - Generate pages based on user prompt

## Request Format

```typescript
interface IBuilderPagesRequest {
  platform: string; // e.g., "website", "mobile", "backend"
  prompt: string; // User description of what to build
}
```

Example request:

```json
{
  "platform": "website",
  "prompt": "اكتب بالعربي: أنشئ صفحات لمتجر إلكتروني: Home, Catalog, Product Detail, Cart, Checkout, User Profile, Admin Dashboard"
}
```

## Response Format

```typescript
interface BuilderResponse {
  projectId: string;
  pages: PageData[];
  count: number;
}

interface PageData {
  name: string;
  platform: string;
  description: string;
  parent_page: string | null;
  page_type: string;
  position: number;
}
```

Example response:

```json
{
  "projectId": "project_123",
  "pages": [
    {
      "name": "الصفحة الرئيسية",
      "platform": "website",
      "description": "الصفحة الأساسية للمتجر",
      "parent_page": null,
      "page_type": "home",
      "position": 0
    }
  ],
  "count": 1
}
```

## File Structure

### API Layer

- `src/redux/api/editorApi.ts` - RTK Query API endpoints
- `src/hooks/useEditor.ts` - Custom editor hook

### State Management

- `src/redux/slices/editorSlice.ts` - Editor state management (updated)

### Components

- `src/sections/Editor/components/EditorChatSection.tsx` - Updated with API integration

## Usage

### Using the useEditor Hook

```typescript
import { useEditor } from '@/hooks/useEditor';

const MyComponent = () => {
  const {
    message,
    selectedCategories,
    frontendStructure,
    isLoading,
    generatePages,
    setMessage,
  } = useEditor();

  const handleGenerate = async () => {
    const result = await generatePages();

    if (result.success) {
      console.log('Generated pages:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  };
};
```

### Button Integration

The "Generate Pages" button in the editor chat section:

- Takes the current message as the prompt
- Uses the first selected category as the platform
- Shows loading state during generation
- Displays success/error messages in chat
- Updates the frontend structure with generated pages

## State Management

### Generated Pages Processing

When pages are generated:

1. API response is received
2. Pages are converted from API format to internal format
3. Nodes and edges are generated for the diagram
4. State is updated and persisted to localStorage
5. UI components are automatically updated

### Data Flow

1. User enters description in chat
2. Clicks "Generate Pages" button
3. API call is made with platform and prompt
4. Response is processed and state is updated
5. Diagram and table are automatically populated
6. Success/error message is shown in chat

## Error Handling

The system handles various error scenarios:

- Network errors
- API errors
- Invalid responses
- Missing data

Errors are displayed to users via:

- Chat messages
- Alert components
- Console logging

## Integration with Existing Code

The editor API integrates seamlessly with:

- Existing Redux store structure
- Frontend structure components
- Diagram visualization
- Table display
- Chat interface

## Future Enhancements

Potential improvements:

- Batch page generation
- Page templates
- Custom page types
- Advanced diagram layouts
- Real-time collaboration
- Version control
