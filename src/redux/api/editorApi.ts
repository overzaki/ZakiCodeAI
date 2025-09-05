import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
import { API_BASE_URL } from '@/app/api/shared/constants';
import { ENDPOINTS } from './endpoints';

// Types
export interface IBuilderPagesRequest {
  platform: string;
  prompt: string;
}

export interface IBuilderCodeRequest {
  action: 'generate';
  projectId: string;
  website: boolean;
  pages: // { pageName: string, pageType: string, parentPage: string | null, platform: 'website' | 'mobike' | 'backend' }[],
  {
    pageName: string;
    pageType: string;
    parentPage: string | null;
    platform: string;
  }[];
  chat: boolean;
}

export interface IPageData {
  name: string;
  platform: string;
  description: string;
  parent_page: string | null;
  page_type: string;
  position: number;
}

export interface IBuilderPagesResponse {
  projectId: string;
  pages: IPageData[];
  count: number;
  pre_chat?: string;
  chat?: string;
}

// example website_code = "To create a complete Next.js project as specified in your request, I will outline the structure and provide code for the important files. For this demonstration, let's assume we're building a simple Next.js application for a blog with basic functionality including a home, about, and blog page.\n\n### 1. `package.json`\n```json\n{\n  \"name\": \"nextjs-blog\",\n  \"version\": \"1.0.0\",\n  \"scripts\": {\n    \"dev\": \"next dev\",\n    \"build\": \"next build\",\n    \"start\": \"next start\"\n  },\n  \"dependencies\": {\n    \"next\": \"13.x.x\",\n    \"react\": \"18.x.x\",\n    \"react-dom\": \"18.x.x\"\n  }\n}\n```\n\n### 2. `pages/index.js` (Home Page)\n```jsx\nimport Link from 'next/link';\n\nexport default function Home() {\n  return (\n    <div>\n      <h1>Welcome to Our Blog</h1>\n      <p>This is the home page of our simple blog application.</p>\n      <nav>\n        <Link href=\"/about\">About</Link> | <Link href=\"/blog\">Blog</Link>\n      </nav>\n    </div>\n  );\n}\n```\n\n### 3. `pages/about.js` (About Page)\n```jsx\nimport Link from 'next/link';\n\nexport default function About() {\n  return (\n    <div>\n      <h1>About Us</h1>\n      <p>This is the about page of our simple blog application.</p>\n      <nav>\n        <Link href=\"/\">Home</Link> | <Link href=\"/blog\">Blog</Link>\n      </nav>\n    </div>\n  );\n}\n```\n\n### 4. `pages/blog.js` (Blog Page)\n```jsx\nimport Link from 'next/link';\n\nexport default function Blog() {\n  const posts = [\n    { id: 1, title: 'First Post' },\n    { id: 2, title: 'Second Post' },\n  ];\n\n  return (\n    <div>\n      <h1>Blog Posts</h1>\n      <ul>\n        {posts.map((post) => (\n          <li key={post.id}>\n            <Link href={`/blog/${post.id}`}>{post.title}</Link>\n          </li>\n        ))}\n      </ul>\n      <nav>\n        <Link href=\"/\">Home</Link> | <Link href=\"/about\">About</Link>\n      </nav>\n    </div>\n  );\n}\n```\n\n### 5. `pages/blog/[id].js` (Dynamic Blog Post Page)\n```jsx\nimport { useRouter } from 'next/router';\nimport Link from 'next/link';\n\nexport default function Post() {\n  const router = useRouter();\n  const { id } = router.query;\n\n  return (\n    <div>\n      <h1>Blog Post {id}</h1>\n      <p>This is a detailed view of blog post {id}.</p>\n      <nav>\n        <Link href=\"/\">Home</Link> | <Link href=\"/about\">About</Link> | <Link href=\"/blog\">Blog</Link>\n      </nav>\n    </div>\n  );\n}\n```\n\n### 6. `styles/globals.css` (Global CSS)\n```css\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 0;\n}\nnav a {\n  margin: 0 10px;\n  text-decoration: none;\n  color: blue;\n}\nnav a:hover {\n  text-decoration: underline;\n}\n```\n\n### 7. `pages/_app.js` (Custom App Component)\n```jsx\nimport '../styles/globals.css';\n\nexport default function App({ Component, pageProps }) {\n  return <Component {...pageProps} />;\n}\n```\n\n### Project Setup Instructions\n\n1. **Initialize the Project**:  \n   Run `npx create-next-app@latest` and replace the files with the above code snippets.\n\n2. **Install Dependencies**:  \n   Navigate to your project directory and run `npm install`.\n\n3. **Run the Development Server**:  \n   Start the server with `npm run dev` and navigate to `http://localhost:3000`.\n\nThis setup creates a simple blog application using Next.js, featuring routing and dynamic routes for different blog posts. You can extend this structure based on more detailed requirements or features like data fetching, API routes, or using a content management system for more extensive content management."
// example files = [
//     {
//       "path": "pages/index.js",
//       "content": "export default function Home() {\n  return (\n    <div className={styles.container}>\n      <Head>\n        <title>My Portfolio</title>\n        <meta name=\"description\" content=\"Welcome to my portfolio\" />\n        <link rel=\"icon\" href=\"/favicon.ico\" />\n      </Head>\n\n      <header className={styles.header}>\n        <h1>Welcome to My Portfolio</h1>\n      </header>\n\n      <main className={styles.main}>\n        <section className={styles.introduction}>\n          <h2>About Me</h2>\n          <p>Hello! I'm a web developer with experience in building web applications using modern technologies.</p>\n        </section>\n\n        <section className={styles.projects}>\n          <h2>My Projects</h2>\n          <ul>\n            <li>Project 1</li>\n            <li>Project 2</li>\n            <li>Project 3</li>\n          </ul>\n        </section>\n      </main>\n\n      <footer className={styles.footer}>\n        <p>© 2023 My Portfolio</p>\n      </footer>\n    </div>\n  );\n}"
//   },
//   {
//       "path": "pages/_app.js",
//       "content": "import '../styles/globals.css';\nexport default function App({ Component, pageProps }) {\n  return <Component {...pageProps} />;\n}"
//   },
//   {
//       "path": "styles/globals.css",
//       "content": "body{margin:0;padding:0;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif}\ninput,button{margin:5px;padding:8px}"
//   },
//   {
//       "path": "package.json",
//       "content": "{\n  \"name\": \"next-firebase-auth\",\n  \"private\": true,\n  \"scripts\": {\n    \"dev\": \"next dev\",\n    \"build\": \"next build\",\n    \"start\": \"next start\"\n  },\n  \"dependencies\": {\n    \"next\": \"^15.4.6\",\n    \"react\": \"^19.1.1\",\n    \"react-dom\": \"^19.1.1\",\n    \"firebase\": \"^10.14.0\"\n  }\n}"
//   },
//   {
//       "path": "next.config.js",
//       "content": "/** @type {import('next').NextConfig} */\nconst nextConfig = { reactStrictMode: true };\nmodule.exports = nextConfig;"
//   },
//   {
//       "path": "firebaseConfig.js",
//       "content": "import { initializeApp } from 'firebase/app';\nimport { getAuth } from 'firebase/auth';\nconst firebaseConfig = {\n  apiKey: 'YOUR_API_KEY',\n  authDomain: 'YOUR_AUTH_DOMAIN',\n  projectId: 'YOUR_PROJECT_ID',\n  storageBucket: 'YOUR_STORAGE_BUCKET',\n  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',\n  appId: 'YOUR_APP_ID'\n};\nconst app = initializeApp(firebaseConfig);\nexport const auth = getAuth(app);\nexport default app;"
//   }
// ]

export interface IBuilderCodeResponse {
  projectId: string;
  website_code: string | null;
  mobile_code: string | null;
  backend_code: string | null;
  files?:
    | Array<{
        path: string;
        content: string;
      }>
    | Record<string, { code: string }>;
  sandbox?: {
    template?: string;
    entry?: string;
    openPath?: string;
    installCommand?: string;
    startCommand?: string;
  };
}

export interface IApiError {
  message: string;
  status?: number;
}

// Create the API service
export const editorApi = createApi({
  reducerPath: 'editorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/n8n/builder',

    prepareHeaders: (headers, { getState }) => {
      // Get token from state
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Editor'],
  endpoints: (builder) => ({
    // Generate pages using builder
    generatePages: builder.mutation<
      IBuilderPagesResponse,
      IBuilderPagesRequest
    >({
      query: (request) => ({
        url: ENDPOINTS.builderWebhook,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Editor'],
    }),
    generateCode: builder.mutation<IBuilderCodeResponse, IBuilderCodeRequest>({
      query: (request) => ({
        url: ENDPOINTS.builderWebhook,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Editor'],
    }),
  }),
});

// Export hooks for usage in components
export const { useGeneratePagesMutation, useGenerateCodeMutation } = editorApi;
