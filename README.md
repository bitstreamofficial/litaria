# Litaria

A modern, full-stack blog platform built with Next.js 15, featuring user authentication, content management, and a beautiful responsive design.

## ✨ Features

- **Modern Tech Stack**: Built with Next.js 15, React 19, TypeScript, and Turbopack
- **Authentication**: Secure user authentication with NextAuth.js
- **Content Management**: Full CRUD operations for blog posts and categories
- **Image Upload**: Cloudinary integration for image hosting and optimization
- **Database**: MongoDB with Prisma ORM for type-safe database operations
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dashboard**: User-friendly admin dashboard for content management
- **SEO Optimized**: Server-side rendering for better search engine visibility

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **Image Upload**: Cloudinary
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Turbopack for faster development

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Cloudinary account for image uploads

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd litaria
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. **Generate Prisma client**
   ```bash
   npm run db:generate
   ```

5. **Push database schema**
   ```bash
   npm run db:push
   ```

6. **Seed the database** (optional)
   ```bash
   npm run db:seed
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.0.101:3000

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
litaria/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Admin dashboard pages
│   ├── api/              # API routes
│   └── (auth)/           # Authentication pages
├── components/            # Reusable React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   └── posts/            # Post-related components
├── lib/                  # Utility functions and configurations
├── prisma/               # Database schema and migrations
├── scripts/              # Database seeding scripts
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🎯 Key Features

### Authentication System
- User registration and login
- Session management with NextAuth.js
- Protected routes and middleware

### Content Management
- Create, read, update, and delete blog posts
- Category management system
- Rich text content support
- Image upload and optimization

### Dashboard
- User-friendly admin interface
- Post management with pagination
- Category organization
- Quick actions and navigation

### Public Interface
- Homepage with latest posts
- Category-based filtering
- Responsive design for all devices
- SEO-optimized pages

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with initial data

## 🌐 Environment Setup

### MongoDB Setup
1. Create a MongoDB database (local or MongoDB Atlas)
2. Get your connection string
3. Add it to your `.env` file as `MONGODB_URI`

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Create an upload preset for the blog
4. Add credentials to your `.env` file

### NextAuth Setup
1. Generate a secure secret: `openssl rand -base64 32`
2. Add it to your `.env` file as `NEXTAUTH_SECRET`
3. Set your application URL as `NEXTAUTH_URL`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The application can be deployed on any platform that supports Node.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify your MongoDB URI is correct
- Ensure your IP is whitelisted (for MongoDB Atlas)
- Check if the database is running

**Prisma Client Error**
- Run `npm run db:generate` to regenerate the client
- Ensure your schema is up to date with `npm run db:push`

**Image Upload Issues**
- Verify Cloudinary credentials
- Check upload preset configuration
- Ensure proper CORS settings

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js and modern web technologies.