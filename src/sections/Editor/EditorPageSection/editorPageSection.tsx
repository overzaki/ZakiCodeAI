'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Box, Stack } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import EditorHeader from '../components/EditorHeader';
import EditorChatSection from '../components/EditorChatSection';
import EditorPreviewSection from '../components/EditorPreviewSection';
import { useEditor } from '@/hooks/useEditor';
import { supabase } from '@/lib/supabaseClient';
import JSZip from 'jszip';
import { enqueueSnackbar } from 'notistack';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type DBProject = {
  id: string;
  name?: string | null;
  website_code?: string | null;
  mobile_code?: string | null;
  backend_code?: string | null;
  updated_at?: string | null;
};

const PricingPageSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  const {
    currentView,
    projectId, // يأتي من useEditor
    generatedCode, // للحصول على files array
    isGeneratingCode, // حالة توليد الكود
    navigateToView,
    navigateToERD,
    navigateToMain,
    navigateToFrontend,
    navigateToBackend,
    clearEditor,
  } = useEditor();

  // Debug logging for code generation state
  useEffect(() => {
    console.log('EditorPageSection: isGeneratingCode changed:', isGeneratingCode);
  }, [isGeneratingCode]);

  const [chatWidthPct, setChatWidthPct] = useState(35);
  const [currentPage, setCurrentPage] = useState('Home page');
  const [currentDevice, setCurrentDevice] = useState('Desktop');
  const [currentZoom, setCurrentZoom] = useState(100);
  const isDraggingRef = useRef(false);

  // حالة المشروع من الداتابيز
  const [project, setProject] = useState<DBProject | null>(null);
  const [loading, setLoading] = useState(false);
  
  // حالة إرسال الرسائل
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  
  // حالة تحميل الملف
  const [isDownloading, setIsDownloading] = useState(false);
  
  // حالات GitHub
  const [gitHubInstallationId, setGitHubInstallationId] = useState('');
  const [gitHubRepo, setGitHubRepo] = useState('');
  const [gitHubAccount, setGitHubAccount] = useState('');
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [isPushingToGitHub, setIsPushingToGitHub] = useState(false);

  // Load GitHub settings from localStorage and URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const githubConnected = urlParams.get('github');
    const installationIdFromUrl = urlParams.get('installation_id');
    
    // Load from localStorage
    const savedInstallationId = localStorage.getItem('gh_installation_id');
    const savedRepo = localStorage.getItem('gh_default_repo');
    const savedAccount = localStorage.getItem('gh_account_login');
    
    // Prioritize URL params (from GitHub callback)
    const finalInstallationId = installationIdFromUrl || savedInstallationId;
    
    if (finalInstallationId) {
      setGitHubInstallationId(finalInstallationId);
      setIsGitHubConnected(true);
      console.log('GitHub installation ID loaded:', finalInstallationId);
    } else {
      setIsGitHubConnected(false);
    }
    
    if (savedRepo) {
      setGitHubRepo(savedRepo);
      console.log('GitHub default repo loaded:', savedRepo);
    }
    
    if (savedAccount) {
      setGitHubAccount(savedAccount);
      console.log('GitHub account loaded:', savedAccount);
    }

    // Show success message if just connected
    if (githubConnected === 'connected' && finalInstallationId) {
      enqueueSnackbar(
        `GitHub connected successfully! Installation ID: ${finalInstallationId}`,
        { variant: 'success' }
      );
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('github');
      url.searchParams.delete('installation_id');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // --- أدوات مساعدة لدفع الحمولة إلى المعاينة ---
  const pushN8nPayload = useCallback(
    (payload: { website_code?: string | null; files?: any }) => {
      try {
        localStorage.setItem('n8n_payload', JSON.stringify(payload));
      } catch {}
      (window as any).__N8N__ = payload;
      // EditorPreviewSection عامل listener لهالأيفنت
      try {
        window.dispatchEvent(new Event('n8n:payload:update'));
      } catch {}
    },
    [],
  );

  // تحميل مشروع من Supabase
  const loadProject = useCallback(
    async (id?: string | null) => {
      const pid = id || projectId || searchParams.get('projectId');
      if (!pid) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, website_code, mobile_code, backend_code, updated_at')
        .eq('id', pid)
        .maybeSingle<DBProject>();

      setLoading(false);

      if (error) {
        console.warn('Failed to load project:', error.message);
        return;
      }

      setProject(data || null);
      // ادفع الكود للمعاينة فورًا
      pushN8nPayload({
        website_code: data?.website_code || '',
        files: generatedCode?.files,
      });
    },
    [projectId, searchParams, pushN8nPayload],
  );

  // أول تحميل + عند تغيّر projectId
  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // تحديث المعاينة عند تغيّر generatedCode
  useEffect(() => {
    if (generatedCode?.files || generatedCode?.website_code) {
      console.log('EditorPageSection: Updating payload with generatedCode:', {
        hasFiles: !!generatedCode?.files,
        filesLength: Array.isArray(generatedCode?.files)
          ? generatedCode.files.length
          : 'not array',
        hasWebsiteCode: !!generatedCode?.website_code,
        projectWebsiteCode: !!project?.website_code,
      });
      pushN8nPayload({
        website_code:
          project?.website_code || generatedCode?.website_code || '',
        files: generatedCode?.files,
      });
    }
  }, [generatedCode, project?.website_code, pushN8nPayload]);

  // Realtime: حدِّث المعاينة إذا تغيّر المشروع في الداتابيز
  useEffect(() => {
    const pid = projectId || searchParams.get('projectId');
    if (!pid) return;

    const channel = supabase
      .channel(`projects:${pid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${pid}`,
        },
        (payload) => {
          const row = payload.new as DBProject;
          setProject(row);
          pushN8nPayload({
            website_code: row?.website_code || '',
            files: generatedCode?.files,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, searchParams, pushN8nPayload]);

  // سحب الـ divider
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const viewportWidth = window.innerWidth;
      const pct = clamp((e.clientX / viewportWidth) * 100, 20, 70);
      setChatWidthPct(pct);
    };
    const onUp = () => (isDraggingRef.current = false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const startDrag = () => {
    isDraggingRef.current = true;
  };

  // تنقّلات
  const handleSuccessfulGeneration = (pid: string) =>
    setTimeout(() => navigateToERD(pid), 2000);
  const handleSuccessfulCodeGeneration = (pid: string) =>
    setTimeout(() => navigateToMain(pid), 2000);
  const handleMapClick = () => {
    const newView =
      currentView === 'erd' ||
      currentView === 'frontend' ||
      currentView === 'backend'
        ? 'main'
        : 'erd';
    navigateToView(newView);
  };
  const handleNewProject = () => {
    clearEditor();
    params.delete('projectId');
    params.set('view', 'erd');
    router.replace(`?${params.toString()}`, { scroll: false });
    setProject(null);
    pushN8nPayload({ website_code: '', files: null });
  };

  // أزرار التحكم للمعاينة
  const handleRefresh = () => loadProject();
  const handleViewChange = (v: 'preview' | 'code') => {};
  
  const handleDownload = async () => {
    if (!generatedCode && !project?.website_code) {
      enqueueSnackbar('No code to download. Please generate code first.', { variant: 'warning' });
      return;
    }

    setIsDownloading(true);
    console.log('Download started:', { generatedCode, project: project?.name, projectId });
    
    try {
      const zip = new JSZip();
      const projectName = project?.name || `zaki-project-${projectId || 'unknown'}`;
      console.log('Creating ZIP for project:', projectName);
      
      // Helper function to add files to ZIP
      const addFilesToZip = (files: any, folderName?: string) => {
        if (Array.isArray(files)) {
          // Handle array format: [{path, content}]
          files.forEach((file) => {
            if (file.path && file.content) {
              const filePath = folderName ? `${folderName}/${file.path.replace(/^\//, '')}` : file.path.replace(/^\//, '');
              zip.file(filePath, file.content);
            }
          });
        } else if (files && typeof files === 'object') {
          // Handle object format: {path: {code}}
          Object.entries(files).forEach(([path, fileData]: [string, any]) => {
            if (fileData && (fileData.code || fileData.content)) {
              const filePath = folderName ? `${folderName}/${path.replace(/^\//, '')}` : path.replace(/^\//, '');
              zip.file(filePath, fileData.code || fileData.content);
            }
          });
        }
      };

      // Add generated code files
      if (generatedCode?.files) {
        console.log('Adding generated files to ZIP:', Array.isArray(generatedCode.files) ? generatedCode.files.length : Object.keys(generatedCode.files).length);
        addFilesToZip(generatedCode.files);
      }

      // Add platform-specific code if no files array exists
      if (!generatedCode?.files) {
        if (generatedCode?.website_code || project?.website_code) {
          const websiteCode = generatedCode?.website_code || project?.website_code || '';
          // Try to parse as JSON first (array format)
          try {
            const parsed = JSON.parse(websiteCode);
            if (Array.isArray(parsed)) {
              addFilesToZip(parsed, 'website');
            } else {
              // Fallback: save as single file
              zip.file('website/index.html', websiteCode);
            }
          } catch {
            // If not JSON, save as single file
            zip.file('website/index.html', websiteCode);
          }
        }

        if (generatedCode?.mobile_code) {
          zip.file('mobile/App.js', generatedCode.mobile_code);
        }

        if (generatedCode?.backend_code) {
          zip.file('backend/server.js', generatedCode.backend_code);
        }
      }

      // Add README file with project info
      const readmeContent = `# ${projectName}

This project was generated by ZakiCode AI.

## Project Information
- Project ID: ${projectId || 'N/A'}
- Generated: ${new Date().toLocaleString()}
- Type: ${currentView === 'frontend' ? 'Frontend' : currentView === 'backend' ? 'Backend' : 'Full Stack'}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open your browser and navigate to \`http://localhost:3000\`

## Generated by ZakiCode
Visit [ZakiCode](https://zakicode.ai) to generate more projects!
`;
      
      zip.file('README.md', readmeContent);

      // Generate and download ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/[^a-zA-Z0-9-_]/g, '-')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      enqueueSnackbar(`Project "${projectName}" downloaded successfully!`, { variant: 'success' });
    } catch (error: any) {
      console.error('Download error:', error);
      enqueueSnackbar(`Failed to download: ${error.message}`, { variant: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleGitHubPush = async () => {
    if (!generatedCode && !project?.website_code) {
      enqueueSnackbar('No code to push. Please generate code first.', { variant: 'warning' });
      return;
    }

    if (!isGitHubConnected || !gitHubInstallationId) {
      enqueueSnackbar('GitHub not connected. Redirecting to GitHub...', { variant: 'info' });
      const slug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || 'zakicode-app';
      window.open(`https://github.com/apps/${slug}/installations/new`, '_blank');
      return;
    }

    // If no repo selected, try to fetch and auto-select first available repo
    let targetRepo = gitHubRepo;
    if (!targetRepo) {
      try {
        enqueueSnackbar('Fetching your repositories...', { variant: 'info' });
        const repoResponse = await fetch(`/api/github/repos?installation_id=${gitHubInstallationId}`);
        const repoData = await repoResponse.json();
        
        if (repoData.repos && repoData.repos.length > 0) {
          targetRepo = repoData.repos[0].full_name;
          setGitHubRepo(targetRepo);
          localStorage.setItem('gh_default_repo', targetRepo);
          enqueueSnackbar(`Auto-selected repository: ${targetRepo}`, { variant: 'info' });
        } else {
          enqueueSnackbar('No repositories found. Please create a repository on GitHub first.', { variant: 'warning' });
          window.open('https://github.com/new', '_blank');
          return;
        }
      } catch (error) {
        enqueueSnackbar('Failed to fetch repositories. Please select one manually.', { variant: 'warning' });
        return;
      }
    }

    setIsPushingToGitHub(true);
    console.log('GitHub push started:', { generatedCode, project: project?.name, projectId });

    try {
      // Prepare files for GitHub API
      const filesToPush: Record<string, any> = {};

      if (generatedCode?.files) {
        // Handle files array or object format
        if (Array.isArray(generatedCode.files)) {
          generatedCode.files.forEach((file) => {
            if (file.path && file.content) {
              filesToPush[file.path] = { code: file.content };
            }
          });
        } else if (typeof generatedCode.files === 'object') {
          Object.assign(filesToPush, generatedCode.files);
        }
      }

      // Add platform-specific code if no files array exists
      if (Object.keys(filesToPush).length === 0) {
        if (generatedCode?.website_code || project?.website_code) {
          const websiteCode = generatedCode?.website_code || project?.website_code || '';
          try {
            const parsed = JSON.parse(websiteCode);
            if (Array.isArray(parsed)) {
              parsed.forEach((file) => {
                if (file.path && file.content) {
                  filesToPush[file.path] = { code: file.content };
                }
              });
            } else {
              filesToPush['/index.html'] = { code: websiteCode };
            }
          } catch {
            filesToPush['/index.html'] = { code: websiteCode };
          }
        }

        if (generatedCode?.mobile_code) {
          filesToPush['/App.js'] = { code: generatedCode.mobile_code };
        }

        if (generatedCode?.backend_code) {
          filesToPush['/server.js'] = { code: generatedCode.backend_code };
        }
      }

      // Add README file
      const projectName = project?.name || `zaki-project-${projectId || 'unknown'}`;
      const readmeContent = `# ${projectName}

This project was generated by ZakiCode AI.

## Project Information
- Project ID: ${projectId || 'N/A'}
- Generated: ${new Date().toLocaleString()}
- Type: ${currentView === 'frontend' ? 'Frontend' : currentView === 'backend' ? 'Backend' : 'Full Stack'}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open your browser and navigate to \`http://localhost:3000\`

## Generated by ZakiCode
Visit [ZakiCode](https://zakicode.ai) to generate more projects!
`;
      
      filesToPush['/README.md'] = { code: readmeContent };

      console.log('Pushing files to GitHub:', Object.keys(filesToPush));

      // Push to GitHub
      const response = await fetch('/api/github/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installation_id: gitHubInstallationId,
          repo_full_name: targetRepo,
          files: filesToPush,
          projectId: projectId,
          dir: `projects/${projectName.replace(/[^a-zA-Z0-9-_]/g, '-')}`
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        enqueueSnackbar(
          `Successfully pushed to ${targetRepo}! ${result.pushedFiles} files uploaded.`,
          { variant: 'success' }
        );
        console.log('GitHub push successful:', result);
      } else {
        throw new Error(result.error || 'Failed to push to GitHub');
      }

    } catch (error: any) {
      console.error('GitHub push error:', error);
      enqueueSnackbar(`Failed to push to GitHub: ${error.message}`, { variant: 'error' });
    } finally {
      setIsPushingToGitHub(false);
    }
  };

  const handleGitHubConnect = () => {
    const slug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || 'zakicode-app';
    window.open(`https://github.com/apps/${slug}/installations/new`, '_blank');
  };

  const handleGitHubDisconnect = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gh_installation_id');
      localStorage.removeItem('gh_account_login');
      localStorage.removeItem('gh_account_type');
      localStorage.removeItem('gh_connected_at');
      localStorage.removeItem('gh_default_repo');
    }
    setGitHubInstallationId('');
    setGitHubAccount('');
    setGitHubRepo('');
    setIsGitHubConnected(false);
    enqueueSnackbar('GitHub disconnected successfully!', { variant: 'success' });
  };
  
  const handlePageChange = (p: string) => setCurrentPage(p);
  const handleDeviceChange = (d: string) => setCurrentDevice(d);
  const handleZoomChange = (z: number) => setCurrentZoom(z);
  const handleFullscreen = () => {};
  const handleThemeToggle = () => {};
  const handleResponsiveToggle = () => {};
  const handleViewStructure = (type: 'frontend' | 'backend') =>
    navigateToView(type);
  const handleBackToERD = () => navigateToERD(projectId || '');
  
  // Handle header type change - auto-navigate to appropriate structure
  const handleTypeChange = (type: 'website' | 'backend' | 'app') => {
    if (!projectId) return;
    
    console.log('Header type changed to:', type, 'Current view:', currentView);
    
    // If we're currently in a structure view, navigate to the new structure
    if (currentView === 'frontend' || currentView === 'backend' || currentView === 'erd') {
      if (type === 'website' || type === 'app') {
        console.log('Navigating to frontend structure');
        navigateToFrontend(projectId);
      } else if (type === 'backend') {
        console.log('Navigating to backend structure');
        navigateToBackend(projectId);
      }
    }
    // If we're in main view, don't auto-navigate - let user click Map button
    // This preserves the current behavior for main view
  };

  return (
    <Stack
      sx={{ maxHeight: '100dvh', bgcolor: 'primary.contrastText' }}
      direction="column"
    >
      {/* Header */}
      <EditorHeader
        onTypeChange={handleTypeChange}
        onNewProject={handleNewProject}
        onUpgrade={() => {}}
        onInvite={() => {}}
        onPublish={() => {}}
      />

      {/* Content */}
      <Stack direction="row" sx={{ flex: 1, height: `calc(100dvh - 74px)` }}>
        {/* Chat */}
        <Box
          sx={{
            width: `${chatWidthPct}%`,
            minWidth: 260,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <EditorChatSection
            onSendMessage={() => {}}
            onTabChange={() => {}}
            onVisualEdit={() => {}}
            onDiscuss={() => {}}
            onSuccessfulGeneration={handleSuccessfulGeneration}
            onSuccessfulCodeGeneration={handleSuccessfulCodeGeneration}
            onLoadingChange={setIsMessageLoading}
            projectId={projectId}
            currentView={currentView}
          />
        </Box>

        {/* Divider handle */}
        <Box
          onMouseDown={startDrag}
          sx={{
            width: 6,
            cursor: 'col-resize',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
          }}
        />

        {/* Preview */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: `calc(100dvh - 74px)`,
            overflowY: 'auto',
          }}
        >
          <EditorPreviewSection
            // ← أهم سطرين: نمرر website_code من الداتابيز للمعاينة
            n8n={{
              website_code: project?.website_code || '',
              files: generatedCode?.files as any,
            }}
            // ويمكن تمرير files إذا كنت تحفظها كصفوف منفصلة
            files={generatedCode?.files as any}
            currentPage={currentPage}
            currentDevice={currentDevice}
            currentZoom={currentZoom}
            currentView={currentView}
            isMessageLoading={isMessageLoading}
            isCodeGenerating={isGeneratingCode}
            isDownloading={isDownloading}
            isPushingToGitHub={isPushingToGitHub}
            isGitHubConnected={isGitHubConnected}
            gitHubAccount={gitHubAccount}
            onRefresh={handleRefresh}
            onViewChange={handleViewChange}
            onDownload={handleDownload}
            onGitHubPush={handleGitHubPush}
            onGitHubConnect={handleGitHubConnect}
            onGitHubDisconnect={handleGitHubDisconnect}
            onPageChange={handlePageChange}
            onDeviceChange={handleDeviceChange}
            onZoomChange={handleZoomChange}
            onFullscreen={handleFullscreen}
            onThemeToggle={handleThemeToggle}
            onResponsiveToggle={handleResponsiveToggle}
            onViewStructure={handleViewStructure}
            onBackToERD={handleBackToERD}
            onBackToMain={() => navigateToMain(projectId || undefined)}
            onMapClick={handleMapClick}
            onSuccessfulCodeGeneration={handleSuccessfulCodeGeneration}
          />
        </Box>
      </Stack>
    </Stack>
  );
};

export default PricingPageSection;
