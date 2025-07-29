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

const SinglePostPage = () => {
  const { slug } = useParams();

  const { isPending, error, data } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
  });

  // SEO: Update document head when data loads
  useEffect(() => {
    if (data) {
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
      const pageUrl = `${window.location.origin}/posts/${data.slug}`;
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
        ogTags.push({ property: 'og:image', content: data.img });
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
        twitterTags.push({ name: 'twitter:image', content: data.img });
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
        "image": data.img || "",
        "author": {
          "@type": "Person",
          "name": data.user.username
        },
        "publisher": {
          "@type": "Organization",
          "name": "AccessCodePro Blog",
          "logo": {
            "@type": "ImageObject",
            "url": "https://yourdomain.com/your-logo.png"
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
        "wordCount": data.content.replace(/<[^>]*>/g, '').split(' ').length,
        "articleSection": data.category,
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ViewAction",
          "userInteractionCount": data.visit
        }
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
    }
  }, [data]);

  if (isPending) return <p className="text-white">Loading...</p>;
  if (error)
    return (
      <p className="text-white">
        Timed out, Please reload page {error.message}
      </p>
    );
  if (!data) return <p className="text-white">Post not found!</p>;

  return (
    <>
  return (
    <article className="flex flex-col gap-8">
      {/* Detail section with semantic HTML */}
      <header className="flex gap-8">
        <div className="lg:w-3/5 flex flex-col gap-8">
          <h1 className="text-xl text-white md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold">
            {data.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Written by</span>
            <Link 
              className="text-blue-800" 
              to={`/author/${data.user.username}`}
              rel="author"
            >
              {data.user.username}
            </Link>
            <span>on</span>
            <Link 
              className="text-blue-800" 
              to={`/posts?cat=${encodeURIComponent(data.category)}`}
            >
              {data.category}
            </Link>
            <time dateTime={new Date(data.createdAt).toISOString()} className="text-gray-400">
              {format(data.createdAt)}
            </time>
          </div>
          {data.desc && (
            <p className="text-gray-500 font-medium">{data.desc}</p>
          )}
        </div>
        {data.img && (
          <div className="hidden lg:block w-2/5">
            <Image 
              src={data.img} 
              w="600" 
              className="rounded-2xl"
              alt={`Featured image for ${data.title}`}
            />
          </div>
        )}
      </header>

        {/* Content section */}
        <div className="flex flex-col md:flex-row gap-12 justify-between">
          {/* Post content with semantic HTML */}
          <main className="lg:text-lg flex flex-col gap-6 text-white text-justify">
            <div
              className="prose prose-invert text-white max-w-none"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          </main>

          {/* Sidebar with structured data */}
          <aside className="px-4 h-max sticky top-8">
            <section>
              <h2 className="mb-4 text-sm font-medium text-white">Author</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-8">
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
                    className="text-blue-800" 
                    to={`/author/${data.user.username}`}
                    rel="author"
                  >
                    {data?.user?.username}
                  </Link>
                </div>
                <p className="text-sm text-gray-500">
                  Follow for more content and updates
                </p>
                
                {/* Social media links with proper attributes */}
                <div className="flex gap-2">
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
                        width={100}
                        height={100}
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
                        width={100}
                        height={100}
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
                        width={100}
                        height={100}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </a>
                </div>
              </div>
            </section>

            {/* View count with microdata */}
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 mt-5">
              <span itemProp="interactionCount">
                {data.visit.toLocaleString()}{" "}
                {data.visit === 1 ? "view" : "views"}
              </span>
            </div>

            <PostMenuActions post={data} />
            
            {/* Categories section */}
            <section>
              <h2 className="mt-8 mb-4 text-sm font-medium text-white">
                Categories
              </h2>
              <nav className="flex flex-col gap-2 text-sm text-white">
                <Link className="underline" to="/posts" aria-label="All posts">
                  All
                </Link>
                <Link className="underline" to="/posts?cat=Web Design">
                  Web Design
                </Link>
                <Link className="underline" to="/posts?cat=Development">
                  Development
                </Link>
                <Link className="underline" to="/posts?cat=Tools">
                  Tools
                </Link>
                <Link className="underline" to="/posts?cat=Business">
                  Business
                </Link>
                <Link className="underline" to="/posts?cat=Marketing">
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
    </>
  );
};

export default SinglePostPage;

