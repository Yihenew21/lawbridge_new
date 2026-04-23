/**
 * Robust chunking logic specifically for legal documents.
 * Splits by Articles, Sections, and Parts while maintaining context.
 * Useful for processing new laws into the RAG database.
 */
export function chunkLegalText(text: string, title: string, maxChunkSize = 1500, overlap = 200) {
  // Clean text: normalize whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Split by major legal markers (Article, Section, Part, Proclamation)
  // This helps keep legal units together.
  const markers = /(Article\s+\d+|Section\s+\d+|Part\s+[A-Z\d]+|Proclamation\s+No\.|CHAPTER\s+[A-Z\d]+)/gi;
  
  const rawChunks: string[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = markers.exec(cleanText)) !== null) {
    if (match.index > lastIndex) {
      const content = cleanText.substring(lastIndex, match.index).trim();
      if (content.length > 50) {
        rawChunks.push(content);
      }
    }
    lastIndex = match.index;
  }
  
  // Add the last piece
  const lastContent = cleanText.substring(lastIndex).trim();
  if (lastContent.length > 50) {
    rawChunks.push(lastContent);
  }
  
  // If no markers were found, use the whole text as one chunk
  if (rawChunks.length === 0 && cleanText.length > 0) {
    rawChunks.push(cleanText);
  }

  const finalChunks: string[] = [];
  for (const rawChunk of rawChunks) {
    // Prefix each chunk with the law title for better RAG context
    const contextPrefix = `Law: ${title}\n\n`;
    const fullContent = contextPrefix + rawChunk;

    if (fullContent.length > maxChunkSize) {
      // Recursive splitting for large chunks
      let subStart = 0;
      while (subStart < fullContent.length) {
        let subEnd = subStart + maxChunkSize;
        
        if (subEnd < fullContent.length) {
          // Try to find a natural break point (period or newline)
          const lastPeriod = fullContent.lastIndexOf('. ', subEnd);
          if (lastPeriod > subStart + (maxChunkSize * 0.6)) {
            subEnd = lastPeriod + 1;
          }
        }
        
        const subChunk = fullContent.substring(subStart, subEnd).trim();
        if (subChunk.length > contextPrefix.length + 20) {
          finalChunks.push(subChunk);
        }
        
        subStart = subEnd - overlap;
        if (subStart < 0) subStart = 0;
        if (subEnd >= fullContent.length) break;
      }
    } else {
      finalChunks.push(fullContent);
    }
  }
  
  return finalChunks;
}
