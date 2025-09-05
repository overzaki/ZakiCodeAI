import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import {
  selectEditorMessage,
  selectEditorCategories,
  setMessage,
  setSelectedCategories,
  addCategory,
  removeCategory,
  selectFrontendStructure,
  selectBackendStructure,
  selectCurrentProject,
  selectGeneratedCode,
  setCurrentProject,
  setGeneratedPages,
  setGeneratedCode,
  // Navigation selectors and actions
  selectCurrentView,
  selectProjectId,
  setCurrentView,
  setProjectId,
  navigateToView,
  clearEditor,
} from '@/redux/slices/editorSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

export const useEditor = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State selectors
  const message = useSelector(selectEditorMessage);
  const selectedCategories = useSelector(selectEditorCategories);
  const frontendStructure = useSelector(selectFrontendStructure);
  const backendStructure = useSelector(selectBackendStructure);
  const currentProject = useSelector(selectCurrentProject);
  const generatedCode = useSelector(selectGeneratedCode);
  const currentView = useSelector(selectCurrentView);
  const projectId = useSelector(selectProjectId);

  // Loading states
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = React.useState(false);

  // Navigation functions
  const updateURL = (
    newView: 'main' | 'erd' | 'frontend' | 'backend',
    newProjectId?: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    if (newProjectId) {
      params.set('projectId', newProjectId);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const navigateToViewHandler = (
    view: 'main' | 'erd' | 'frontend' | 'backend',
    projectId?: string,
  ) => {
    dispatch(navigateToView({ view, projectId }));
    updateURL(view, projectId);
  };

  const navigateToERD = (projectId: string) => {
    navigateToViewHandler('erd', projectId);
  };

  const navigateToMain = (projectId?: string) => {
    navigateToViewHandler('main', projectId);
  };

  const navigateToFrontend = (projectId?: string) => {
    navigateToViewHandler('frontend', projectId);
  };

  const navigateToBackend = (projectId?: string) => {
    navigateToViewHandler('backend', projectId);
  };

  // Sync URL with Redux state on mount
  React.useEffect(() => {
    const urlView = searchParams.get('view') as
      | 'main'
      | 'erd'
      | 'frontend'
      | 'backend'
      | null;
    const urlProjectId = searchParams.get('projectId');

    if (urlView && urlView !== currentView) {
      dispatch(setCurrentView(urlView));
    }

    if (urlProjectId && urlProjectId !== projectId) {
      dispatch(setProjectId(urlProjectId));
    }
  }, [searchParams, currentView, projectId, dispatch]);

  // API functions - مباشر إلى N8N
  const handleGeneratePages = async () => {
    if (!message?.trim()) {
      throw new Error(
        'Please provide a message and select at least one category',
      );
    }

    setIsGenerating(true);
    
    const request = {
      action: 'init',
      platform: selectedCategories[0] || 'website',
      prompt: message.trim(),
      website: true,
      chat: true,
    };

    try {
      const response = await fetch('/api/n8n/builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Generate pages error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to generate pages',
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCode = async (
    projectId: string,
    pages: any[],
    chat: boolean = false,
  ) => {
    setIsGeneratingCode(true);

    const request = {
      action: 'generate',
      projectId,
      website: true,
      pages,
      chat,
    };

    try {
      const response = await fetch('https://overzakiar.app.n8n.cloud/webhook/builder', {        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      dispatch(setGeneratedCode(result));
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Generate code error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to generate code',
      };
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return {
    // State
    message,
    selectedCategories,
    frontendStructure,
    backendStructure,
    currentProject,
    generatedCode,
    currentView,
    projectId,
    isLoading: isGenerating,
    isGeneratingCode,

    // Actions
    setMessage: (msg: string) => dispatch(setMessage(msg)),
    setSelectedCategories: (categories: string[]) =>
      dispatch(setSelectedCategories(categories)),
    addCategory: (category: string) => dispatch(addCategory(category)),
    removeCategory: (category: string) => dispatch(removeCategory(category)),
    setCurrentProject: (project: string | null) =>
      dispatch(setCurrentProject(project)),
    setGeneratedPages: (data: { projectId: string; pages: any[] }) =>
      dispatch(setGeneratedPages(data)),
    setGeneratedCode: (code: any) => dispatch(setGeneratedCode(code)),
    clearEditor: () => dispatch(clearEditor()),

    // Navigation
    navigateToView: navigateToViewHandler,
    navigateToERD,
    navigateToMain,
    navigateToFrontend,
    navigateToBackend,
    updateURL,

    // API
    generatePages: handleGeneratePages,
    generateCode: handleGenerateCode,
  };
};