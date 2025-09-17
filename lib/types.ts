// Base model types matching our Prisma schema
export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  title: string
  content: string
  language: string
  imageUrl: string | null
  videoUrl: string | null
  isLead: boolean
  status: string
  scheduledDate: Date | null
  createdAt: Date
  updatedAt: Date
  authorId: string
  categoryId: string
  subcategoryId: string | null
}

export interface Category {
  id: string
  name: string
  language: string
  createdAt: Date
}

export interface Subcategory {
  id: string
  name: string
  categoryId: string
  createdAt: Date
}

export interface PostWithAuthorAndCategory extends Post {
  author: User
  category: Category
  subcategory?: Subcategory | null
}

export interface PostWithAuthorAndCategorySelect extends Post {
  author: {
    id: string
    name: string
    email: string
  }
  category: {
    id: string
    name: string
  }
  subcategory?: {
    id: string
    name: string
  } | null
}

export interface CategoryWithPostCount extends Category {
  _count: {
    posts: number
  }
  subcategories?: Subcategory[]
}

export interface SubcategoryWithPostCount extends Subcategory {
  _count: {
    posts: number
  }
}

export interface PostsResponse {
  posts: PostWithAuthorAndCategory[]
  pagination: {
    page: number
    totalPages: number
    totalPosts: number
  }
}

export interface CreatePostRequest {
  title: string
  content: string
  language: string
  categoryId: string
  subcategoryId?: string
  imageUrl?: string
  videoUrl?: string
  isLead?: boolean
  status?: string
  scheduledDate?: Date
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  language?: string
  categoryId?: string
  subcategoryId?: string
  imageUrl?: string
  videoUrl?: string
  isLead?: boolean
  status?: string
  scheduledDate?: Date
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface CreateCategoryRequest {
  name: string
}

export interface APIError {
  error: string
  message: string
  statusCode: number
}