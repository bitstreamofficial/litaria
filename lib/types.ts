import { User, Post, Category } from '@prisma/client'

export type { User, Post, Category }

export interface PostWithAuthorAndCategory extends Post {
  author: User
  category: Category
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
}

export interface CategoryWithPostCount extends Category {
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
  categoryId: string
  imageUrl?: string
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  categoryId?: string
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