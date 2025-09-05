import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import {
  setMessage,
  setSelectedCategories,
  addCategory,
  removeCategory,
  clearEditor,
  selectEditorMessage,
  selectEditorCategories,
  selectFrontendStructure,
  selectBackendStructure,
  selectCurrentProject,
  selectGeneratedCode,
  selectCurrentView,
  selectProjectId,
  setCurrentProject,
  setGeneratedPages,
  setGeneratedCode,
  setCurrentView,
  setProjectId,
  navigateToView,
} from '../slices/editorSlice';
import {
  useGeneratePagesMutation,
  useGenerateCodeMutation,
} from '../api/editorApi';
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

  // API mutations
  const [generatePages, { isLoading: isGenerating }] =
    useGeneratePagesMutation();
  const [generateCode, { isLoading: isGeneratingCode }] =
    useGenerateCodeMutation();

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

  // Get current type from URL
  const currentType =
    (searchParams.get('type') as 'website' | 'backend' | 'app' | null) ||
    'website';

  // API functions
  const handleGeneratePages = async () => {
    if (!message?.trim() || selectedCategories.length === 0) {
      throw new Error(
        'Please provide a message and select at least one category',
      );
    }

    const request = {
      platform: selectedCategories[0] || 'website',
      prompt: message.trim(),
    };

    try {
      const result = await generatePages(request).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || 'Failed to generate pages',
      };
    }
  };

  const handleGenerateCode = async (
    projectId: string,
    pages: any[],
    chat: boolean = false,
  ) => {
    const request = {
      action: 'generate' as const,
      projectId,
      website: true,
      pages,
      chat,
    };

    try {
      const result = await generateCode(request).unwrap();
      dispatch(setGeneratedCode(result));
      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || 'Failed to generate code',
      };
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
    currentType,
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
    clearEditor: () => dispatch(clearEditor()),
  };
};

// Individual selectors for better performance
export const useEditorMessage = () =>
  useSelector((state: RootState) => state.editor.message);
export const useEditorCategories = () =>
  useSelector((state: RootState) => state.editor.selectedCategories);

// Hook to get current type from URL
export const useCurrentType = () => {
  const searchParams = useSearchParams();
  return (
    (searchParams.get('type') as 'website' | 'backend' | 'app' | null) ||
    'website'
  );
};
