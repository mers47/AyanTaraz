'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar, FiUser, FiTag, FiClock, FiShare2 } from 'react-icons/fi';
import { contentApi } from '@/lib/api';
import { Article } from '@/types';

interface ArticleDetailPageProps {
  params: { slug: string };
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        
        // Fetch article
        const articleRes = await contentApi.getArticleBySlug(params.slug);
        setArticle(articleRes.data);

        // Fetch related articles
        if (articleRes.data.id) {
          const relatedRes = await contentApi.getRelatedArticles(articleRes.data.id, 3);
          setRelatedArticles(relatedRes.data);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [params.slug]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const readingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-2 text-red-400">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Link href="/articles" className="btn btn-primary">
              Back to Articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-gray-400 mb-4">
              The article you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/articles" className="btn btn-primary">
              Back to Articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <Link href="/articles" className="flex items-center text-gold-400 hover:text-gold-300 transition-colors mb-4">
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Articles
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4">
            {article.category && (
              <span className="badge badge-gold mb-4 inline-block">
                {article.category.name}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
          <p className="text-xl text-gray-300 mb-6">{article.excerpt}</p>
          
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-gray-400">
            <div className="flex items-center">
              <FiCalendar className="w-5 h-5 mr-2" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            {article.author && (
              <div className="flex items-center">
                <FiUser className="w-5 h-5 mr-2" />
                <span>{article.author.firstName} {article.author.lastName}</span>
              </div>
            )}
            <div className="flex items-center">
              <FiClock className="w-5 h-5 mr-2" />
              <span>{readingTime(article.content)} min read</span>
            </div>
            <button className="flex items-center text-gray-400 hover:text-gold-400 transition-colors">
              <FiShare2 className="w-5 h-5 mr-2" />
              Share
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="relative h-96 rounded-xl overflow-hidden mb-8">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-invert max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/articles?tag=${tag.slug}`}
                  className="badge badge-gold hover:bg-gold-500 hover:bg-opacity-20 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="divider" />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/articles/${related.slug}`}
                  className="card card-hover group"
                >
                  {related.featuredImage && (
                    <div className="relative h-40 rounded-lg overflow-hidden mb-4">
                      <img
                        src={related.featuredImage}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-gold-400 transition-colors line-clamp-1">
                    {related.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{related.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/articles" className="btn btn-secondary">
            All Articles
          </Link>
          <Link href="/contact" className="btn btn-primary">
            Need Help? Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
