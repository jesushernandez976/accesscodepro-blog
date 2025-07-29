import express from "express";
import Post from "../models/post.model.js";

const router = express.Router();

// GET /sitemap.xml - Generate XML sitemap
router.get("/sitemap.xml", async (req, res) => {
  try {
    // Get all published posts
    const posts = await Post.find()
      .select("slug createdAt updatedAt category")
      .sort({ createdAt: -1 });

    // Get current date for homepage
    const currentDate = new Date().toISOString();

    // Build XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://accesscodepro.blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Blog listing page -->
  <url>
    <loc>https://accesscodepro.blog/posts</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Category pages -->
  <url>
    <loc>https://accesscodepro.blog/posts?cat=Web%20Design</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://accesscodepro.blog/posts?cat=Development</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://accesscodepro.blog/posts?cat=Tools</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://accesscodepro.blog/posts?cat=Business</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://accesscodepro.blog/posts?cat=Marketing</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Individual blog posts -->
  ${posts.map(post => `  <url>
    <loc>https://accesscodepro.blog/posts/${post.slug}</loc>
    <lastmod>${(post.updatedAt || post.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    // Set proper content type and send XML
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;