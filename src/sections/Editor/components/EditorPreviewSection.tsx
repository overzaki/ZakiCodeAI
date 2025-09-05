// FILE: src/sections/Editor/components/EditorPreviewSection.tsx
'use client';

import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  Chip,
} from '@mui/material';
import Iconify from '@/components/iconify';
import ERDPage from './ERDPage';
import FrontendStructurePage from './FrontendStructurePage';
import BackendStructurePage from './BackendStructurePage';
import CodeView from './CodeView';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackConsole,
} from '@codesandbox/sandpack-react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/* =============== Types =============== */
type ViewMode = 'preview' | 'code';
type SysView = 'main' | 'erd' | 'frontend' | 'backend';
type Device = 'Desktop' | 'Tablet' | 'Mobile' | 'Custom';

interface N8NFile {
  path?: string;
  page_name?: string;
  content: string;
  language?: string;
}

interface ProjectRow {
  id: string;
  website_code: string | null;
  mobile_code: string | null;
  backend_code: string | null;
  file_path: string | null;
  file_paths: string[] | null;
  updated_at: string | null;
}

interface ProjectPage {
  id: string;
  project_id: string;
  page_name: string;
  platform: string;
  description?: string;
  parent_page?: string;
  page_type?: string;
  position?: number;
}

interface EditorPreviewSectionProps {
  files?: Array<N8NFile>;
  website_code?: string;
  n8n?: { files?: N8NFile[]; website_code?: string };
  currentPage?: string;
  currentDevice?: Device | string;
  currentZoom?: number;
  currentView?: SysView;
  onRefresh?: () => void;
  onViewChange?: (view: ViewMode) => void;
  onDownload?: () => void;
  onPageChange?: (route: string) => void;
  onDeviceChange?: (device: string) => void;
  onZoomChange?: (zoom: number) => void;
  onFullscreen?: () => void;
  onThemeToggle?: () => void;
  onResponsiveToggle?: () => void;
  onViewStructure?: (type: 'frontend' | 'backend') => void;
  onBackToERD?: () => void;
  onBackToMain?: () => void;
  onMapClick?: () => void;
  onSuccessfulCodeGeneration?: (projectId: string) => void;
}

/* =============== Utils =============== */
const norm = (p: string): string =>
  (
    '/' +
    String(p ?? '')
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
  ).replace(/\/+/g, '/');

type FileMap = Record<string, { code: string }>;

const has = (map: FileMap, path: string): boolean =>
  Object.prototype.hasOwnProperty.call(map, path);

const put = (map: FileMap, path: string, code: string): void => {
  map[path] = { code };
};

const isUUID = (v?: string | null): boolean =>
  !!v &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );

function ensureReact18Main(
  existing: string,
  appImportRel = './App.jsx',
): string {
  let s = existing || '';
  if (/from\s+['"]react-dom['"]/.test(s))
    s = s.replace(/from\s+['"]react-dom['"]/g, "from 'react-dom/client'");

  const okRoot =
    /createRoot\s*\(/.test(s) &&
    /document\.getElementById\(['"]root['"]\)/.test(s);

  if (!okRoot) {
    s = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '${appImportRel}';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(React.createElement(App));`;
  }
  return s;
}

function splitWebsiteCode(website_code?: string): N8NFile[] {
  if (!website_code) return [];
  let s = String(website_code).replace(/\r\n/g, '\n');

  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed?.files)) return parsed.files as N8NFile[];
    if (parsed?.website_code) s = String(parsed.website_code);
  } catch {
    // ignore JSON parsing errors
  }

  const fence = /```[\w-]*\s*([\s\S]*?)```/g;
  const blocks: string[] = [];
  let fm: RegExpExecArray | null;
  while ((fm = fence.exec(s)) !== null) blocks.push(fm[1]);
  if (blocks.length) s = blocks.join('\n');

  const re =
    /(<!--\s*FILE:\s*([A-Za-z0-9_./\-[\]]+)\s*-->)|(^\s*\/\/\s*FILE:\s*([A-Za-z0-9_./\-[\]]+)\s*$)|\/\*\s*FILE:\s*([A-Za-z0-9_./\-[\]]+)\s*\*\//gim;
  const out: N8NFile[] = [];
  let last = 0;
  let currentPath: string | null = null;
  let anyMarker = false;
  let m: RegExpExecArray | null;

  while ((m = re.exec(s)) !== null) {
    anyMarker = true;
    if (currentPath) {
      const chunk = s.slice(last, m.index).trim();
      if (chunk)
        out.push({
          path: currentPath,
          content: chunk,
          page_name: currentPath.split('/').pop() || undefined,
        });
    }
    const pth = (m[2] || m[4] || m[6] || '').replace(/^\//, '');
    currentPath = pth;
    last = re.lastIndex;
  }

  if (anyMarker) {
    if (currentPath) {
      const tail = s.slice(last).trim();
      if (tail)
        out.push({
          path: currentPath,
          content: tail,
          page_name: currentPath.split('/').pop() || undefined,
        });
    }
  } else if (/<html[\s\S]*<\/html>/i.test(s)) {
    out.push({ path: 'index.html', content: s, page_name: 'index.html' });
  }
  return out;
}

function normalizeIncomingPath(raw: string): string {
  let p = norm(raw);
  if (p.includes('/src/')) p = '/src/' + p.split('/src/')[1];
  else if (p.includes('/public/')) p = '/public/' + p.split('/public/')[1];
  if (p.startsWith('/pages/')) p = '/src' + p;
  if (p === '/App.jsx') p = '/src/App.jsx';
  if (p === '/main.jsx') p = '/src/main.jsx';
  if (p === '/index.jsx') p = '/src/index.jsx';
  return p;
}

function hardStripBuildConfigs(map: FileMap): void {
  const shouldDrop = (k: string): boolean =>
    /(\/|^)\.babelrc(\.(js|cjs|mjs|json))?$/i.test(k) ||
    /(\/|^)babel\.config\.(js|cjs|mjs|json)$/i.test(k) ||
    /(\/|^)\.swcrc$/i.test(k) ||
    /(\/|^)tsconfig\.json$/i.test(k) ||
    /(\/|^)\.postcssrc(\.(js|cjs|mjs|json))?$/i.test(k) ||
    /(\/|^)postcss\.config\.(js|cjs|mjs|json)$/i.test(k) ||
    /(\/|^)\.eslintrc(\.(js|cjs|mjs|json|ya?ml))?$/i.test(k) ||
    /(\/|^)eslint\.config\.(js|cjs|mjs|ts)$/i.test(k) ||
    /(\/|^)prettier(\.config)?\.(js|cjs|mjs|json|ya?ml)$/i.test(k) ||
    /(\/|^)vite\.config\.(js|ts)$/i.test(k) ||
    /(\/|^)webpack(\.base)?\.config\.(js|cjs|mjs|ts)$/i.test(k) ||
    /(\/|^)rollup\.config\.(js|mjs|ts)$/i.test(k) ||
    /(\/|^)package\.json$/i.test(k);

  for (const key of Object.keys(map)) {
    if (shouldDrop(key)) delete map[key];
  }
}

function sanitizeCss(code: string): string {
  return code.replace(/\b(darken|lighten)\s*\([^)]*\)/gi, '/*$&*/');
}

function kebab(s: string): string {
  return s
    .replace(/\.[jt]sx?$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

function pascalSafe(base: string, idx: number): string {
  const name = base
    .replace(/\.[jt]sx?$/i, '')
    .replace(/[^A-Za-z0-9]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, '');
  return name || `Page${idx}`;
}

function pageNameToFilePath(pageName: string): string {
  const cleaned = pageName
    .replace(/[^A-Za-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .trim();
  const componentName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return `/src/pages/${componentName}.jsx`;
}

function generatePageContent(pageName: string, description?: string): string {
  const componentName = pageName
    .replace(/[^A-Za-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .trim();
  const finalName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);
  const displayName = pageName;
  const desc = description || `صفحة ${pageName}`;

  return `export default function ${finalName}() {
  return (
    <div style={{padding: 24}}>
      <h1>${displayName}</h1>
      <p>${desc}</p>
    </div>
  );
}`;
}

function extractEmbeddedFiles(
  basePath: string,
  content: string,
): Array<{ path: string; content: string }> {
  const s = String(content ?? '').replace(/\r\n/g, '\n');
  const re =
    /(<!--\s*FILE:\s*([A-Za-z0-9_./\-[\]]+)\s*-->)|(^\s*\/\/\s*FILE:\s*([A-Za-z0-9_./\-[\]]+)\s*$)|\/\*\s*FILE:\s*([A-Za-z0-9_./\-[\]]+)\s*\*\//gim;

  const out: Array<{ path: string; content: string }> = [];
  let last = 0;
  let currentPath: string = basePath;
  let m: RegExpExecArray | null;
  let seenMarker = false;

  while ((m = re.exec(s)) !== null) {
    seenMarker = true;
    const pre = s.slice(last, m.index).trim();
    if (pre) out.push({ path: currentPath, content: pre });
    const nextPath = (m[2] || m[4] || m[6] || '').replace(/^\//, '');
    currentPath = nextPath || currentPath;
    last = re.lastIndex;
  }

  if (seenMarker) {
    const tail = s.slice(last).trim();
    if (tail) out.push({ path: currentPath, content: tail });
  } else {
    out.push({ path: basePath, content: s });
  }
  return out;
}

function routeFromPath(p?: string | null): string {
  if (!p) return '/';
  const file = p.split('/').pop() || '';
  return file.toLowerCase().startsWith('home.') ? '/' : `/${kebab(file)}`;
}

function normalizePathsArr(arr?: string[] | null): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => normalizeIncomingPath(x)).filter(Boolean);
}

function routesFromPages(
  filesMap: FileMap,
  allowed?: Set<string>,
): Array<{ path: string; label: string }> {
  let pageFiles = Object.keys(filesMap).filter((p) =>
    /^\/src\/pages\/[^/]+\.[jt]sx?$/.test(p),
  );
  if (allowed && allowed.size) {
    pageFiles = pageFiles.filter((p) => allowed.has(p));
  }
  if (!pageFiles.length) return [];

  const items = pageFiles.map((p) => {
    const file = p.split('/').pop()!;
    const path = file.toLowerCase().startsWith('home.')
      ? '/'
      : `/${kebab(file)}`;
    const label = file
      .replace(/\.[jt]sx?$/i, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { path, label: path === '/' ? 'Home' : label };
  });

  const seen = new Set<string>();
  return items
    .filter((i) => (seen.has(i.path) ? false : (seen.add(i.path), true)))
    .sort((a, b) => (a.path === '/' ? -1 : a.path.localeCompare(b.path)));
}

function fingerprint(map: FileMap): string {
  const keys = Object.keys(map).sort();
  let hash = 0;
  for (const k of keys) {
    const s = k + '|' + (map[k]?.code?.length ?? 0);
    for (let i = 0; i < s.length; i++)
      hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return String(hash);
}

/* =============== Component =============== */
const EditorPreviewSection: React.FC<EditorPreviewSectionProps> = (props) => {
  const search = useSearchParams();
  const rawProject =
    search.get('project') || search.get('projectId') || undefined;
  const urlType = (search.get('type') || 'website').toLowerCase();
  const codeField: keyof ProjectRow =
    urlType === 'backend'
      ? 'backend_code'
      : urlType === 'app' || urlType === 'mobile'
        ? 'mobile_code'
        : 'website_code';

  // State
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [resolvingId, setResolvingId] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [internalRoute, setInternalRoute] = useState<string>('/');
  const [hotTick, setHotTick] = useState(0);
  const lastSourceRef = useRef<string>('none');
  const askedParentRef = useRef(false);

  // DB state
  const [dbFiles, setDbFiles] = useState<N8NFile[]>([]);
  const [dbPages, setDbPages] = useState<ProjectPage[]>([]);
  const [dbFilePaths, setDbFilePaths] = useState<string[]>([]);
  const [mainRoute, setMainRoute] = useState<string | undefined>(undefined);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbMsg, setDbMsg] = useState<string | null>(null);

  const allowedSet = useMemo(() => new Set(dbFilePaths || []), [dbFilePaths]);

  // Resolve project ID from slug
  useEffect(() => {
    let mounted = true;
    const resolve = async () => {
      if (!rawProject) {
        setProjectId(undefined);
        return;
      }
      if (isUUID(rawProject)) {
        setProjectId(rawProject);
        return;
      }

      setResolvingId(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .eq('slug', rawProject)
          .maybeSingle();

        if (error) throw error;
        if (!mounted) return;
        setProjectId(data?.id);
      } catch (err) {
        console.error('Error resolving project ID:', err);
        if (mounted) setProjectId(undefined);
      } finally {
        if (mounted) setResolvingId(false);
      }
    };
    resolve();
    return () => {
      mounted = false;
    };
  }, [rawProject]);

  // Fetch project data
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setDbMsg(null);

      if (!projectId) {
        setDbFiles([]);
        setDbPages([]);
        setDbFilePaths([]);
        setMainRoute(undefined);
        lastSourceRef.current = 'none';
        setHotTick((t) => t + 1);
        return;
      }

      setDbLoading(true);
      try {
        const [projectRes, pagesRes] = await Promise.all([
          supabase
            .from('projects')
            .select(
              'id, website_code, mobile_code, backend_code, file_path, file_paths, updated_at',
            )
            .eq('id', projectId)
            .maybeSingle(),
          supabase
            .from('project_pages')
            .select('*')
            .eq('project_id', projectId)
            .eq('platform', 'website')
            .order('position', { ascending: true }),
        ]);

        if (cancelled) return;

        if (projectRes.error) throw projectRes.error;
        const projectData = projectRes.data as ProjectRow | null;
        const pages = (pagesRes.data || []) as ProjectPage[];

        if (!projectData) {
          setDbMsg('⚠️ لا يوجد مشروع مرئي بهذه الهوية');
          setDbFiles([]);
          setDbPages([]);
          setDbFilePaths([]);
          setMainRoute(undefined);
          lastSourceRef.current = 'db:empty';
          setHotTick((t) => t + 1);
          return;
        }

        setDbPages(pages);
        setDbFilePaths(normalizePathsArr(projectData.file_paths));
        setMainRoute(
          projectData.file_path
            ? routeFromPath(normalizeIncomingPath(projectData.file_path))
            : pages.length > 0
              ? routeFromPath(pageNameToFilePath(pages[0].page_name))
              : '/',
        );

        const raw = (projectData as any)[codeField] as string | null;

        // أولوية للكود المحفوظ في قاعدة البيانات
        if (raw && raw.trim()) {
          const list = splitWebsiteCode(raw);
          const normalized: N8NFile[] = list.map((f) => ({
            ...f,
            path: normalizeIncomingPath(f.path || 'src/App.jsx'),
          }));
          setDbFiles(normalized);
          lastSourceRef.current = `db(projects.${String(codeField)})`;
        } else if (pages.length > 0) {
          // إنشاء صفحات من جدول project_pages
          const generatedFiles: N8NFile[] = pages.map((page) => ({
            path: pageNameToFilePath(page.page_name),
            content: generatePageContent(page.page_name, page.description),
            page_name: page.page_name,
          }));

          // إضافة ملف App.jsx أساسي للتنقل
          const routesList = pages.map((page) => {
            const componentName = page.page_name
              .replace(/[^A-Za-z0-9\s]/g, '')
              .replace(/\s+/g, '')
              .trim();
            const finalName =
              componentName.charAt(0).toUpperCase() + componentName.slice(1);
            const route =
              page.page_name.toLowerCase().includes('home') ||
              page.position === 0
                ? '/'
                : `/${kebab(page.page_name)}`;
            return {
              component: finalName,
              route,
              import: `./${finalName}`,
            };
          });

          const appContent = `
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
${routesList.map((r) => `import ${r.component} from '${r.import}';`).join('\n')}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Navigation */}
        <nav style={{ 
          padding: '1rem', 
          borderBottom: '1px solid #eee',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            ${routesList
              .map(
                (r) => `<Link 
              to="${r.route}" 
              style={{ 
                textDecoration: 'none', 
                color: '#007bff',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                backgroundColor: 'white',
                border: '1px solid #dee2e6'
              }}
            >
              ${r.component}
            </Link>`,
              )
              .join('\n            ')}
          </div>
        </nav>

        {/* Routes */}
        <main style={{ padding: '2rem' }}>
          <Routes>
            ${routesList.map((r) => `<Route path="${r.route}" element={<${r.component} />} />`).join('\n            ')}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}`.trim();

          generatedFiles.unshift({
            path: '/src/App.jsx',
            content: appContent,
            page_name: 'App',
          });

          setDbFiles(generatedFiles);
          lastSourceRef.current = 'db(project_pages_generated)';
        } else {
          setDbFiles([]);
          lastSourceRef.current = 'db:nodata';
        }

        setHotTick((t) => t + 1);
      } catch (e: any) {
        console.error('Error fetching project data:', e);
        if (!cancelled) {
          setDbMsg('❌ فشل في جلب بيانات المشروع');
          setDbFiles([]);
          setDbPages([]);
          setDbFilePaths([]);
          setMainRoute(undefined);
          lastSourceRef.current = 'db:error';
          setHotTick((t) => t + 1);
        }
      } finally {
        if (!cancelled) setDbLoading(false);
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [projectId, codeField]);

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`projects:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        () => {
          window.location.reload();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // PostMessage bridge for n8n
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      try {
        const data: any = e?.data;
        if (!data) return;

        const isPayload =
          data.type === 'N8N_PAYLOAD' || data.files || data.website_code;
        if (!isPayload) return;

        const payload = data.type === 'N8N_PAYLOAD' ? data.payload : data;

        localStorage.setItem('n8n_payload', JSON.stringify(payload));
        (window as any).__N8N__ = payload;
        lastSourceRef.current = 'postMessage';
        setHotTick((t) => t + 1);
      } catch (err) {
        console.error('Error handling postMessage:', err);
      }
    };

    const onCustom = () => {
      lastSourceRef.current = 'custom-event';
      setHotTick((t) => t + 1);
    };

    window.addEventListener('message', onMsg);
    window.addEventListener('n8n:payload:update', onCustom as any);

    (window as any).__setN8N__ = (payload: any) => {
      try {
        localStorage.setItem('n8n_payload', JSON.stringify(payload));
        (window as any).__N8N__ = payload;
        lastSourceRef.current = 'window.__setN8N__';
        setHotTick((t) => t + 1);
      } catch (err) {
        console.error('Error setting N8N payload:', err);
      }
    };

    const askParent = () => {
      if (askedParentRef.current) return;
      askedParentRef.current = true;
      try {
        window.parent?.postMessage({ type: 'N8N_REQUEST_PAYLOAD' }, '*');
      } catch (err) {
        console.error('Error requesting payload from parent:', err);
      }
    };

    const timer = setTimeout(askParent, 120);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', onMsg);
      window.removeEventListener('n8n:payload:update', onCustom as any);
      delete (window as any).__setN8N__;
    };
  }, []);

  // Pull payload from props/n8n
  const pulled = useMemo(() => {
    if (props.files?.length || props.website_code) {
      lastSourceRef.current = 'props';
      return {
        files: props.files,
        website_code: props.website_code,
        source: 'props' as const,
      };
    }

    if (props.n8n?.files?.length || props.n8n?.website_code) {
      lastSourceRef.current = 'props.n8n';
      return {
        files: props.n8n.files,
        website_code: props.n8n.website_code,
        source: 'props.n8n' as const,
      };
    }

    if (typeof window !== 'undefined') {
      const w: any = window;
      if (w.__N8N__ && (w.__N8N__.files?.length || w.__N8N__.website_code)) {
        return {
          files: w.__N8N__.files,
          website_code: w.__N8N__.website_code,
          source: 'window.__N8N__',
        };
      }

      try {
        const raw = localStorage.getItem('n8n_payload');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.files) || parsed?.website_code) {
            return {
              files: parsed.files,
              website_code: parsed.website_code,
              source: 'localStorage:n8n_payload',
            };
          }
        }
      } catch (err) {
        console.error('Error reading from localStorage:', err);
      }
    }

    lastSourceRef.current = 'none';
    return { source: 'none' } as any;
  }, [props.files, props.website_code, props.n8n, hotTick]);

  // Merge files: DB first, then n8n/props
  const effectiveFiles: N8NFile[] = useMemo(() => {
    const map = new Map<string, N8NFile>();
    const add = (f?: N8NFile) => {
      if (!f?.path) return;
      const p = normalizeIncomingPath(f.path);
      map.set(p, { ...f, path: p });
    };

    // Props have priority if explicitly passed
    if (props.website_code && props.website_code.trim()) {
      const propsFiles = splitWebsiteCode(props.website_code);
      propsFiles.forEach(add);
      return Array.from(map.values());
    }

    (dbFiles || []).forEach(add);

    if (!dbFiles?.length) {
      // Prioritize files array over website_code string
      const fromFiles = (pulled.files ?? []).filter(Boolean);
      if (fromFiles.length > 0) {
        // Use the files array directly - it's already properly structured
        fromFiles.forEach(add);
      } else {
        // Fallback to parsing website_code string
        const fromWebsite = splitWebsiteCode(pulled.website_code);
        fromWebsite.forEach(add);
      }
    }

    return Array.from(map.values());
  }, [dbFiles, pulled.files, pulled.website_code, props.website_code]);

  // Build Sandpack files map
  const sp = useMemo(() => {
    const map: FileMap = {};
    const addOne = (rawPath: string, rawCode: string) => {
      if (!rawPath) return;
      const p = normalizeIncomingPath(rawPath);
      let code = rawCode ?? '';
      if (/\.css$/i.test(p)) code = sanitizeCss(code);
      map[p] = { code };
    };

    for (const f of effectiveFiles ?? []) {
      const base = f.path || 'src/App.jsx';
      const parts = extractEmbeddedFiles(base, f.content ?? '');
      for (const part of parts) {
        let content = part.content;

        // Fix common import/export issues
        if (part.path.includes('.jsx') || part.path.includes('.js')) {
          const originalContent = content;

          // Fix Card component imports - change from named to default import
          content = content.replace(
            /import\s*{\s*Card\s*}\s*from\s*['"]\.\.\/components\/Card\.jsx?['"]/g,
            "import Card from '../components/Card.jsx'",
          );
          content = content.replace(
            /import\s*{\s*Card\s*}\s*from\s*['"]\.\/components\/Card\.jsx?['"]/g,
            "import Card from './components/Card.jsx'",
          );

          // Fix Button component imports - change from named to default import
          content = content.replace(
            /import\s*{\s*Button\s*}\s*from\s*['"]\.\.\/components\/Button\.jsx?['"]/g,
            "import Button from '../components/Button.jsx'",
          );
          content = content.replace(
            /import\s*{\s*Button\s*}\s*from\s*['"]\.\/components\/Button\.jsx?['"]/g,
            "import Button from './components/Button.jsx'",
          );

          // Debug: Log if we made any changes
          if (content !== originalContent) {
            console.log(`Fixed imports in ${part.path}:`, {
              original: originalContent
                .split('\n')
                .filter((line) => line.includes('import')),
              fixed: content
                .split('\n')
                .filter((line) => line.includes('import')),
            });
          }
        }

        addOne(part.path, content);
      }
    }

    hardStripBuildConfigs(map);

    // Passthrough mode
    const hasIndex = has(map, '/index.html');
    const hasMain = has(map, '/src/main.jsx') || has(map, '/src/main.tsx');
    const hasApp = has(map, '/src/App.jsx') || has(map, '/src/App.tsx');

    if (hasIndex || hasMain || hasApp) {
      if (!hasIndex) {
        put(
          map,
          '/index.html',
          `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Preview</title>
</head><body><div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body></html>`,
        );
      }
      if (!hasMain && hasApp) {
        const rel = has(map, '/src/App.tsx') ? './App.tsx' : './App.jsx';
        put(map, '/src/main.jsx', ensureReact18Main('', rel));
      }
      return {
        filesMap: map,
        template: 'vite-react' as const,
        entry: '/src/main.jsx',
        fp: fingerprint(map),
        mode: 'passthrough' as const,
      };
    }

    // Preview router mode
    let pageFiles = Object.keys(map).filter((p) =>
      /^\/src\/pages\/[^/]+\.[jt]sx?$/.test(p),
    );
    if (allowedSet.size) pageFiles = pageFiles.filter((p) => allowedSet.has(p));

    if (pageFiles.length) {
      const pages = pageFiles
        .map((p, i) => {
          const file = p.split('/').pop()!;
          const comp = pascalSafe(file, i);
          const route = file.toLowerCase().startsWith('home.')
            ? '/'
            : `/${kebab(file)}`;
          return { importPath: `..${p}`, comp, route };
        })
        .sort((a, b) =>
          a.route === '/' ? -1 : a.route.localeCompare(b.route),
        );

      const importsPages = pages
        .map((p) => `import ${p.comp} from '${p.importPath}';`)
        .join('\n');
      const routes = pages
        .map(
          (p) =>
            `          <Route path="${p.route}" element={<${p.comp} />} />`,
        )
        .join('\n');

      put(
        map,
        '/__preview__/App.jsx',
        `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
${importsPages}

export default function App(){
  return (
    <BrowserRouter>
      <main>
        <Routes>
${routes}
        </Routes>
      </main>
    </BrowserRouter>
  );
}`.trim(),
      );

      put(
        map,
        '/src/main.jsx',
        ensureReact18Main('', '../__preview__/App.jsx'),
      );

      put(
        map,
        '/index.html',
        `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Preview</title>
</head><body><div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body></html>`,
      );

      return {
        filesMap: map,
        template: 'vite-react' as const,
        entry: '/src/main.jsx',
        fp: fingerprint(map),
        mode: 'router' as const,
      };
    }

    return {
      filesMap: map,
      template: 'vite-react' as const,
      entry: '/src/main.jsx',
      fp: fingerprint(map),
      mode: 'empty' as const,
    };
  }, [effectiveFiles, allowedSet]);

  // Routes from /src/pages
  const routeOptions = useMemo(() => {
    return routesFromPages(sp.filesMap, allowedSet);
  }, [sp.filesMap, allowedSet]);

  // Keep route valid with preference for file_path
  useEffect(() => {
    const prefer =
      mainRoute && routeOptions.some((r) => r.path === mainRoute)
        ? mainRoute
        : undefined;
    const next =
      prefer ||
      (routeOptions.some((r) => r.path === internalRoute)
        ? internalRoute
        : routeOptions[0]?.path || '/');
    if (next !== internalRoute) setInternalRoute(next);
  }, [routeOptions, internalRoute, mainRoute]);

  const selectedRoute =
    props.currentPage && routeOptions.some((r) => r.path === props.currentPage)
      ? props.currentPage
      : routeOptions.some((r) => r.path === internalRoute)
        ? internalRoute
        : mainRoute && routeOptions.some((r) => r.path === mainRoute)
          ? mainRoute
          : routeOptions[0]?.path || '/';

  // Device + zoom
  const scale = Math.max(0.5, Math.min((props.currentZoom || 100) / 100, 2));
  const frameWidth = useMemo(
    () =>
      props.currentDevice === 'Mobile'
        ? 390
        : props.currentDevice === 'Tablet'
          ? 768
          : 1280,
    [props.currentDevice],
  );

  const switchView = useCallback(
    (v: ViewMode) => {
      props.onBackToMain?.();
      setViewMode(v);
      props.onViewChange?.(v);
    },
    [props],
  );

  const handlePageChange = useCallback(
    (route: string) => {
      setInternalRoute(route);
      props.onPageChange?.(route);
    },
    [props],
  );

  const handleDeviceChange = useCallback(
    (device: string) => {
      props.onDeviceChange?.(device);
    },
    [props],
  );

  const handleZoomChange = useCallback(
    (zoom: number) => {
      props.onZoomChange?.(zoom);
    },
    [props],
  );

  const filesCount = Object.keys(sp.filesMap).length;
  const srcLabel = `${lastSourceRef.current}${dbLoading || resolvingId ? ' · loading…' : ''}`;
  console.log('EditorPreviewSection Debug:', {
    effectiveFiles: effectiveFiles.length,
    filesCount,
    spMode: sp.mode,
    pulledFiles: pulled.files?.length || 0,
    pulledWebsiteCode: pulled.website_code ? 'present' : 'missing',
    propsFiles: props.files?.length || 0,
    propsWebsiteCode: props.website_code ? 'present' : 'missing',
    dbFiles: dbFiles.length,
    lastSource: lastSourceRef.current,
  });
  const noRenderableCode = filesCount === 0 || sp.mode === 'empty';

  return (
    <Stack
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 1.5,
          borderBottom: '1px solid',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton
            size="small"
            onClick={props.onRefresh}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            <Iconify icon="basil:refresh-outline" />
          </IconButton>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
            }}
          >
            DB(projects → {String(codeField)}) · files:{filesCount} · src:
            {srcLabel} · pages:{dbPages.length}
          </Typography>
          {projectId && (
            <Chip
              size="small"
              sx={{ ml: 1 }}
              label={`project:${projectId.slice(0, 8)}`}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => switchView('preview')}
            sx={{
              borderRadius: 1,
              color: viewMode === 'preview' ? 'text.primary' : 'text.secondary',
              bgcolor:
                viewMode === 'preview'
                  ? 'rgba(255,255,255,0.1)'
                  : 'transparent',
            }}
          >
            <Iconify icon="iconamoon:eye" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => switchView('code')}
            sx={{
              borderRadius: 1,
              color: viewMode === 'code' ? 'text.primary' : 'text.secondary',
              bgcolor:
                viewMode === 'code' ? 'rgba(76,175,80,0.1)' : 'transparent',
            }}
          >
            <Iconify icon="mynaui:code" />
          </IconButton>
          <IconButton
            size="small"
            onClick={props.onDownload}
            sx={{ borderRadius: 1, color: 'text.secondary' }}
          >
            <Iconify icon="mage:download" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Controls */}
      {(viewMode === 'preview' || props.currentView === 'erd') && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            p: 1.5,
            borderBottom: '1px solid',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {routeOptions.length > 0 && (
              <>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Page
                </Typography>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <Select
                    size="small"
                    value={
                      routeOptions.some((r) => r.path === selectedRoute)
                        ? selectedRoute
                        : ''
                    }
                    onChange={(e) => handlePageChange(String(e.target.value))}
                    sx={{ color: 'text.primary', fontSize: '0.75rem' }}
                  >
                    {routeOptions.map((r) => (
                      <MenuItem
                        key={r.path}
                        value={r.path}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {r.label}{' '}
                        <span style={{ opacity: 0.6, marginLeft: 8 }}>
                          ({r.path})
                        </span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            <Button
              onClick={props.onMapClick}
              sx={{
                color: 'text.secondary',
                bgcolor: 'rgba(255,255,255,0.06)',
                borderRadius: 1,
                px: 1.7,
                py: 1.2,
                fontSize: '0.75rem',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              {props.currentView === 'erd' ||
              props.currentView === 'frontend' ||
              props.currentView === 'backend'
                ? 'Main'
                : 'Map'}
            </Button>

            <IconButton
              onClick={props.onFullscreen}
              sx={{ color: 'text.secondary' }}
            >
              <Iconify icon="mdi:arrow-expand-all" />
            </IconButton>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                size="small"
                value={String(props.currentDevice || 'Desktop')}
                onChange={(e) => handleDeviceChange(String(e.target.value))}
                sx={{ color: 'text.primary', fontSize: '0.75rem' }}
              >
                {['Desktop', 'Tablet', 'Mobile', 'Custom'].map((d) => (
                  <MenuItem key={d} value={d} sx={{ fontSize: '0.75rem' }}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                size="small"
                onClick={() =>
                  handleZoomChange(
                    Math.max((props.currentZoom || 100) - 25, 50),
                  )
                }
                disabled={(props.currentZoom || 100) <= 50}
                sx={{
                  color:
                    (props.currentZoom || 100) <= 50
                      ? 'text.disabled'
                      : 'text.secondary',
                }}
              >
                —
              </IconButton>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  minWidth: 40,
                  textAlign: 'center',
                }}
              >
                {props.currentZoom ?? 100}%
              </Typography>
              <IconButton
                size="small"
                onClick={() =>
                  handleZoomChange(
                    Math.min((props.currentZoom || 100) + 25, 200),
                  )
                }
                disabled={(props.currentZoom || 100) >= 200}
                sx={{
                  color:
                    (props.currentZoom || 100) >= 200
                      ? 'text.disabled'
                      : 'text.secondary',
                }}
              >
                +
              </IconButton>
            </Stack>

            <IconButton
              size="small"
              onClick={props.onThemeToggle}
              sx={{ color: 'text.secondary' }}
            >
              <Iconify icon="uil:moon" />
            </IconButton>
            <IconButton
              size="small"
              onClick={props.onResponsiveToggle}
              sx={{
                color: 'text.secondary',
                bgcolor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 1,
              }}
            >
              <Iconify icon="solar:monitor-linear" />
            </IconButton>
          </Stack>
        </Stack>
      )}

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          bgcolor: 'rgba(255,255,255,0.02)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {viewMode === 'code' ? (
          <CodeView
            key={`code-${selectedRoute || 'none'}`}
            currentPage={selectedRoute}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        ) : (
          <>
            {props.currentView === 'erd' && props.onViewStructure && (
              <ERDPage
                onViewStructure={props.onViewStructure}
                projectId={projectId}
              />
            )}
            {props.currentView === 'frontend' && props.onBackToERD && (
              <FrontendStructurePage
                onBackToERD={props.onBackToERD}
                onSuccessfulCodeGeneration={props.onSuccessfulCodeGeneration}
                projectId={projectId as string}
              />
            )}
            {props.currentView === 'backend' && props.onBackToERD && (
              <BackendStructurePage
                onBackToERD={props.onBackToERD}
                projectId={projectId as string}
              />
            )}

            {props.currentView === 'main' && (
              <Box
                sx={{
                  flex: 1,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                {noRenderableCode ? (
                  <Box sx={{ p: 3, maxWidth: 780 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Debug Info - لا يوجد كود صالح للمعاينة
                    </Typography>
                    <Box
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontFamily: 'monospace',
                        }}
                      >
                        Project ID: {projectId || 'None'}
                        <br />
                        Code Field: {codeField}
                        <br />
                        Files Count: {filesCount}
                        <br />
                        DB Files: {dbFiles.length}
                        <br />
                        Pages Count: {dbPages.length}
                        <br />
                        Source: {lastSourceRef.current}
                        <br />
                        Allowed Paths: {dbFilePaths.length}
                        <br />
                        Route Options: {routeOptions.length}
                      </Typography>
                    </Box>

                    {dbFiles.length > 0 && (
                      <Box
                        sx={{
                          mb: 2,
                          p: 2,
                          bgcolor: 'rgba(0,255,0,0.05)',
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: 'green', mb: 1 }}
                        >
                          Files found in DB:
                        </Typography>
                        {dbFiles.map((f, i) => (
                          <Typography
                            key={i}
                            variant="body2"
                            sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                          >
                            {f.path} ({f.content?.length || 0} chars)
                          </Typography>
                        ))}
                      </Box>
                    )}

                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}
                    >
                      {dbMsg ||
                        `
تحقق من الآتي:
1. هل البيانات محفوظة في حقل "${String(codeField)}" في جدول projects؟
2. هل الكود بالتنسيق الصحيح (JSON أو with FILE: markers)؟
3. هل project_id صحيح: ${projectId}؟

مثال على التنسيق المطلوب:
// FILE: src/App.jsx
export default function App() {
  return <div>Hello World</div>;
}

أو JSON:
[{"path": "src/App.jsx", "content": "export default function App() { return <div>Hello</div>; }"}]
                      `}
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: frameWidth,
                      maxWidth: '100%',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 0 0 4px rgba(255,255,255,0.03) inset',
                      overflow: 'hidden',
                      backgroundColor: 'background.default',
                    }}
                  >
                    <Box
                      sx={{
                        width: frameWidth / scale,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        height: `calc(${1 / scale} * 100%)`,
                      }}
                    >
                      <SandpackProvider
                        key={`sp-${filesCount}-${selectedRoute}-${sp.fp}`}
                        template={sp.template}
                        files={sp.filesMap}
                        customSetup={{
                          entry: sp.entry,
                          dependencies: {
                            react: '^18.2.0',
                            'react-dom': '^18.2.0',
                            'react-router-dom': '^6.22.0',
                          },
                        }}
                        options={{
                          recompileDelay: 250,
                          startRoute: selectedRoute || '/',
                        }}
                      >
                        <SandpackLayout style={{ height: '70vh' }}>
                          <SandpackPreview
                            style={{ height: '100%', border: 0 }}
                            showOpenInCodeSandbox={false}
                          />
                        </SandpackLayout>
                        <SandpackConsole showHeader showSyntaxError />
                      </SandpackProvider>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Stack>
  );
};

export default EditorPreviewSection;
