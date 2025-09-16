import { User, Post, Category, Subcategory } from '@prisma/client'

export type { User, Post, Category, Subcategory }

export interface PostWithAuthorAndCategory extends Post {
  author: User
  category: Category
  subcategory?: Subcategory
  language: string
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
  }
  language: string
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
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  language?: string
  categoryId?: string
  subcategoryId?: string
  imageUrl?: string
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