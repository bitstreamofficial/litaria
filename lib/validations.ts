export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function validatePostTitle(title: string): boolean {
  return title.trim().length > 0 && title.length <= 200
}

export function validatePostContent(content: string): boolean {
  return content.trim().length > 0
}

export function validateCategoryName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 50
}

export function sanitizeInput(input: string): string {
  return input.trim()
}