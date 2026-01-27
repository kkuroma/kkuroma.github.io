/**
 * Blog File Parser
 * Handles parsing and generating BLOG_*.js files
 */

class BlogParser {
  /**
   * Parse a BLOG_*.js file content and extract the config
   * @param {string} fileContent - The raw file content
   * @returns {Object} - Parsed blog config or null if invalid
   */
  static parseBlogFile(fileContent) {
    try {
      // Extract the BLOG_CONFIG object using regex
      const configMatch = fileContent.match(/const BLOG_CONFIG = ({[\s\S]*?});/);

      if (!configMatch) {
        throw new Error('BLOG_CONFIG not found in file');
      }

      // Parse the config object (using eval in a safe context)
      const configStr = configMatch[1];
      const config = eval('(' + configStr + ')');

      // Validate required fields
      if (!config.title || !config.date_created || !config.content) {
        throw new Error('Missing required fields (title, date_created, content)');
      }

      return config;
    } catch (error) {
      console.error('Error parsing blog file:', error);
      return null;
    }
  }

  /**
   * Generate a BLOG_*.js file from metadata and content
   * @param {Object} metadata - Blog metadata
   * @param {string} content - Blog markdown content
   * @returns {string} - Generated file content
   */
  static generateBlogFile(metadata, content) {
    // Escape content for JavaScript string
    const escapedContent = content
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');

    // Format tags array
    const tagsStr = metadata.tags && metadata.tags.length > 0
      ? `["${metadata.tags.join('", "')}"]`
      : '[]';

    // Build the file content
    const fileContent = `(function() {
const BLOG_CONFIG = {
  title: "${metadata.title || 'Untitled'}",
  date_created: "${metadata.date_created || new Date().toISOString().split('T')[0]}",
  date_updated: ${metadata.date_updated ? `"${metadata.date_updated}"` : 'null'},
  read_time: "${metadata.read_time || '5 min'}",
  tags: ${tagsStr},
  preview_img: ${metadata.preview_img ? `"${metadata.preview_img}"` : 'null'},
  pinned: ${metadata.pinned || false},
  content: \`${escapedContent}\`
};
window.BLOG_CONFIG = BLOG_CONFIG;
})();
`;

    return fileContent;
  }

  /**
   * Generate a filename from blog title
   * @param {string} title - Blog title
   * @returns {string} - Filename in format BLOG_slug.js
   */
  static generateFilename(title) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `BLOG_${slug || 'untitled'}.js`;
  }

  /**
   * Parse tags from comma-separated string
   * @param {string} tagsStr - Comma-separated tags
   * @returns {Array} - Array of tag strings
   */
  static parseTags(tagsStr) {
    if (!tagsStr || !tagsStr.trim()) return [];
    return tagsStr
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  /**
   * Format tags array to comma-separated string
   * @param {Array} tags - Array of tags
   * @returns {string} - Comma-separated string
   */
  static formatTags(tags) {
    if (!tags || tags.length === 0) return '';
    return tags.join(', ');
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.BlogParser = BlogParser;
}
