import fs from 'fs';
import path from 'path';
import Post from '../models/post.model.js'; // adjust if needed

const generateSitemap = async () => {
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

    // Write sitemap.xml in project root (adjust if you want another location)
    const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXml);

    console.log(`Sitemap generated at: ${sitemapPath}`);
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
  }
};

export default generateSitemap;
