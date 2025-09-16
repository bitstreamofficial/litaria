'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PostWithAuthorAndCategory, PostWithAuthorAndCategorySelect } from '@/lib/types';
import { generateExcerpt, formatPostDate, calculateReadingTime } from '@/lib/post-utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

interface PostCardProps {
    post: PostWithAuthorAndCategory | PostWithAuthorAndCategorySelect;
    showAuthor?: boolean;
    excerptLength?: number;
}

export function PostCard({
    post,
    showAuthor = true,
    excerptLength = 150
}: PostCardProps) {
    const excerpt = generateExcerpt(post.content, excerptLength);
    const readingTime = calculateReadingTime(post.content);
    const formattedDate = formatPostDate(post.createdAt);

    return (
        <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <Link href={`/post/${post.id}`} className="block">
                {post.imageUrl && (
                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-200"
                        />
                    </div>
                )}

                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                            {post.category.name}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {readingTime} min read
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                </CardHeader>

                <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                        {excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {showAuthor && (
                            <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                <span>{post.author.name}</span>
                            </div>
                        )}
                        <time dateTime={post.createdAt.toISOString()}>
                            {formattedDate}
                        </time>
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}