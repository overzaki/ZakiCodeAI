import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/store';
import { Node, Edge } from '@xyflow/react';
import {
  IPageData as ApiPageData,
  IBuilderCodeResponse,
} from '../api/editorApi';

export interface IPageData {
  pageName: string;
  optionalDescription: string;
  parentPage: string | null;
  pageType:
    | 'home'
    | 'catalog'
    | 'detail'
    | 'auth'
    | 'profile'
    | 'admin'
    | 'custom'
    | 'api';
  platform: 'website' | 'mobile' | 'both' | 'backend';
}

export interface IFrontendStructure {
  pages: IPageData[];
  nodes: Node[];
  edges: Edge[];
  isGenerated: boolean;
}

export interface IBackendStructure {
  entities: any[];
  relationships: any[];
  nodes: Node[];
  edges: Edge[];
  isGenerated: boolean;
}

export interface IChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: string; // ISO string instead of Date object for Redux serialization
  avatar?: string;
  name?: string;
}

interface EditorState {
  message: string;
  selectedCategories: string[];
  frontendStructure: IFrontendStructure;
  backendStructure: IBackendStructure;
  chatMessages: IChatMessage[];
  currentProject: string | null;
  generatedCode: IBuilderCodeResponse | null;
  // Navigation state
  currentView: 'main' | 'erd' | 'frontend' | 'backend';
  projectId: string | null;
  // New project creation flag
  isCreatingNewProject: boolean;
}

// Load initial state from localStorage if available
const loadInitialState = (): EditorState => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('editor-state');
      if (saved) {
        const savedJson = JSON.parse(saved);
        return {
          message: savedJson.message || '',
          selectedCategories: savedJson?.selectedCategories || [],
          frontendStructure: {
            pages: savedJson?.frontendStructure?.pages || [],
            nodes: savedJson?.frontendStructure?.nodes || [],
            edges: savedJson?.frontendStructure?.edges || [],
            isGenerated: savedJson?.frontendStructure?.isGenerated || false,
          },
          backendStructure: {
            entities: savedJson?.backendStructure?.entities || [],
            relationships: savedJson?.backendStructure?.relationships || [],
            nodes: savedJson?.backendStructure?.nodes || [],
            edges: savedJson?.backendStructure?.edges || [],
            isGenerated: savedJson?.backendStructure?.isGenerated || false,
          },
          chatMessages: savedJson?.chatMessages || [],
          currentProject: savedJson?.currentProject || null,
          generatedCode: savedJson?.generatedCode || null,
          // Navigation state
          currentView: savedJson?.currentView || 'main',
          projectId: savedJson?.projectId || null,
          isCreatingNewProject: savedJson?.isCreatingNewProject || false,
        };
      }
    } catch (error) {
      console.warn('Failed to load editor state from localStorage:', error);
    }
  }
  return {
    message: '',
    selectedCategories: [],
    frontendStructure: {
      pages: [],
      nodes: [],
      edges: [],
      isGenerated: false,
    },
    backendStructure: {
      entities: [],
      relationships: [],
      nodes: [],
      edges: [],
      isGenerated: false,
    },
    chatMessages: [],
    currentProject: null,
    generatedCode: null,
    // Navigation state
    currentView: 'main',
    projectId: null,
    isCreatingNewProject: false,
  };
};

const initialState: EditorState = loadInitialState();

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
      saveToLocalStorage(state);
    },
    setSelectedCategories: (state, action: PayloadAction<string[]>) => {
      state.selectedCategories = action.payload;
      saveToLocalStorage(state);
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.selectedCategories.includes(action.payload)) {
        state.selectedCategories.push(action.payload);
        saveToLocalStorage(state);
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategories = state.selectedCategories.filter(
        (cat) => cat !== action.payload,
      );
      saveToLocalStorage(state);
    },
    // Frontend Structure Actions
    setFrontendStructure: (
      state,
      action: PayloadAction<IFrontendStructure>,
    ) => {
      state.frontendStructure = action.payload as any;
      saveToLocalStorage(state);
    },
    updateFrontendPages: (state, action: PayloadAction<IPageData[]>) => {
      // Ensure frontendStructure exists
      if (!state.frontendStructure) {
        state.frontendStructure = {
          pages: [],
          nodes: [],
          edges: [],
          isGenerated: false,
        };
      }
      
      console.log('Redux updateFrontendPages: Updating with pages:', action.payload.length);
      state.frontendStructure.pages = action.payload;
      saveToLocalStorage(state);
    },
    addFrontendPage: (state, action: PayloadAction<IPageData>) => {
      // Ensure frontendStructure and pages array exist
      if (!state.frontendStructure) {
        state.frontendStructure = {
          pages: [],
          nodes: [],
          edges: [],
          isGenerated: false,
        };
      }
      if (!state.frontendStructure.pages) {
        state.frontendStructure.pages = [];
      }
      
      console.log('Redux addFrontendPage: Adding page:', action.payload);
      console.log('Redux addFrontendPage: Current pages count:', state.frontendStructure.pages.length);
      
      state.frontendStructure.pages.push(action.payload);
      
      console.log('Redux addFrontendPage: New pages count:', state.frontendStructure.pages.length);
      
      saveToLocalStorage(state);
    },
    updateFrontendPage: (
      state,
      action: PayloadAction<{ index: number; page: IPageData }>,
    ) => {
      const { index, page } = action.payload;
      if (index >= 0 && index < state.frontendStructure.pages.length) {
        state.frontendStructure.pages[index] = page;
        saveToLocalStorage(state);
      }
    },
    removeFrontendPage: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.frontendStructure.pages.length) {
        state.frontendStructure.pages.splice(index, 1);
        saveToLocalStorage(state);
      }
    },
    setFrontendNodes: (state, action: PayloadAction<Node[]>) => {
      state.frontendStructure.nodes = action.payload as any;
      saveToLocalStorage(state);
    },
    setFrontendEdges: (state, action: PayloadAction<Edge[]>) => {
      state.frontendStructure.edges = action.payload;
      saveToLocalStorage(state);
    },
    setFrontendGenerated: (state, action: PayloadAction<boolean>) => {
      state.frontendStructure.isGenerated = action.payload;
      saveToLocalStorage(state);
    },
    // Backend Structure Actions
    setBackendStructure: (state, action: PayloadAction<IBackendStructure>) => {
      state.backendStructure = action.payload as any;
      saveToLocalStorage(state);
    },
    setBackendGenerated: (state, action: PayloadAction<boolean>) => {
      state.backendStructure.isGenerated = action.payload;
      saveToLocalStorage(state);
    },
    // Chat Actions
    addChatMessage: (state, action: PayloadAction<IChatMessage>) => {
      state.chatMessages.push(action.payload);
      saveToLocalStorage(state);
    },
    setChatMessages: (state, action: PayloadAction<IChatMessage[]>) => {
      state.chatMessages = action.payload;
      saveToLocalStorage(state);
    },
    // Project Actions
    setCurrentProject: (state, action: PayloadAction<string | null>) => {
      state.currentProject = action.payload;
      saveToLocalStorage(state);
    },
    // API Response Actions
    setGeneratedPages: (
      state,
      action: PayloadAction<{ projectId: string; pages: ApiPageData[] }>,
    ) => {
      const { projectId, pages } = action.payload;

      // Convert API page data to internal format
      const convertedPages: IPageData[] = pages?.map((page, index) => ({
        pageName: page.name,
        optionalDescription: page.description,
        parentPage: page.parent_page,
        pageType: page.page_type as IPageData['pageType'],
        platform: page.platform as IPageData['platform'],
      }));

      // Separate frontend and backend pages
      const frontendPages = convertedPages.filter(
        (page) => page.platform === 'website',
      );
      const backendPages = convertedPages.filter(
        (page) => page.platform === 'backend',
      );

      console.log('setGeneratedPages Debug:', {
        totalPages: pages.length,
        convertedPages: convertedPages.length,
        frontendPages: frontendPages.length,
        backendPages: backendPages.length,
        backendPagesData: backendPages,
      });

      // Update frontend structure
      state.frontendStructure.pages = frontendPages;
      state.frontendStructure.isGenerated = frontendPages.length > 0;
      state.currentProject = projectId;

      // Update backend structure
      state.backendStructure.entities = backendPages;
      state.backendStructure.isGenerated = backendPages.length > 0;

      // Generate frontend nodes and edges
      const frontendNodes = frontendPages.map((page, index) => ({
        id: page.pageName,
        type:
          page.pageType === 'home'
            ? 'input'
            : page.pageType === 'detail'
              ? 'output'
              : 'default',
        position: { x: index * 200, y: index * 100 },
        data: {
          label: page.pageName,
          description: page.optionalDescription,
          pageType: page.pageType,
          platform: page.platform,
        },
        style: {
          background: '#333',
          border: '1px solid #bbb',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
          padding: 8,
          minWidth: 120,
          textAlign: 'center',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          color: '#fff',
        },
      })) as Node[];

      const frontendEdges = frontendPages
        .filter((page) => page.parentPage && page.parentPage !== page.pageName)
        .map((page) => ({
          id: `${page.parentPage}-${page.pageName}`,
          source: page.parentPage!,
          target: page.pageName,
          type: 'smoothstep',
          style: { stroke: '#bbb', strokeWidth: 2 },
        })) as Edge[];

      // Generate backend nodes and edges
      const backendNodes = backendPages.map((page, index) => ({
        id: page.pageName,
        type: 'default',
        position: { x: index * 200, y: index * 100 },
        data: {
          label: page.pageName,
          description: page.optionalDescription,
          pageType: page.pageType,
          platform: page.platform,
        },
        style: {
          background: '#2d3748',
          border: '1px solid #4a5568',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
          padding: 8,
          minWidth: 120,
          textAlign: 'center',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          color: '#e2e8f0',
        },
      })) as Node[];

      const backendEdges = backendPages
        .filter((page) => page.parentPage && page.parentPage !== page.pageName)
        .map((page) => ({
          id: `${page.parentPage}-${page.pageName}`,
          source: page.parentPage!,
          target: page.pageName,
          type: 'smoothstep',
          style: { stroke: '#4a5568', strokeWidth: 2 },
        })) as Edge[];

      // Set frontend nodes and edges
      state.frontendStructure.nodes = frontendNodes as any;
      state.frontendStructure.edges = frontendEdges as any;

      // Set backend nodes and edges
      state.backendStructure.nodes = backendNodes as any;
      state.backendStructure.edges = backendEdges as any;

      console.log('Backend Structure Updated:', {
        backendNodes: backendNodes.length,
        backendEdges: backendEdges.length,
        backendStructure: state.backendStructure,
      });

      saveToLocalStorage(state);
    },
    setGeneratedCode: (state, action: PayloadAction<IBuilderCodeResponse>) => {
      state.generatedCode = action.payload;
      saveToLocalStorage(state);
    },
    updateGeneratedCodeFile: (
      state,
      action: PayloadAction<{ filePath: string; content: string }>,
    ) => {
      if (state.generatedCode) {
        const { filePath, content } = action.payload;

        // Update files array if it exists
        if (state.generatedCode.files) {
          if (Array.isArray(state.generatedCode.files)) {
            // Handle array format
            const fileIndex = state.generatedCode.files.findIndex(
              (file) =>
                file.path === filePath ||
                file.path === `/${filePath}` ||
                file.path === filePath.replace(/^\//, ''),
            );
            if (fileIndex !== -1) {
              state.generatedCode.files[fileIndex].content = content;
            }
          } else {
            // Handle object format
            const normalizedPath = filePath.startsWith('/')
              ? filePath
              : `/${filePath}`;
            if (state.generatedCode.files[normalizedPath]) {
              state.generatedCode.files[normalizedPath].code = content;
            }
          }
        }

        saveToLocalStorage(state);
      }
    },
    // Navigation Actions
    setCurrentView: (
      state,
      action: PayloadAction<'main' | 'erd' | 'frontend' | 'backend'>,
    ) => {
      state.currentView = action.payload;
      saveToLocalStorage(state);
    },
    setProjectId: (state, action: PayloadAction<string | null>) => {
      state.projectId = action.payload;
      saveToLocalStorage(state);
    },
    setIsCreatingNewProject: (state, action: PayloadAction<boolean>) => {
      state.isCreatingNewProject = action.payload;
      saveToLocalStorage(state);
    },
    navigateToView: (
      state,
      action: PayloadAction<{
        view: 'main' | 'erd' | 'frontend' | 'backend';
        projectId?: string;
      }>,
    ) => {
      const { view, projectId } = action.payload;
      state.currentView = view;
      if (projectId) {
        state.projectId = projectId;
      }
      saveToLocalStorage(state);
    },
    clearEditor: (state) => {
      state.message = '';
      state.selectedCategories = [];
      state.frontendStructure = {
        pages: [],
        nodes: [],
        edges: [],
        isGenerated: false,
      };
      state.backendStructure = {
        entities: [],
        relationships: [],
        nodes: [],
        edges: [],
        isGenerated: false,
      };
      state.chatMessages = [];
      state.currentProject = null;
      state.generatedCode = null;
      // Clear navigation state
      state.currentView = 'main';
      state.projectId = null;
      state.isCreatingNewProject = false;
      saveToLocalStorage(state);
    },
  },
});

// Helper function to save state to localStorage
const saveToLocalStorage = (state: EditorState) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('editor-state', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save editor state to localStorage:', error);
    }
  }
};

// Selectors
export const selectEditorMessage = (state: RootState) => state.editor.message;
export const selectEditorCategories = (state: RootState) =>
  state.editor.selectedCategories;
export const selectEditorState = (state: RootState) => state.editor;
export const selectFrontendStructure = (state: RootState) =>
  state.editor.frontendStructure;
export const selectBackendStructure = (state: RootState) =>
  state.editor.backendStructure;
export const selectChatMessages = (state: RootState) =>
  state.editor.chatMessages;
export const selectCurrentProject = (state: RootState) =>
  state.editor.currentProject;
export const selectGeneratedCode = (state: RootState) =>
  state.editor.generatedCode;
// Navigation selectors
export const selectCurrentView = (state: RootState) => state.editor.currentView;
export const selectProjectId = (state: RootState) => state.editor.projectId;
export const selectIsCreatingNewProject = (state: RootState) =>
  state.editor.isCreatingNewProject;

export const {
  setMessage,
  setSelectedCategories,
  addCategory,
  removeCategory,
  updateGeneratedCodeFile,
  setFrontendStructure,
  updateFrontendPages,
  addFrontendPage,
  updateFrontendPage,
  removeFrontendPage,
  setFrontendNodes,
  setFrontendEdges,
  setFrontendGenerated,
  setBackendStructure,
  setBackendGenerated,
  addChatMessage,
  setChatMessages,
  setCurrentProject,
  setGeneratedPages,
  setGeneratedCode,
  setCurrentView,
  setProjectId,
  setIsCreatingNewProject,
  navigateToView,
  clearEditor,
} = editorSlice.actions;

export default editorSlice.reducer;
