#!/usr/bin/env node

/**
 * Sitemap Generator for Kuroma.dev
 * Generates sitemap.xml from config files and blog posts
 */

const fs = require('fs');
const path = require('path');

// Base URL
const BASE_URL = 'https://kuroma.dev';

// Static routes (using hash-based routing)
const STATIC_ROUTES = [
  '#/',
  '#/projects',
  '#/blog',
  '#/origami',
  '#/services',
  '#/404'
];

// Blog posts to include in sitemap
const BLOG_POSTS = [
  { slug: 'welcome-to-kuroma-dev', date: '2026-01-27' },
  { slug: 'markdown-editor-tutorial', date: '2026-01-28' },
  { slug: 'my-2025-tech-journey', date: '2026-01-29' },
  { slug: 'discord-s-beginning-of-an-end', date: '2026-01-30' }
];

/**
 * Generate sitemap XML
 */
function generateSitemap() {
  const urls = [];

  // Add static routes
  STATIC_ROUTES.forEach(route => {
    urls.push({
      loc: `${BASE_URL}${route}`,
      changefreq: 'weekly',
      priority: route === '#/' ? '1.0' : '0.8'
    });
  });

  // Add blog posts
  BLOG_POSTS.forEach(post => {
    urls.push({
      loc: `${BASE_URL}#/blog/${post.slug}`,
      lastmod: post.date,
      changefreq: 'monthly',
      priority: '0.7'
    });
  });

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(url => {
    xml += `  <url>\n`;
    xml += `    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += '</urlset>';

  return xml;
}

/**
 * Write sitemap to file
 */
function writeSitemap(xml) {
  // Write to scripts directory first
  const outputPath = path.join(__dirname, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Sitemap generated: ${outputPath}`);

  // Also write to root directory for easy access
  const rootOutputPath = path.join(__dirname, '../sitemap.xml');
  fs.writeFileSync(rootOutputPath, xml, 'utf8');
  console.log(`Sitemap generated: ${rootOutputPath}`);
}

// Generate and write sitemap
const sitemapXML = generateSitemap();
writeSitemap(sitemapXML);