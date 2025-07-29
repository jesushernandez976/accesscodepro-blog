import express from 'express';
import fs from 'fs';
import path from 'path';
import Post from '../models/post.model.js';

const router = express.Router();

router.post('/refresh-sitemap', async (req, res) => {
  try {
    const baseUrl = 'https://accesscodepro.blog';
    const posts = await Post.find({}).sort({ createdAt: -1 });

    const urls = posts.map(post => `
  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt || post.createdAt).toISOString()}</lastmod>
  </url>
    `).join('');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  ${urls}
</urlset>`;

    fs.writeFileSync(path.join('public', 'sitemap.xml'), sitemapXml);
    return res.status(200).json({ message: 'Sitemap updated successfully.' });
  } catch (error) {
    console.error('Error updating sitemap:', error);
    return res.status(500).json({ error: 'Failed to update sitemap.' });
  }
});

export default router;
