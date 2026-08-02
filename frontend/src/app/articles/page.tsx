'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiSearch, FiCalendar, FiUser, FiTag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { contentApi } from '@/lib/api';
import { Article, Category, Tag } from '@/types';

const articlesPerPage = 9;

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories and tags
        const [categoriesRes, tagsRes] = await Promise.all([
          contentApi.getCategories(),
          contentApi.getTags(),
        ]);
        setCategories(categoriesRes.data);
        setTags(tagsRes.data);

        // Fetch articles
        const articlesRes = await contentApi.getArticles(
          currentPage,
          articlesPerPage,
          selectedCategory,
          selectedTag,
          'PUBLISHED'
        );
        setArticles(articlesRes.data.data);
        setTotalArticles(articlesRes.data.total);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, selectedCategory, selectedTag]);

  // Search functionality
  useEffect(() => {
    const searchArticles = async () => {
      if (!searchQuery) {
        // Reset to default
        const articlesRes = await contentApi.getArticles(
          1,
          articlesPerPage,
          selectedCategory,
          selectedTag,
          'PUBLISHED'
        );
        setArticles(articlesRes.data.data);
        setTotalArticles(articlesRes.data.total);
        setCurrentPage(1);
        return;
      }

      // In production, implement search API endpoint
      // For now, filter client-side
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setArticles(filtered);
      setTotalArticles(filtered.length);
      setCurrentPage(1);
    };

    const timer = setTimeout(() => {
      searchArticles();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedTag, articles]);

  const totalPages = Math.ceil(totalArticles / articlesPerPage);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading articles...</p>
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
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Try Again
            </button>
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
          <Link href="/" className="flex items-center text-gold-400 hover:text-gold-300 transition-colors mb-4">
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Articles</h1>
          <p className="text-gray-400">
            Expert insights on accounting, tax, and financial management
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 p-6 card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12 w-full"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="input"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.slug}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="card card-hover group"
              >
                {article.featuredImage && (
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50" />
                  </div>
                )}
                <div className="flex items-center text-gray-400 text-sm mb-2">
                  <span className="flex items-center mr-4">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    {formatDate(article.publishedAt)}
                  </span>
                  {article.author && (
                    <span className="flex items-center">
                      <FiUser className="w-4 h-4 mr-1" />
                      {article.author.firstName} {article.author.lastName}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-gold-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="badge badge-gold"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiSearch className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
            <p className="text-gray-400">
              {searchQuery 
                ? `No articles match "${searchQuery}"`
                : selectedCategory || selectedTag
                ? 'No articles in this category/tag'
                : 'No articles available'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1;
                if (currentPage > 2) {
                  pageNum = currentPage + i - 2;
                }
                return pageNum <= totalPages ? (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-gold-500 text-black'
                        : 'border border-gray-700 hover:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
