import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import Image from "../components/Image";
import PostMenuActions from "../components/PostMenuActions";
import Search from "../components/Search";
import Comments from "../components/Comments";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";

const fetchPost = async (slug) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
  return res.data;
};

// Utility function to trigger sitemap refresh when post is viewed
const notifySitemapUpdate = async () => {
  try {
    // Only trigger in production
    if (import.meta.env.PROD) {
      await fetch(`${import.meta.env.VITE_API_URL}/refresh-sitemap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.warn('Failed to refresh sitemap:', error);
  }
};

const SinglePostPage = () => {
  const { slug } = useParams();

  const { isPending, error, data } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
  });

  // SEO: Update document head when data loads
  useEffect(() => {
    if (data) {
      // Notify sitemap system of post access (helps with indexing)
      notifySitemapUpdate();

      // Update page title
      const pageTitle = `${data.title} | Access Code Pro Blog`;
      document.title = pageTitle;
      
      // Update meta description
      const pageDescription = data.desc || data.content.replace(/<[^>]*>/g, '').substring(0, 160);
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = pageDescription;
      
      // Update canonical URL
      const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const pageUrl = `${baseUrl}/posts/${data.slug}`;
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = pageUrl;
      
      // Add Open Graph tags
      const ogTags = [
        { property: 'og:title', content: pageTitle },
        { property: 'og:description', content: pageDescription },
        { property: 'og:url', content: pageUrl },
        { property: 'og:type', content: 'article' },
        { property: 'og:site_name', content: 'Access Code Pro Blog' },
        { property: 'article:author', content: data.user.username },
        { property: 'article:published_time', content: new Date(data.createdAt).toISOString() },
        { property: 'article:section', content: data.category }
      ];
      
      if (data.img) {
        ogTags.push({ 
          property: 'og:image', 
          content: data.img.startsWith('http') ? data.img : `${baseUrl}/${data.img}` 
        });
        ogTags.push({ property: 'og:image:alt', content: `Featured image for ${data.title}` });
      }
      
      ogTags.forEach(tag => {
        let meta = document.querySelector(`meta[property="${tag.property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', tag.property);
          document.head.appendChild(meta);
        }
        meta.content = tag.content;
      });
      
      // Add Twitter Card tags
      const twitterTags = [
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: pageTitle },
        { name: 'twitter:description', content: pageDescription },
        { name: 'twitter:url', content: pageUrl }
      ];
      
      if (data.img) {
        twitterTags.push({ 
          name: 'twitter:image', 
          content: data.img.startsWith('http') ? data.img : `${baseUrl}/${data.img}` 
        });
      }
      
      twitterTags.forEach(tag => {
        let meta = document.querySelector(`meta[name="${tag.name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = tag.name;
          document.head.appendChild(meta);
        }
        meta.content = tag.content;
      });
      
      // Add JSON-LD structured data
      const publishedDate = new Date(data.createdAt).toISOString();
      const modifiedDate = new Date(data.updatedAt || data.createdAt).toISOString();
      
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": data.title,
        "description": pageDescription,
        "image": data.img ? (data.img.startsWith('http') ? data.img : `${baseUrl}/${data.img}`) : `${baseUrl}/default-og-image.png`,
        "author": {
          "@type": "Person",
          "name": data.user.username,
          "url": `${baseUrl}/author/${data.user.username}`
        },
        "publisher": {
          "@type": "Organization",
          "name": "Access Code Pro Blog",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.png`
          }
        },
        "datePublished": publishedDate,
        "dateModified": modifiedDate,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": pageUrl
        },
        "url": pageUrl,
        "articleBody": data.content.replace(/<[^>]*>/g, ''),
        "wordCount": data.content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length,
        "articleSection": data.category,
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ViewAction",
          "userInteractionCount": data.visit
        },
        "keywords": data.tags ? data.tags.join(', ') : data.category
      };
      
      // Remove existing structured data script
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Add new structured data script
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);

      // Add breadcrumb structured data
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `${baseUrl}/posts`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": data.category,
            "item": `${baseUrl}/posts?cat=${encodeURIComponent(data.category)}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": data.title,
            "item": pageUrl
          }
        ]
      };

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
      document.head.appendChild(breadcrumbScript);
    }
  }, [data]);

  // Clean up meta tags when component unmounts
  useEffect(() => {
    return () => {
      // Reset title to default
      document.title = 'Access Code Pro Blog';
      
      // Remove dynamic meta tags
      const metasToRemove = [
        'meta[property^="og:"]',
        'meta[name^="twitter:"]',
        'script[type="application/ld+json"]'
      ];
      
      metasToRemove.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
    };
  }, []);

  if (isPending) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-400 text-lg mb-4">
        Failed to load post: {error.message}
      </p>
      <Link 
        to="/posts" 
        className="text-blue-400 hover:text-blue-300 underline"
      >
        ← Back to all posts
      </Link>
    </div>
  );
  
  if (!data) return (
    <div className="text-center py-16">
      <p className="text-white text-lg mb-4">Post not found!</p>
      <Link 
        to="/posts" 
        className="text-blue-400 hover:text-blue-300 underline"
      >
        ← Back to all posts
      </Link>
    </div>
  );

  return (
    <article className="flex flex-col gap-8" itemScope itemType="https://schema.org/BlogPosting">
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="hover:text-white">Home</Link></li>
          <li>›</li>
          <li><Link to="/posts" className="hover:text-white">Blog</Link></li>
          <li>›</li>
          <li>
            <Link 
              to={`/posts?cat=${encodeURIComponent(data.category)}`}
              className="hover:text-white"
            >
              {data.category}
            </Link>
          </li>
          <li>›</li>
          <li className="text-white truncate" aria-current="page">{data.title}</li>
        </ol>
      </nav>

      {/* Detail section with semantic HTML */}
      <header className="flex gap-8">
        <div className="lg:w-3/5 flex flex-col gap-8">
          <h1 
            className="text-xl text-white md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold leading-tight"
            itemProp="headline"
          >
            {data.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm flex-wrap">
            <span>Written by</span>
            <Link 
              className="text-blue-400 hover:text-blue-300 transition-colors" 
              to={`/author/${data.user.username}`}
              rel="author"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <span itemProp="name">{data.user.username}</span>
            </Link>
            <span>on</span>
            <Link 
              className="text-blue-400 hover:text-blue-300 transition-colors" 
              to={`/posts?cat=${encodeURIComponent(data.category)}`}
              itemProp="articleSection"
            >
              {data.category}
            </Link>
            <time 
              dateTime={new Date(data.createdAt).toISOString()} 
              className="text-gray-400"
              itemProp="datePublished"
            >
              {format(data.createdAt)}
            </time>
            {data.updatedAt && data.updatedAt !== data.createdAt && (
              <>
                <span>• Updated</span>
                <time 
                  dateTime={new Date(data.updatedAt).toISOString()} 
                  className="text-gray-400"
                  itemProp="dateModified"
                >
                  {format(data.updatedAt)}
                </time>
              </>
            )}
          </div>
          {data.desc && (
            <p className="text-gray-300 font-medium text-lg leading-relaxed" itemProp="description">
              {data.desc}
            </p>
          )}
        </div>
        {data.img && (
          <div className="hidden lg:block w-2/5">
            <Image 
              src={data.img} 
              w="600" 
              className="rounded-2xl shadow-lg"
              alt={`Featured image for ${data.title}`}
              itemProp="image"
            />
          </div>
        )}
      </header>

      {/* Content section */}
      <div className="flex flex-col md:flex-row gap-12 justify-between">
        {/* Post content with semantic HTML */}
        <main className="lg:text-lg flex flex-col gap-6 text-white text-justify">
          <div
            className="prose prose-invert prose-lg text-white max-w-none
                       prose-headings:text-white prose-headings:font-semibold
                       prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
                       prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
                       prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
                       prose-blockquote:border-l-blue-400 prose-blockquote:text-gray-300
                       prose-img:rounded-lg prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: data.content }}
            itemProp="articleBody"
          />
          
          {/* Reading time and word count */}
          <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-700">
            <span itemProp="wordCount">
              {data.content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length} words
            </span>
            <span>•</span>
            <span>
              {Math.ceil(data.content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length / 200)} min read
            </span>
          </div>
        </main>

        {/* Sidebar with structured data */}
        <aside className="px-4 h-max sticky top-8">
          <section>
            <h2 className="mb-4 text-sm font-medium text-white">Author</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {data?.user?.img && (
                  <Image
                    src={data.user.img}
                    className="w-12 h-12 rounded-full object-cover"
                    w="48"
                    h="48"
                    alt={`${data.user.username} profile picture`}
                  />
                )}
                <Link 
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium" 
                  to={`/author/${data.user.username}`}
                  rel="author"
                >
                  {data?.user?.username}
                </Link>
              </div>
              <p className="text-sm text-gray-400">
                Follow for more content and updates
              </p>
              
              {/* Social media links with proper attributes */}
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/accesscodepro/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="transition-transform duration-200 hover:scale-110"
                  aria-label="Follow on Instagram"
                >
                  <div className="w-8 h-8">
                    <Image
                      src="ig logo.png"
                      alt="Instagram"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </a>
                <a
                  href="https://www.tiktok.com/@accesscodepro"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="transition-transform duration-200 hover:scale-110"
                  aria-label="Follow on TikTok"
                >
                  <div className="w-8 h-8">
                    <Image
                      src="tik logo.png"
                      alt="TikTok"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </a>
                <a
                  href="https://x.com/accesscodepro"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="transition-transform duration-200 hover:scale-110"
                  aria-label="Follow on X (Twitter)"
                >
                  <div className="w-8 h-8">
                    <Image
                      src="x logo.png"
                      alt="X (Twitter)"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </a>
              </div>
            </div>
          </section>

          {/* View count with microdata */}
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 mt-6">
            <span itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
              <meta itemProp="interactionType" content="https://schema.org/ViewAction" />
              <span itemProp="userInteractionCount">{data.visit.toLocaleString()}</span>
              {" "}{data.visit === 1 ? "view" : "views"}
            </span>
          </div>

          <PostMenuActions post={data} />
          
          {/* Categories section */}
          <section>
            <h2 className="mt-8 mb-4 text-sm font-medium text-white">
              Categories
            </h2>
            <nav className="flex flex-col gap-2 text-sm">
              <Link 
                className="text-gray-300 hover:text-white transition-colors" 
                to="/posts" 
                aria-label="All posts"
              >
                All Posts
              </Link>
              <Link 
                className="text-gray-300 hover:text-white transition-colors" 
                to="/posts?cat=Web Design"
              >
                Web Design
              </Link>
              <Link 
                className="text-gray-300 hover:text-white transition-colors" 
                to="/posts?cat=Development"
              >
                Development
              </Link>
              <Link 
                className="text-gray-300 hover:text-white transition-colors" 
                to="/posts?cat=Tools"
              >
                Tools
              </Link>
              <Link 
                className="text-gray-300 hover:text-white transition-colors" 
                to="/posts?cat=Business"
              >
                Business
              </Link>
              <Link 
                className="text-gray-300 hover:text-white transition-colors" 
                to="/posts?cat=Marketing"
              >
                Marketing
              </Link>
            </nav>
          </section>
          
          {/* Search section */}
          <section>
            <h2 className="mt-8 mb-4 text-sm font-medium text-white">Search</h2>
            <Search />
          </section>
        </aside>
      </div>
      
      {/* Comments section */}
      <section>
        <Comments postId={data._id} />
      </section>
    </article>
  );
};

export default SinglePostPage;