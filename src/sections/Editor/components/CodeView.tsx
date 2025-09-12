'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Collapse,
  Button,
  Alert,
  LinearProgress,
  TextField,
  alpha,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectGeneratedCode,
  updateGeneratedCodeFile,
} from '@/redux/slices/editorSlice';
import Iconify from '@/components/iconify';
import {
  SandpackPreview,
  SandpackProvider,
  useActiveCode,
  useSandpack,
} from '@codesandbox/sandpack-react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-jsx';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-kuroir';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/theme-terminal';
import QRCode from 'react-qr-code';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchParams } from 'next/navigation';

// === Supabase client ===
import { supabase } from '@/lib/supabaseClient';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  language?: string;
  code?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

// ---- helpers ----------------------------------------------------
const inferLanguage = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': return 'javascript';
    case 'jsx': return 'jsx';
    case 'ts':
    case 'tsx': return 'typescript';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'html': return 'html';
    case 'md': return 'markdown';
    default: return 'jsx';
  }
};

// === Project types for DB binding ===
type ProjectRow = {
  id: string;
  name: string | null;
  updated_at: string | null;
  slug?: string | null;
};

// ---------------- CustomCodeEditor -----------------
const CustomCodeEditor = ({
  handleCodeChange,
}: {
  handleCodeChange: (newCode: string, filePath: string) => void;
}) => {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const getMode = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'jsx';
      case 'ts':
      case 'tsx': return 'javascript';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'html': return 'html';
      default: return 'javascript';
    }
  };

  const handleChange = (newCode: string) => {
    updateCode(newCode);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleCodeChange(newCode, sandpack.activeFile);
    }, 500);
  };

  React.useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), []);

  return (
    <AceEditor
      mode={getMode(sandpack.activeFile)}
      theme="terminal"
      value={code}
      onChange={handleChange}
      fontSize={14}
      height="100%"
      width="100%"
      showPrintMargin={false}
      showGutter
      highlightActiveLine
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
  );
};

// ---------------- CodeView -----------------
interface CodeViewProps {
  viewMode: 'preview' | 'code';
  setViewMode: React.Dispatch<React.SetStateAction<'preview' | 'code'>>;
  currentType?: 'website' | 'backend' | 'app';
  currentPage?: string;
}

const CodeView: React.FC<CodeViewProps> = ({
  viewMode,
  setViewMode,
  currentType = 'website',
  currentPage,
}) => {
  const t = useTranslations();
  const { copy } = useCopyToClipboard();
  const dispatch = useDispatch();
  const generatedCode = useSelector(selectGeneratedCode);

  // === projectId discovery ===
  const searchParams = useSearchParams();
  const projectIdFromQuery = searchParams.get('projectId') || undefined;
  const projectId: string | undefined =
    generatedCode?.projectId || projectIdFromQuery || undefined;

  // ===== Projects DB state =====
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [projLoading, setProjLoading] = useState(false);
  const [projError, setProjError] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Load project row + realtime
  React.useEffect(() => {
    if (!projectId) return;

    let mounted = true;
    const loadProject = async () => {
      try {
        setProjError(null);
        setProjLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, updated_at, slug')
          .eq('id', projectId)
          .maybeSingle();

        if (!mounted) return;
        setProjLoading(false);
        if (error) throw error;
        setProject(data as ProjectRow);
        setRenameValue(data?.name || '');
      } catch (err: any) {
        setProjLoading(false);
        setProjError(err?.message || 'Failed to load project');
      }
    };

    loadProject();

    const channel = supabase
      .channel(`projects:${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        () => loadProject()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Rename project
  const saveRename = async () => {
    if (!projectId) return;
    try {
      const newName = renameValue.trim();
      const { error } = await supabase
        .from('projects')
        .update({ name: newName || null })
        .eq('id', projectId);

      if (error) throw error;
      setRenameOpen(false);
    } catch (err: any) {
      setProjError(err?.message || 'Rename failed');
    }
  };

  // ===== project_files DB states =====
  const [dbError, setDbError] = useState<string | null>(null);
  const [missingTable, setMissingTable] = useState(false);
  const [saving, setSaving] = useState(false);
  const userAgentRef = React.useRef<string>('');
  React.useEffect(() => {
    if (typeof window !== 'undefined') userAgentRef.current = navigator.userAgent;
  }, []);

  // file explorer states
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [pendingCodeChanges, setPendingCodeChanges] = useState<Record<string, string>>({});
  const [sandpackError, setSandpackError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const getFileIcon = (fileName: string, language?: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (language) {
      switch (language.toLowerCase()) {
        case 'jsx':
        case 'tsx': return 'logos:react';
        case 'javascript':
        case 'js': return 'logos:javascript';
        case 'typescript':
        case 'ts': return 'logos:typescript-icon';
        case 'css': return 'logos:css-3';
        case 'html': return 'logos:html-5';
        case 'json': return 'logos:json';
        default: return 'mdi:file-code';
      }
    }
    switch (ext) {
      case 'jsx':
      case 'tsx': return 'logos:react';
      case 'js': return 'logos:javascript';
      case 'ts': return 'logos:typescript-icon';
      case 'css': return 'logos:css-3';
      case 'html': return 'logos:html-5';
      case 'json': return 'logos:json';
      case 'md': return 'logos:markdown';
      default: return 'mdi:file-code';
    }
  };

  // --- GitHub Connect & Push (Client) ---
  const search = useSearchParams();
  const [installationId, setInstallationId] = React.useState('');
  const [githubAccount, setGithubAccount] = React.useState('');
  const [isGithubConnected, setIsGithubConnected] = React.useState(false);
  
  React.useEffect(() => {
    const fromUrl = search.get('installation_id');
    const fromStore =
      typeof window !== 'undefined' ? localStorage.getItem('gh_installation_id') : '';
    const accountLogin = 
      typeof window !== 'undefined' ? localStorage.getItem('gh_account_login') : '';
    
    const finalInstallationId = fromUrl || fromStore || '';
    setInstallationId(finalInstallationId);
    setGithubAccount(accountLogin || '');
    setIsGithubConnected(!!finalInstallationId);
    
    // Save to localStorage if coming from URL
    if (fromUrl && typeof window !== 'undefined') {
      localStorage.setItem('gh_installation_id', fromUrl);
    }
  }, [search]);

  const [repoFullName, setRepoFullName] = React.useState('youruser/yourrepo');
  const projectDir = `projects/${generatedCode?.projectId || 'untitled'}`;

  // حضّر files كـ { '/path': { code } }
  const filesPayload: Record<string, { code: string }> = React.useMemo(() => {
    if (Array.isArray(generatedCode?.files)) {
      const o: Record<string, { code: string }> = {};
      for (const f of generatedCode!.files) {
        const p = f.path.startsWith('/') ? f.path : `/${f.path}`;
        o[p] = { code: f.content };
      }
      return o;
    }
    if (generatedCode?.files && typeof generatedCode.files === 'object') {
      return generatedCode.files as Record<string, { code: string }>;
    }
    return { '/README.md': { code: generatedCode?.website_code || '// empty' } };
  }, [generatedCode]);

  function connectGithub() {
    const slug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || 'zakicode-app';
    window.open(`https://github.com/apps/${slug}/installations/new`, '_blank');
  }

  function disconnectGithub() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gh_installation_id');
      localStorage.removeItem('gh_account_login');
      localStorage.removeItem('gh_account_type');
      localStorage.removeItem('gh_connected_at');
      localStorage.removeItem('gh_default_repo');
    }
    setInstallationId('');
    setGithubAccount('');
    setIsGithubConnected(false);
    setRepoFullName('youruser/yourrepo');
    alert('GitHub disconnected successfully!');
  }

  async function commitToGithub() {
    if (!installationId) {
      alert('ثبّت الـ GitHub App أولاً (installation_id مفقود).');
      return;
    }
    const res = await fetch('/api/github/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        installation_id: installationId,
        repo_full_name: repoFullName,
        dir: projectDir,
        projectId: generatedCode?.projectId,
        files: filesPayload,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(data);
      alert(`GitHub push failed: ${data?.error || res.statusText}`);
    } else {
      alert('Pushed to GitHub ✅');
    }
  }

  // ===== Build file trees (unchanged core) =====
  const createFileTreeFromFiles = (
    files:
      | Array<{ path: string; content: string }>
      | Record<string, { code: string }>,
    type: string,
  ): FileNode[] => {
    if (!files) return [];
    const fileMap: Record<string, { code: string; language?: string }> = {};
    const fileTree: FileNode[] = [];

    if (Array.isArray(files)) {
      files.forEach((file) => {
        const { path, content } = file;
        let language = inferLanguage(path);
        let normalizedPath = path.startsWith('/') ? path : `/${path}`;
        fileMap[normalizedPath] = { code: content, language };
      });
    } else {
      Object.entries(files).forEach(([path, fileData]) => {
        let language = inferLanguage(path);
        let normalizedPath = path.startsWith('/') ? path : `/${path}`;
        fileMap[normalizedPath] = { code: fileData.code, language };
      });
    }

    Object.entries(fileMap).forEach(([path, fileData]) => {
      const parts = path.split('/').filter(Boolean);
      let currentLevel = fileTree;
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const existing = currentLevel.find((n) => n.name === part);
        if (isLast) {
          if (!existing) {
            currentLevel.push({
              name: part,
              path,
              type: 'file',
              language: fileData.language,
              code: fileData.code,
            });
          }
        } else {
          if (!existing) {
            const folderNode: FileNode = {
              name: part,
              path: parts.slice(0, index + 1).join('/'),
              type: 'folder',
              children: [],
              isOpen: expandedFolders.has(parts.slice(0, index + 1).join('/')),
            };
            currentLevel.push(folderNode);
            currentLevel = folderNode.children!;
          } else {
            currentLevel = existing.children!;
          }
        }
      });
    });
    return fileTree;
  };

  const createFileTree = (code: string, type: string): FileNode[] => {
    if (!code) return [];
    const files: Record<string, { code: string; language?: string }> = {};
    const fileTree: FileNode[] = [];
    const codeBlockRegex = /```(\w+)?\s*([\w\/\.-]+)?\s*\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(code)) !== null) {
      const [, language, filename, content] = match;
      if (content && typeof content === 'string') {
        let filePath = '/App.jsx';
        if (filename && typeof filename === 'string' && filename.trim()) {
          let clean = filename.trim().replace(/^\/+|\/+$/g, '');
          if (!clean.startsWith('/')) clean = `/${clean}`;
          if (!clean.includes('.')) {
            if (language === 'json') clean += '.json';
            else if (language === 'css') clean += '.css';
            else if (language === 'html') clean += '.html';
            else clean += '.js';
          }
          filePath = clean;
        } else if (language) {
          switch ((language as string).toLowerCase()) {
            case 'json': filePath = '/package.json'; break;
            case 'css': filePath = '/styles/globals.css'; break;
            case 'html': filePath = '/index.html'; break;
            case 'javascript':
            case 'js': filePath = '/index.js'; break;
            default: filePath = '/App.jsx';
          }
        }
        let finalPath = filePath;
        let counter = 1;
        while (files[finalPath]) {
          const ext = filePath.includes('.') ? filePath.split('.').pop() : '';
          const base = filePath.replace(`.${ext}`, '');
          finalPath = `${base}_${counter}.${ext}`;
          counter++;
        }
        files[finalPath] = { code: content.trim(), language };
      }
    }
    if (Object.keys(files).length === 0) {
      files['/App.jsx'] = { code: code.trim(), language: 'jsx' };
      files['/package.json'] = {
        code: JSON.stringify(
          { dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' } },
          null,
          2,
        ),
        language: 'json',
      };
    }
    Object.entries(files).forEach(([path, fileData]) => {
      const parts = path.split('/').filter(Boolean);
      let currentLevel = fileTree;
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const existing = currentLevel.find((n) => n.name === part);
        if (isLast) {
          if (!existing) {
            currentLevel.push({
              name: part,
              path,
              type: 'file',
              language: fileData.language,
              code: fileData.code,
            });
          }
        } else {
          if (!existing) {
            const folderNode: FileNode = {
              name: part,
              path: parts.slice(0, index + 1).join('/'),
              type: 'folder',
              children: [],
              isOpen: expandedFolders.has(parts.slice(0, index + 1).join('/')),
            };
            currentLevel.push(folderNode);
            currentLevel = folderNode.children!;
          } else {
            currentLevel = existing.children!;
          }
        }
      });
    });
    return fileTree;
  };

  const fileTrees = useMemo(() => {
    const trees: Record<string, FileNode[]> = {};
    if (generatedCode?.files) {
      const hasFiles = Array.isArray(generatedCode?.files)
        ? generatedCode?.files?.length > 0
        : Object.keys(generatedCode?.files).length > 0;
      if (hasFiles) trees['website'] = createFileTreeFromFiles(generatedCode?.files, 'website');
    } else if (generatedCode?.website_code) {
      trees['website'] = createFileTree(generatedCode?.website_code, 'website');
    }
    if (generatedCode?.mobile_code) trees['app'] = createFileTree(generatedCode?.mobile_code, 'app');
    if (generatedCode?.backend_code) trees['backend'] = createFileTree(generatedCode?.backend_code, 'backend');
    return trees;
  }, [generatedCode, expandedFolders]);

  const getAllFiles = (): Record<string, any> => {
    const all: Record<string, any> = {};
    Object.values(fileTrees).forEach((tree) => {
      const walk = (nodes: FileNode[]) =>
        nodes.forEach((n) => {
          if (n.type === 'file' && n.code) all[n.path] = { code: n.code };
          else if (n.type === 'folder' && n.children) walk(n.children);
        });
      walk(tree);
    });
    return all;
  };
  const files = React.useMemo(() => getAllFiles(), [fileTrees]);

  // اختياري: افتح ملف الصفحة تلقائياً
  React.useEffect(() => {
    if (!currentPage) return;
    const clean = currentPage.replace(/\s*page$/i, '').trim();
    const candidates = [
      `/src/pages/${clean}.jsx`,
      `/src/pages/${clean}.tsx`,
      `/src/${clean}.jsx`,
      `/src/${clean}.tsx`,
      `/pages/${clean}.jsx`,
      `/pages/${clean}.tsx`,
    ];
    for (const p of candidates) {
      if (files[p]) {
        setSelectedFile(p);
        setOpenFiles((prev) => new Set([...Array.from(prev), p]));
        return;
      }
    }
  }, [currentPage, files]);

  // === Detect project type (unchanged) ===
  const detectProjectType = useMemo(() => {
    const packageJsonFile = files['/package.json'];
    let dependencies: Record<string, string> = {};
    let detectedType: 'nextjs' | 'react' | 'vanilla' | 'node' = 'vanilla';
    if (packageJsonFile) {
      try {
        const pkg = JSON.parse(packageJsonFile.code);
        dependencies = pkg.dependencies || {};
        if (dependencies.next) detectedType = 'nextjs';
        else if (dependencies.react) detectedType = 'react';
        else if (dependencies.express || dependencies.koa || dependencies.fastify) detectedType = 'node';
      } catch {}
    } else {
      if (files['/pages/_app.js'] || files['/pages/_app.tsx'] || files['/next.config.js']) detectedType = 'nextjs';
      else if (files['/src/App.js'] || files['/src/App.tsx'] || files['/public/index.html']) detectedType = 'react';
      else if (files['/server.js'] || files['/app.js'] || files['/index.js']) detectedType = 'node';
    }
    return { type: detectedType, dependencies };
  }, [files]);

  const getSandpackConfig = useMemo(() => {
    const { type, dependencies } = detectProjectType;
    const sandboxConfig = generatedCode?.sandbox;
    let template: 'nextjs' | 'react' | 'vanilla' | 'node' = 'vanilla';
    let customDependencies: Record<string, string> = {};
    let activeFile = viewMode === 'code' ? selectedFile : '/src/index.js';

    if (sandboxConfig?.template) template = sandboxConfig.template as any;
    else {
      if (type === 'nextjs') template = 'nextjs';
      else if (type === 'react') template = 'react';
      else if (type === 'node') template = 'node';
      else template = 'vanilla';
    }

    switch (template) {
      case 'nextjs':
        customDependencies = {
          next: dependencies.next || '^13.0.0',
          react: dependencies.react || '^18.2.0',
          'react-dom': dependencies['react-dom'] || '^18.2.0',
          ...dependencies,
        };
        break;
      case 'react':
        customDependencies = {
          react: dependencies.react || '^18.2.0',
          'react-dom': dependencies['react-dom'] || '^18.2.0',
          ...dependencies,
        };
        break;
      case 'node':
        customDependencies = { express: dependencies.express || '^4.18.0', ...dependencies };
        break;
      default:
        customDependencies = dependencies;
    }

    if (sandboxConfig?.entry) activeFile = sandboxConfig.entry;
    else if (viewMode === 'preview') {
      switch (template) {
        case 'react': activeFile = '/src/index.js'; break;
        case 'nextjs': activeFile = '/pages/index.js'; break;
        case 'vanilla': activeFile = '/index.html'; break;
        case 'node': activeFile = '/index.js'; break;
      }
    }

    return {
      template: template as any,
      dependencies: customDependencies,
      activeFile,
      openPath: sandboxConfig?.openPath,
      installCommand: sandboxConfig?.installCommand,
      startCommand: sandboxConfig?.startCommand,
    };
  }, [detectProjectType, generatedCode?.sandbox, viewMode, selectedFile]);

  const cleanFilesForSandpack = useMemo(() => {
    const cleaned: Record<string, { code: string }> = {};
    const { dependencies } = detectProjectType;
    Object.entries(files).forEach(([path, fileData]) => {
      let content = fileData.code;
      if (path === '/package.json') {
        try {
          const pkg = JSON.parse(content);
          if (pkg.dependencies) {
            delete pkg.dependencies.vite;
            delete pkg.dependencies['@vitejs/plugin-react'];
          }
          if (pkg.devDependencies) {
            delete pkg.devDependencies.vite;
            delete pkg.devDependencies['@vitejs/plugin-react'];
          }
          if (pkg.scripts) {
            if (pkg.scripts.dev === 'vite') pkg.scripts.dev = 'react-scripts start';
            if (pkg.scripts.build === 'vite build') pkg.scripts.build = 'react-scripts build';
            if (pkg.scripts.preview === 'vite preview') delete pkg.scripts.preview;
          }
          pkg.dependencies = { ...pkg.dependencies, ...dependencies };
          content = JSON.stringify(pkg, null, 2);
        } catch {}
      }
      if (path === '/firebaseConfig.js') {
        cleaned['/firebaseConfig.js'] = { code: content };
        return;
      }
      cleaned[path] = { code: content };
    });

    if (!cleaned['/package.json']) {
      const defaultPkg = {
        name: 'sandpack-app',
        private: true,
        scripts: {
          dev: detectProjectType.type === 'nextjs' ? 'next dev' : detectProjectType.type === 'react' ? 'react-scripts start' : 'node index.js',
          build: detectProjectType.type === 'nextjs' ? 'next build' : detectProjectType.type === 'react' ? 'react-scripts build' : "echo 'No build script'",
          start: detectProjectType.type === 'nextjs' ? 'next start' : detectProjectType.type === 'react' ? 'react-scripts start' : 'node index.js',
        },
        dependencies: dependencies,
      };
      cleaned['/package.json'] = { code: JSON.stringify(defaultPkg, null, 2) };
    }
    if (detectProjectType.type === 'nextjs' && !cleaned['/next.config.js']) {
      cleaned['/next.config.js'] = {
        code: "/** @type {import('next').NextConfig} */\nconst nextConfig = { reactStrictMode: true };\nmodule.exports = nextConfig;",
      };
    }
    return cleaned;
  }, [files, detectProjectType]);

  const sandpackFiles = cleanFilesForSandpack;

  const generateExpoUrl = () => {
    const projectIdX = generatedCode?.projectId || 'demo-project';
    const timestamp = Date.now();
    return `exp://192.168.1.100:8081?projectId=${projectIdX}&timestamp=${timestamp}`;
  };
  const expoUrl = generateExpoUrl();

  const handleFolderToggle = (folderPath: string) => {
    const next = new Set(expandedFolders);
    next.has(folderPath) ? next.delete(folderPath) : next.add(folderPath);
    setExpandedFolders(next);
  };
  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    setOpenFiles((prev) => new Set(Array.from(prev).concat(filePath)));
  };
  const handleFileClose = (filePath: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const next = new Set(openFiles);
    next.delete(filePath);
    setOpenFiles(next);
    if (selectedFile === filePath) {
      const rest = Array.from(next);
      setSelectedFile(rest[0] || null);
    }
  };
  const handleCloseAll = () => {
    setOpenFiles(new Set());
    setSelectedFile(null);
  };

  const handleCodeChange = useCallback((newCode: string, filePath: string) => {
    setPendingCodeChanges((prev) => ({ ...prev, [filePath]: newCode }));
  }, []);

  const debouncedPendingChanges = useDebounce(pendingCodeChanges, 1000);

  // ===== seed files from DB on mount =====
  React.useEffect(() => {
    if (!projectId) return;
    (async () => {
      setDbError(null);
      const { data, error } = await supabase
        .from('project_files')
        .select('path, content, language')
        .eq('project_id', projectId);

      if (error) {
        const msg = error.message || String(error);
        setDbError(msg);
        if (/relation .*project_files.* does not exist/i.test(msg) || msg.includes('project_files')) {
          setMissingTable(true);
        }
        return;
      }

      if (data && data.length) {
        data.forEach((row) => {
          const p = row.path?.startsWith('/') ? row.path : `/${row.path}`;
          dispatch(updateGeneratedCodeFile({ filePath: p, content: row.content || '' }));
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ===== persist changes to project_files + touch projects.updated_at =====
  React.useEffect(() => {
    if (!projectId) return;
    const save = async () => {
      const entries = Object.entries(debouncedPendingChanges);
      if (!entries.length) return;
      setSaving(true);
      setDbError(null);

      const rows = entries.map(([path, content]) => ({
        project_id: projectId,
        path: path.startsWith('/') ? path : `/${path}`,
        content,
        language: inferLanguage(path),
      }));

      const { error: upsertError } = await supabase
        .from('project_files')
        .upsert(rows, { onConflict: 'project_id,path' });

      if (upsertError) {
        const msg = upsertError.message || String(upsertError);
        setDbError(msg);
        if (/relation .*project_files.* does not exist/i.test(msg) || msg.includes('project_files')) {
          setMissingTable(true);
        }
      } else {
        // "لمسة" على projects.updated_at لتتبع آخر تعديل للكود
        await supabase.from('projects').update({ updated_at: new Date().toISOString() }).eq('id', projectId);

        // optional activity log
        const { data: userData } = await supabase.auth.getUser();
        const actorId = userData?.user?.id;
        if (actorId) {
          await supabase.from('activity_logs').insert({
            workspace_id: null,
            actor_id: actorId,
            action: 'file.upsert',
            target_type: 'project',
            target_id: String(projectId),
            message: `Updated ${rows.length} file(s)`,
            meta: { files: rows.map((r) => r.path), project_id: projectId },
            user_agent: userAgentRef.current,
          });
        }
      }
      setSaving(false);
    };
    if (Object.keys(debouncedPendingChanges).length > 0) save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPendingChanges, projectId]);

  const handleRetry = () => {
    setSandpackError(null);
    setRetryCount((prev) => prev + 1);
  };

  const renderFileTree = (nodes: FileNode[], level: number = 0) =>
    nodes.map((node) => (
      <Box key={node.path}>
        <ListItem disablePadding sx={{ pl: level * 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } }}>
          <ListItemButton
            onClick={() => {
              if (node.type === 'folder') handleFolderToggle(node.path);
              else handleFileSelect(node.path);
            }}
            selected={selectedFile === node.path}
            sx={{
              minHeight: 32,
              '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Iconify
                icon={
                  node.type === 'folder'
                    ? expandedFolders.has(node.path)
                      ? 'mdi:folder-open'
                      : 'mdi:folder'
                    : getFileIcon(node.name, node.language)
                }
                sx={{ fontSize: 16, color: node.type === 'folder' ? 'warning.main' : 'text.secondary' }}
              />
            </ListItemIcon>
            <ListItemText primary={node.name} primaryTypographyProps={{ fontSize: '0.875rem', color: 'text.primary' }} />
            {node.type === 'file' && openFiles.has(node.path) && (
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mr: 1 }} />
            )}
          </ListItemButton>
        </ListItem>
        {node.type === 'folder' && node.children && (
          <Collapse in={expandedFolders.has(node.path)} timeout="auto" unmountOnExit>
            {renderFileTree(node.children, level + 1)}
          </Collapse>
        )}
      </Box>
    ));

  React.useEffect(() => {
    if (!currentPage && !selectedFile && Object.keys(files).length > 0) {
      const firstFile = Object.keys(files)[0];
      setSelectedFile(firstFile);
      setOpenFiles(new Set([firstFile]));
    }
  }, [files, selectedFile, currentPage]);

  if (!generatedCode) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Generate code first to view it here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* DB status bar (projects + project_files) */}
      {(projLoading || project || projError || saving || dbError || missingTable) && (
        <Box sx={{ p: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(0,0,0,0.15)' }}>
          {/* Projects info / rename */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: (saving || dbError || missingTable) ? 1 : 0 }}>
            {projLoading && <LinearProgress sx={{ flex: 1, mr: 1 }} />}
            {projectId && (
              <Chip size="small" label={`ID: ${projectId}`} variant="outlined" />
            )}
            {project?.name && !renameOpen && (
              <Chip
                size="small"
                label={`Project: ${project.name}`}
                onDelete={() => setRenameOpen(true)}
                deleteIcon={<Iconify icon="mdi:pencil" />}
                sx={{ '& .MuiChip-deleteIcon': { ml: 0.5 } }}
              />
            )}
            {renameOpen && (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="Project name"
                />
                <IconButton size="small" color="success" onClick={saveRename}>
                  <Iconify icon="mdi:check" />
                </IconButton>
                <IconButton size="small" color="inherit" onClick={() => setRenameOpen(false)}>
                  <Iconify icon="mdi:close" />
                </IconButton>
              </Stack>
            )}
            {project?.updated_at && (
              <Chip size="small" label={`Updated: ${new Date(project.updated_at).toLocaleString()}`} />
            )}
            {projError && (
              <Alert severity="error" sx={{ ml: 1, py: 0.25 }}>
                {projError}
              </Alert>
            )}
          </Stack>

          {/* project_files status */}
          {saving && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <LinearProgress sx={{ flex: 1 }} />
              <Chip size="small" label="Saving to Supabase..." />
            </Stack>
          )}
          {dbError && (
            <Alert severity="error" sx={{ mt: saving ? 1 : 0 }}>
              Database error: {dbError}
            </Alert>
          )}
          {missingTable && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              لا يوجد جدول لحفظ ملفات المشروع (<b>project_files</b>). أنشئه بالـ SQL الخاص بك ثم أعد المحاولة.
            </Alert>
          )}
        </Box>
      )}

      <Box sx={{ height: '100%', display: 'flex' }}>
        {/* Sidebar */}
        {viewMode === 'code' && (
          <Box
            sx={{
              width: 280,
              borderRight: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              bgcolor: 'rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderBottom: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                EXPLORER
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', height: '100%' }}>
              {Object.entries(fileTrees).map(([type, tree]) => (
                <Box key={type} sx={{ height: 1 }}>
                  <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <Iconify
                      icon={type === 'website' ? 'logos:react' : type === 'app' ? 'logos:react' : 'logos:nodejs-icon'}
                      sx={{ fontSize: 16 }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {type}
                    </Typography>
                    <Chip
                      label={tree.length}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.625rem',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'text.secondary',
                      }}
                    />
                  </Box>
                  <List dense disablePadding sx={{ height: '100%' }}>
                    {renderFileTree(tree)}
                  </List>
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Main */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
          {/* Tabs header */}
          {viewMode === 'code' && openFiles.size > 0 ? (
            <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', bgcolor: 'rgba(0,0,0,0.1)' }}>
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': { height: 4 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
                }}
              >
                {Array.from(openFiles).map((filePath) => {
                  const fileName = filePath.split('/').pop() || filePath;
                  const isSelected = selectedFile === filePath;
                  return (
                    <Box
                      key={filePath}
                      onClick={() => setSelectedFile(filePath)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        minWidth: 120,
                        maxWidth: 200,
                        cursor: 'pointer',
                        borderRight: 1,
                        borderColor: 'rgba(255,255,255,0.1)',
                        bgcolor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                        '&:hover': {
                          bgcolor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                        },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <Iconify icon={getFileIcon(fileName)} sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelected ? 'text.primary' : 'text.secondary',
                          fontSize: '0.75rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {fileName}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleFileClose(filePath, e)}
                        sx={{
                          width: 16,
                          height: 16,
                          color: 'text.secondary',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'error.main' },
                        }}
                      >
                        <Iconify icon="mdi:close" sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  );
                })}
                {openFiles.size > 1 && (
                  <IconButton
                    size="small"
                    onClick={handleCloseAll}
                    sx={{
                      width: 24,
                      height: 24,
                      color: 'text.secondary',
                      mx: 1,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'error.main' },
                    }}
                    title="Close all files"
                  >
                    <Iconify icon="mdi:close-box-multiple" sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Stack>
            </Box>
          ) : null}

          {/* GitHub actions */}
          <Box sx={{ p: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 1, alignItems: 'center' }}>
            {!isGithubConnected ? (
              <Button variant="outlined" onClick={connectGithub} startIcon={<Iconify icon="mdi:github" />}>
                Connect GitHub
              </Button>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip 
                  icon={<Iconify icon="mdi:github" />}
                  label={githubAccount ? `Connected: ${githubAccount}` : `Connected (ID: ${installationId.slice(-6)})`}
                  color="success"
                  variant="outlined"
                  onDelete={disconnectGithub}
                  deleteIcon={<Iconify icon="mdi:close" />}
                  sx={{ 
                    '& .MuiChip-deleteIcon': { 
                      ml: 0.5,
                      '&:hover': { color: 'error.main' }
                    }
                  }}
                />
              </Stack>
            )}
            
            {isGithubConnected && (
              <>
                <TextField 
                  size="small" 
                  label="owner/repo" 
                  value={repoFullName} 
                  onChange={(e) => setRepoFullName(e.target.value)} 
                  sx={{ minWidth: 260 }} 
                />
                <Button 
                  variant="contained" 
                  onClick={commitToGithub} 
                  startIcon={<Iconify icon="mdi:upload" />}
                  disabled={!installationId}
                >
                  Push code
                </Button>
              </>
            )}
            
            <Box sx={{ flex: 1 }} />
            {project?.name && <Chip size="small" variant="outlined" label={`Project: ${project.name}`} />}
            {projectId && <Chip size="small" label={`ID: ${projectId}`} />}
          </Box>

          {/* Content Area */}
          <Box sx={{ flex: 1, overflow: 'hidden', '& > div': { height: '100%' } }}>
            {selectedFile && files[selectedFile] ? (
              <SandpackProvider
                key={`sp-${retryCount}-${currentPage || 'none'}-${viewMode}`}
                template={getSandpackConfig.template}
                files={sandpackFiles}
                theme="dark"
                options={{
                  activeFile: selectedFile || getSandpackConfig.activeFile || undefined,
                  autorun: true,
                  recompileMode: 'immediate',
                }}
                customSetup={{ dependencies: getSandpackConfig.dependencies }}
                onError={(error: any) => {
                  console.error('Sandpack Error:', error);
                  setSandpackError(typeof error === 'string' ? error : 'Unknown error occurred');
                }}
              >
                {viewMode === 'code' ? (
                  <CustomCodeEditor handleCodeChange={handleCodeChange} />
                ) : currentType === 'app' ? (
                  <Box
                    sx={{
                      height: '100%',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.1)',
                      p: 2,
                      gap: 2,
                    }}
                  >
                    {/* iPhone-like frame */}
                    <Box
                      sx={{
                        height: { xs: 280, sm: 320, md: 420 },
                        aspectRatio: '9 / 16',
                        bgcolor: '#000',
                        borderRadius: 3,
                        p: 1.2,
                        position: 'relative',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        background:
                          'linear-gradient(123deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.03) 46%, rgba(0,0,0,0.9) 61%, #000 100%)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '45%',
                          height: '25px',
                          bgcolor: '#2a2a2a',
                          borderRadius: '0 0 15px 15px',
                          zIndex: 1,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: { xs: 6, sm: 7, md: 8 },
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: { xs: 100, sm: 120, md: 134 },
                          height: { xs: 4, sm: 4.5, md: 5 },
                          bgcolor: '#000',
                          borderRadius: 2,
                        },
                      }}
                    >
                      {/* screen */}
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          bgcolor: '#fff',
                          borderRadius: 2,
                          overflow: 'hidden',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '30%',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                            pointerEvents: 'none',
                            zIndex: 1,
                          },
                        }}
                      >
                        <SandpackPreview style={{ height: '100%', width: '100%' }} />
                      </Box>
                    </Box>

                    {/* QR Code Section */}
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2, p: 3, maxWidth: 300 }}>
                      <Typography variant="h6" sx={{ color: 'text.primary', fontSize: '1rem', fontWeight: 600 }}>
                        Test On Your Phone
                      </Typography>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          bgcolor: '#fff',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid rgba(255,255,255,0.2)',
                          p: 1,
                        }}
                      >
                        <QRCode value={expoUrl} size={100} level="M" fgColor="#000000" bgColor="#ffffff" style={{ width: '100%', height: '100%' }} />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                          Scan QR Code To test
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copy(expoUrl)}
                          sx={{
                            color: 'text.secondary',
                            bgcolor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'primary.main' },
                          }}
                          title="Copy Expo URL"
                        >
                          <Iconify icon="mdi:content-copy" sx={{ fontSize: 14 }} />
                        </IconButton>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.disabled',
                            fontSize: '0.5rem',
                            fontFamily: 'monospace',
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={expoUrl}
                        >
                          {expoUrl}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem' }}>
                          To test on your device:
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem' }}>
                          1. Open Camera App
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem' }}>
                          2. Scan QR Code above
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          borderRadius: 1,
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          gap: 1,
                        }}
                      >
                        <Iconify icon="zondicons:exclamation-outline" color="text.secondary" sx={{ width: 16, height: 16, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem', lineHeight: 1.3 }}>
                          Browser preview lacks native functions & looks different. Test on device for the best results.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ height: '100%', position: 'relative' }}>
                    {sandpackError ? (
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(255,0,0,0.1)',
                          p: 3,
                          gap: 2,
                        }}
                      >
                        <Iconify icon="mdi:alert-circle" sx={{ fontSize: 48, color: 'error.main' }} />
                        <Typography variant="h6" sx={{ color: 'error.main' }}>
                          Sandpack Error
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 400 }}>
                          {sandpackError}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                          This is usually a temporary network or server issue.
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Button variant="contained" onClick={handleRetry} startIcon={<Iconify icon="mdi:refresh" />}>
                            Retry
                          </Button>
                          <Button variant="outlined" onClick={() => setSandpackError(null)}>
                            Dismiss
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <SandpackPreview
                        key={`sandpack-${retryCount}`}
                        style={{ height: '100%' }}
                        showRefreshButton
                        showOpenInCodeSandbox={false}
                        showNavigator={false}
                        onError={(error: any) => {
                          console.error('Sandpack Preview Error:', error);
                          setSandpackError(typeof error === 'string' ? error : 'Preview failed to load');
                        }}
                      />
                    )}
                  </Box>
                )}
              </SandpackProvider>
            ) : (
              <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Select a file to view its contents
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CodeView;
