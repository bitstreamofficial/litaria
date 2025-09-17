import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PostWithAuthorAndCategory, PostWithAuthorAndCategorySelect } from '@/lib/types';
import { formatPostDate, generateExcerpt } from '@/lib/post-utils';

interface HeroSectionProps {
  leadPost?: PostWithAuthorAndCategory | PostWithAuthorAndCategorySelect;
}

export function HeroSection({ leadPost }: HeroSectionProps) {
  if (!leadPost) {
    return (
      <section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
              Welcome to <span className="text-primary">Litaria</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover amazing stories, insights, and ideas from our community of writers. 
              Join the conversation and share your own thoughts with the world.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const excerpt = generateExcerpt(leadPost.content, 200);

  return (
    <section className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Category Badge */}
              <div className="flex items-center space-x-3">
                <Badge variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Tag className="h-3 w-3 mr-1" />
                  {leadPost.category.name}
                </Badge>
                {leadPost.subcategory && (
                  <Badge variant="outline" className="border-border text-foreground">
                    {leadPost.subcategory.name}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground">
                {leadPost.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>By {leadPost.author.name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatPostDate(leadPost.createdAt)}</span>
                </div>
              </div>

              {/* Read More Button */}
              <div className="pt-4">
                <Link href={`/post/${leadPost.id}`}>
                  <Button 
                    size="lg" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  >
                    Read Full Story
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            {leadPost.imageUrl ? (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border">
                <Image
                  src={leadPost.imageUrl}
                  alt={leadPost.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-2xl bg-muted border border-border flex items-center justify-center shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted-foreground/20 rounded-full flex items-center justify-center">
                    <Tag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Featured Story</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}