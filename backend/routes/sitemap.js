import express from 'express';
import Post from '../models/post.model.js'; // Your post model

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    
    const baseUrl = process.env.SITE_URL || 'https://accesscodepro.blog';

    const urls = posts.map(post => `
      <url>
        <loc>${baseUrl}/posts/${post.slug}</loc>
        <lastmod>${post.updatedAt ? post.updatedAt.toISOString() : post.createdAt.toISOString()}</lastmod>
      </url>
    `).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${baseUrl}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </url>
        ${urls}
      </urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);

  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    res.status(500).end();
  }
});

export default router;
