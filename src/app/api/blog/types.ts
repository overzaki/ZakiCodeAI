// Blog API Types

import { ImagesSrc } from '@/constants/imagesSrc';

export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  publishedDate: string;
  category: string;
  readTime: string;
  tags: string[];
  summaryPoints: string[];
  heroMedia: {
    type: 'image' | 'video' | 'text';
    src?: string;
    alt?: string;
    caption?: string;
    text?: string;
    subtitle?: string;
  };
  content: Array<{
    type:
      | 'paragraph'
      | 'heading'
      | 'image'
      | 'video'
      | 'table'
      | 'code'
      | 'quote';
    value: string | any;
    level?: number;
    src?: string;
    alt?: string;
    data?: Array<Array<string>>;
  }>;
  relatedArticles: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    date: string;
    image?: string;
  }>;
}

export interface BlogCategory {
  id: string;
  label: string;
  icon?: string;
  count: number;
}

export interface BlogListResponse {
  posts: IBlogPost[];
  categories: BlogCategory[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
}

export interface BlogDetailResponse {
  post: IBlogPost;
  relatedPosts: IBlogPost[];
}

// API Endpoints
export const BLOG_API_ENDPOINTS = {
  // Get all blog posts with pagination and filtering
  GET_POSTS: '/api/blog/posts',

  // Get a single blog post by ID or slug
  GET_POST_BY_ID: (id: string) => `/api/blog/posts/${id}`,
  GET_POST_BY_SLUG: (slug: string) => `/api/blog/posts/slug/${slug}`,

  // Get blog categories
  GET_CATEGORIES: '/api/blog/categories',

  // Get posts by category
  GET_POSTS_BY_CATEGORY: (category: string) =>
    `/api/blog/categories/${category}/posts`,

  // Search posts
  SEARCH_POSTS: '/api/blog/search',
} as const;

// Example API response structure for a blog post
export const EXAMPLE_BLOG_POST: IBlogPost = {
  id: '2',
  title: '$100M ARR & ZakiCode Agent',
  slug: '100m-arr-zakicode-agent',
  publishedDate: '2025-08-07T00:00:00.000Z',
  category: 'announcements',
  readTime: '5 min read',
  tags: ['$100M ARR', 'ZakiCode Agent'],
  summaryPoints: [
    'Faster builds, complex problem-solving, and real-world integration',
    'Enabling Agent Mode & Pricing',
    'Ready to Test the Limits?',
  ],
  heroMedia: {
    type: 'text',
    text: 'Agent',
    subtitle: 'is now the default mode',
  },
  content: [
    {
      type: 'paragraph',
      value:
        'Today, ZakiCode officially passed $100m in ARR. This milestone represents not just revenue growth, but the incredible adoption of AI-powered development by developers worldwide.',
    },
    {
      type: 'heading',
      value: 'Building ambitious software just got a lot easier.',
      level: 2,
    },
    {
      type: 'paragraph',
      value:
        'With our latest Agent Mode, you can now build more complex applications than ever before. The AI understands context, maintains state, and can handle multi-step processes that previously required extensive manual intervention.',
    },
    {
      type: 'image',
      value: 'Fastest $1M → $100M',
      src: '/assets/templates/template-1.png',
      alt: 'Growth chart showing ZakiCode vs other companies',
    },
    {
      type: 'heading',
      value:
        'Faster builds, complex problem-solving, and real-world integration',
      level: 2,
    },
    {
      type: 'paragraph',
      value:
        'Build more ambitious apps than ever before. Move faster with fewer headaches. Unlock new possibilities with real-world integration.',
    },
    {
      type: 'video',
      value: 'Agent Mode Demo',
      src: '/assets/templates/template-2.png',
      alt: 'Video demonstration of Agent Mode',
    },
    {
      type: 'heading',
      value: 'Enabling Agent Mode & Pricing',
      level: 2,
    },
    {
      type: 'paragraph',
      value:
        "Agent Mode is now available to all users. Here's how the pricing works:",
    },
    {
      type: 'table',
      value: 'Pricing Table',
      data: [
        ['User Prompt', 'Work Done', 'Credits'],
        ['Make button gray', 'Changes the button styles', '0.50'],
        ['Add user authentication', 'Creates login/signup system', '2.00'],
        ['Build a dashboard', 'Generates complete dashboard', '5.00'],
        ['Integrate payment system', 'Adds Stripe integration', '3.50'],
      ],
    },
    {
      type: 'heading',
      value: 'Ready to Test the Limits?',
      level: 2,
    },
    {
      type: 'paragraph',
      value:
        'Start building with Agent Mode today. Experience the future of AI-powered development and see what you can create.',
    },
  ],
  relatedArticles: [
    {
      id: '1',
      title: 'GPT-5 Meets ZakiCode',
      category: 'announcements',
      date: '2025-08-07T00:00:00.000Z',
      description: 'Limited preview to ZakiCode + GPT-5 available today.',
      image: ImagesSrc.template1,
    },
    {
      id: '3',
      title: 'ZakiCode: Secure Vibe Coding',
      category: 'reports',
      date: '2025-08-07T00:00:00.000Z',
      description:
        'Lovable will now helps you make sure your app is secure before going live.',
      image: ImagesSrc.template3,
    },
  ],
};

// Example API functions (you would implement these with your actual API)
export const blogApi = {
  // Get all blog posts
  async getPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<BlogListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(
      `${BLOG_API_ENDPOINTS.GET_POSTS}?${searchParams}`,
    );
    if (!response.ok) throw new Error('Failed to fetch blog posts');
    return response.json();
  },

  // Get a single blog post
  async getPostById(id: string): Promise<BlogDetailResponse> {
    const response = await fetch(BLOG_API_ENDPOINTS.GET_POST_BY_ID(id));
    if (!response.ok) throw new Error('Failed to fetch blog post');
    return response.json();
  },

  // Get blog categories
  async getCategories(): Promise<BlogCategory[]> {
    const response = await fetch(BLOG_API_ENDPOINTS.GET_CATEGORIES);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // Search blog posts
  async searchPosts(query: string): Promise<BlogListResponse> {
    const response = await fetch(
      `${BLOG_API_ENDPOINTS.SEARCH_POSTS}?q=${encodeURIComponent(query)}`,
    );
    if (!response.ok) throw new Error('Failed to search blog posts');
    return response.json();
  },
};
