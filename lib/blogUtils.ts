// Function to convert @mentions to Twitter links and preserve line breaks
export function formatBlogContent(content: string): string {
  if (!content) return '';
  
  // First, handle @mentions - convert them to Twitter links
  let formattedContent = content.replace(
    /@(\w+)/g, 
    '<a href="https://x.com/$1" target="_blank" rel="noopener noreferrer" class="text-orange-400 hover:underline">@$1</a>'
  );
  
  // Then, preserve line breaks by replacing them with <br> tags
  // This handles both single and double line breaks
  formattedContent = formattedContent.replace(/\n\s*\n/g, '</p><p>'); // Double line breaks for paragraphs
  formattedContent = formattedContent.replace(/\n/g, '<br>'); // Single line breaks for line breaks
  
  // Wrap in paragraph tags if not already wrapped
  if (!formattedContent.startsWith('<p>')) {
    formattedContent = `<p>${formattedContent}</p>`;
  }
  
  return formattedContent;
}

// Function to safely render blog post content with proper HTML escaping
export function renderBlogContent(content: string): string {
  if (!content) return '';
  
  // First escape HTML to prevent XSS
  let safeContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Then apply our formatting
  return formatBlogContent(safeContent);
}
