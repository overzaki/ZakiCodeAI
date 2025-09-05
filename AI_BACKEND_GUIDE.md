# AI Backend Code Generation Guide for Sandpack Compatibility

## Overview

This guide ensures that AI-generated code works seamlessly with Sandpack's runtime environment. The code must be compatible with Sandpack's supported templates and follow specific structural requirements.

## Response Format Requirements

### 1. Response Structure

Always return both `website_code` (legacy format) and `files` (new format) for maximum compatibility, plus `sandbox` configuration:

```json
{
  "website_code": "// FILE: filename\ncontent...",
  "files": [
    {
      "path": "filename",
      "content": "file content"
    }
  ],
  "sandbox": {
    "template": "react",
    "entry": "/src/index.js",
    "openPath": "/src/App.jsx",
    "installCommand": "npm install",
    "startCommand": "npm start"
  }
}
```

### 2. Supported Project Types

Generate code for these Sandpack-compatible templates:

- **React** (Create React App structure)
- **Next.js** (App Router structure)
- **Vanilla** (HTML/CSS/JS)
- **Node.js** (Express/Server)

## Template-Specific Requirements

### React Projects (Most Common)

**Use this structure for React applications:**

#### Required Files:

1. **`package.json`** - Must include:

   ```json
   {
     "name": "react-app",
     "version": "1.0.0",
     "private": true,
     "scripts": {
       "start": "react-scripts start",
       "build": "react-scripts build"
     },
     "dependencies": {
       "react": "^18.2.0",
       "react-dom": "^18.2.0"
     }
   }
   ```

   **⚠️ CRITICAL: Never use Vite scripts or dependencies:**

   ```json
   // ❌ WRONG - This will cause esbuild-wasm errors
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build"
     },
     "dependencies": {
       "vite": "^4.0.0",
       "@vitejs/plugin-react": "^4.0.0"
     }
   }
   ```

2. **`public/index.html`** - Entry point:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1" />
       <title>React App</title>
     </head>
     <body>
       <div id="root"></div>
     </body>
   </html>
   ```

3. **`src/index.js`** - Main entry point (NOT main.jsx):

   ```javascript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import App from './App';

   const root = ReactDOM.createRoot(document.getElementById('root'));
   root.render(
     <React.StrictMode>
       <App />
     </React.StrictMode>,
   );
   ```

4. **`src/App.jsx`** - Main component:

   ```javascript
   import React from 'react';
   import './styles/global.css';

   function App() {
     return <div>{/* Your main content here */}</div>;
   }

   export default App;
   ```

#### File Structure:

```
/
├── public/
│   └── index.html
├── src/
│   ├── index.js          (NOT main.jsx)
│   ├── App.jsx
│   ├── styles/
│   │   └── global.css
│   └── components/
│       └── YourComponents.jsx
└── package.json
```

### Next.js Projects

**Use this structure for Next.js applications:**

#### Required Files:

1. **`package.json`**:

   ```json
   {
     "name": "nextjs-app",
     "version": "1.0.0",
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start"
     },
     "dependencies": {
       "next": "^13.0.0",
       "react": "^18.2.0",
       "react-dom": "^18.2.0"
     }
   }
   ```

2. **`next.config.js`**:

   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
   };
   module.exports = nextConfig;
   ```

3. **`pages/_app.js`** (Pages Router) or **`app/layout.js`** (App Router):

   ```javascript
   import '../styles/globals.css';

   export default function App({ Component, pageProps }) {
     return <Component {...pageProps} />;
   }
   ```

4. **`pages/index.js`** or **`app/page.js`**:
   ```javascript
   export default function Home() {
     return (
       <div>
         <h1>Welcome to Next.js!</h1>
       </div>
     );
   }
   ```

### Vanilla Projects

**Use this structure for HTML/CSS/JS projects:**

#### Required Files:

1. **`index.html`**:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Vanilla App</title>
       <link rel="stylesheet" href="styles.css" />
     </head>
     <body>
       <div id="app"></div>
       <script src="script.js"></script>
     </body>
   </html>
   ```

2. **`styles.css`**:

   ```css
   body {
     margin: 0;
     font-family: Arial, sans-serif;
   }
   ```

3. **`script.js`**:
   ```javascript
   document.getElementById('app').innerHTML = '<h1>Hello World!</h1>';
   ```

### Node.js Projects

**Use this structure for Express/Node.js projects:**

#### Required Files:

1. **`package.json`**:

   ```json
   {
     "name": "node-app",
     "version": "1.0.0",
     "main": "index.js",
     "scripts": {
       "start": "node index.js"
     },
     "dependencies": {
       "express": "^4.18.0"
     }
   }
   ```

2. **`index.js`**:

   ```javascript
   const express = require('express');
   const app = express();
   const port = 3000;

   app.get('/', (req, res) => {
     res.send('Hello World!');
   });

   app.listen(port, () => {
     console.log(`Server running at http://localhost:${port}`);
   });
   ```

## Critical Rules

### 1. File Naming

- **React**: Use `src/index.js` (NOT `main.jsx`)
- **Entry points**: Always use standard names (`index.js`, `index.html`)
- **Components**: Use `.jsx` extension for React components

### 2. Dependencies

- **React**: Always use `react: "^18.2.0"` and `react-dom: "^18.2.0"`
- **Next.js**: Use `next: "^13.0.0"` or higher
- **Express**: Use `express: "^4.18.0"`
- **⚠️ NEVER include Vite**: Do not include `vite`, `@vitejs/plugin-react`, or any Vite-related dependencies

### 3. Import/Export

- Use ES6 import/export syntax
- Use relative imports from `src/` directory
- Avoid absolute imports that require path mapping

### 4. File Structure

- Keep all source files in `src/` directory for React projects
- Use `public/` for static assets in React projects
- Follow standard directory conventions for each template

### 5. Content Requirements

- Ensure all components are properly exported
- Include all necessary imports
- Make sure the main component renders something visible
- Include basic styling (CSS files)

## Example Generation Patterns

### For a React Landing Page:

```javascript
// Generate these files:
// 1. package.json with react dependencies
// 2. public/index.html with root div
// 3. src/index.js as entry point
// 4. src/App.jsx as main component
// 5. src/styles/global.css for styling
// 6. src/components/Header.jsx, src/components/Hero.jsx, etc.
```

### When User Requests Vite:

**If the user asks for Vite, convert to CRA structure:**

```javascript
// User says: "Create a Vite React app"
// AI should generate CRA structure instead:

// ✅ CORRECT - CRA compatible
{
  "package.json": {
    "scripts": {
      "start": "react-scripts start",
      "build": "react-scripts build"
    },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    }
  }
}

// ❌ WRONG - Will cause esbuild-wasm error
{
  "package.json": {
    "scripts": {
      "dev": "vite",
      "build": "vite build"
    },
    "dependencies": {
      "vite": "^4.0.0",
      "@vitejs/plugin-react": "^4.0.0"
    }
  }
}
```

### For a Next.js Blog:

```javascript
// Generate these files:
// 1. package.json with next dependencies
// 2. next.config.js
// 3. pages/_app.js or app/layout.js
// 4. pages/index.js or app/page.js
// 5. pages/blog/[id].js for dynamic routes
// 6. styles/globals.css
```

## Common Mistakes to Avoid

1. **❌ Using `main.jsx` instead of `index.js`**
2. **❌ Missing `public/index.html` for React projects**
3. **❌ Incompatible dependency versions**
4. **❌ Missing entry point files**
5. **❌ Using Vite-specific configurations** ⚠️ **CRITICAL**
6. **❌ Absolute imports that don't work in Sandpack**
7. **❌ Missing exports for components**
8. **❌ Empty or non-functional main components**
9. **❌ Including Vite in dependencies**
10. **❌ Using Vite scripts in package.json**

## Testing Checklist

Before returning the response, ensure:

- [ ] All required files are present
- [ ] Entry points are correctly named (`index.js`, not `main.jsx`)
- [ ] Dependencies are compatible with Sandpack
- [ ] Components are properly exported
- [ ] Main component renders visible content
- [ ] No Vite-specific configurations
- [ ] File structure matches template requirements
- [ ] Both `website_code` and `files` formats are included

## Sandbox Configuration (required)

### Purpose

The `sandbox` object provides explicit configuration for Sandpack, ensuring optimal compatibility and user experience. This configuration takes priority over automatic detection and provides more reliable results.

### Benefits

1. **Explicit Template Selection**: Avoids detection errors and ensures the correct Sandpack template is used
2. **Proper Entry Points**: Guarantees the correct file is loaded for preview
3. **Better User Experience**: Opens the most relevant file in the editor by default
4. **Consistent Behavior**: Eliminates guesswork and provides predictable results
5. **Future-Proof**: Allows for custom configurations as Sandpack evolves

### Configuration Options

#### `template` (string)

- **Values**: `"react"`, `"nextjs"`, `"vanilla"`, `"node"`
- **Purpose**: Explicitly tells Sandpack which template to use
- **Example**: `"template": "react"`

#### `entry` (string)

- **Purpose**: Specifies the main entry point file for the application
- **Examples**:
  - React: `"/src/index.js"`
  - Next.js: `"/pages/index.js"`
  - Vanilla: `"/index.html"`
  - Node.js: `"/index.js"`

#### `openPath` (string)

- **Purpose**: Specifies which file should be opened by default in the editor
- **Example**: `"/src/App.jsx"` (opens the main component file)

#### `installCommand` (string)

- **Purpose**: Custom install command (optional)
- **Default**: `"npm install"`
- **Example**: `"yarn install"`

#### `startCommand` (string)

- **Purpose**: Custom start command (optional)
- **Default**: Template-specific
- **Example**: `"npm run dev"`

### Example Sandbox Configurations

#### For React Projects:

```json
{
  "sandbox": {
    "template": "react",
    "entry": "/src/index.js",
    "openPath": "/src/App.jsx"
  }
}
```

#### For Next.js Projects:

```json
{
  "sandbox": {
    "template": "nextjs",
    "entry": "/pages/index.js",
    "openPath": "/pages/_app.js"
  }
}
```

#### For Vanilla Projects:

```json
{
  "sandbox": {
    "template": "vanilla",
    "entry": "/index.html",
    "openPath": "/script.js"
  }
}
```

#### For Node.js Projects:

```json
{
  "sandbox": {
    "template": "node",
    "entry": "/index.js",
    "openPath": "/index.js"
  }
}
```

## Common Sandpack Errors to Avoid

### ❌ Vite/Esbuild Errors

**Error**: `Cannot find module 'esbuild-wasm' from '/nodebox/node_modules/.store/vite@4.5.9/node_modules/vite/dist/node/chunks/dep-3936e161.js'`

**Cause**: Including Vite dependencies or scripts in package.json

**Solution**:

- Never include `vite` or `@vitejs/plugin-react` in dependencies
- Use `react-scripts` instead of Vite scripts
- Generate CRA-compatible code structure

### ❌ Shell Connection Errors

**Error**: `Failed to get shell by ID`

**Cause**: Network connectivity or Sandpack server issues

**Solution**:

- Ensure proper template configuration
- Use sandbox configuration for explicit template selection
- Provide fallback error handling

## Response Validation

Your AI should validate that:

1. The generated code follows the template structure
2. All dependencies are Sandpack-compatible
3. Entry points are correctly named
4. Components render visible content
5. No framework-specific configurations are included
6. Sandbox configuration matches the generated code structure
7. **No Vite dependencies or scripts are included**

This ensures the generated code will work immediately in Sandpack without any manual intervention.
