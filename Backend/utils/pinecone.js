const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || 'MISSING_KEY'
});

const PINECONE_INDEX_NAME = 'engram-diary-index';

function cleanData(text) {
  if (typeof text !== 'string') return text;
  let cleanedText = text;
  // Redact Emails
  cleanedText = cleanedText.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '[EMAIL]');
  // Redact Phone numbers
  cleanedText = cleanedText.replace(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g, '[PHONE]');
  // Redact SSN
  cleanedText = cleanedText.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
  return cleanedText;
}

function chunkText(text, chunkSize = 1000, chunkOverlap = 200) {
  if (!text) return [];
  
  // Split by sentences using regex that keeps the punctuation
  const sentenceRegex = /[^.!?]+[.!?]+[\])'"`’”]*\s*|.+/g;
  const sentences = text.match(sentenceRegex) || [text];
  
  const chunks = [];
  let currentChunk = "";
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    // If a single sentence is larger than chunkSize, we have to slice it (fallback)
    if (sentence.length > chunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      let start = 0;
      while (start < sentence.length) {
        chunks.push(sentence.slice(start, start + chunkSize).trim());
        start += chunkSize - chunkOverlap;
      }
      continue;
    }
    
    if ((currentChunk + sentence).length <= chunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      
      // Handle overlap by extracting the last chunkOverlap characters
      const overlapText = currentChunk.slice(-chunkOverlap);
      const spaceIndex = overlapText.indexOf(' ');
      const cleanOverlap = spaceIndex !== -1 ? overlapText.slice(spaceIndex) : overlapText;
      
      currentChunk = cleanOverlap.trim() + " " + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

async function deleteDiaryFromPinecone(diaryId) {
  if (!process.env.PINECONE_API_KEY) return;
  try {
    const index = pc.index(PINECONE_INDEX_NAME);
    
    const idsToDelete = [diaryId.toString()];
    for (let i = 0; i < 50; i++) {
      idsToDelete.push(`${diaryId.toString()}-chunk-${i}`);
    }
    
    try {
      await index.deleteMany(idsToDelete);
    } catch (err) {
      // Fallback if the SDK version does not support array based deleteMany
      await Promise.all(idsToDelete.map(id => index.deleteOne({ id }).catch(() => {})));
    }

  } catch (error) {
    console.error("❌ [Pinecone] Error deleting diary entry:", error);
  }
}

async function initPineconeIndex() {
  if (!process.env.PINECONE_API_KEY) {
    console.warn("⚠️ PINECONE_API_KEY is missing. Please add it to your .env file.");
    return;
  }

  try {
    const existingIndexes = await pc.listIndexes();
    const indexExists = existingIndexes.indexes.some(i => i.name === PINECONE_INDEX_NAME);

    if (!indexExists) {

      await pc.createIndex({
        name: PINECONE_INDEX_NAME,
        dimension: 1024, 
        metric: 'cosine',
        spec: { 
          serverless: { 
            cloud: 'aws', 
            region: 'us-east-1' 
          }
        }
      });

    }
  } catch (error) {
    console.error("Error initializing Pinecone index:", error);
  }
}

async function getEmbeddingsBatch(texts) {
  if (!texts || texts.length === 0) return [];
  try {
    const response = await pc.inference.embed({
      model: 'multilingual-e5-large',
      inputs: texts,
      parameters: { inputType: 'passage', truncate: 'END' }
    });
    // response.data contains array of embedding objects
    return (response.data || response).map(item => item.values);
  } catch (error) {
    console.error("Error generating batch embeddings:", error);
    throw error;
  }
}

async function getEmbeddings(text) {
  try {
    const embeddings = await getEmbeddingsBatch([text]);
    return embeddings[0];
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

async function upsertDiaryToPinecone(diaryEntry) {
  if (!process.env.PINECONE_API_KEY) return;

  try {
    const rawText = `Title: ${diaryEntry.title}\n\n${diaryEntry.content}`;
    const cleanedText = cleanData(rawText);
    const chunks = chunkText(cleanedText, 1000, 200); // 1000 char chunks, 200 overlap

    const index = pc.index(PINECONE_INDEX_NAME);
    const records = [];

    // Generate embeddings for all chunks in a single batch request
    const embeddings = await getEmbeddingsBatch(chunks);

    for (let i = 0; i < chunks.length; i++) {
      records.push({
        id: `${diaryEntry._id.toString()}-chunk-${i}`,
        values: embeddings[i],
        metadata: {
          userId: diaryEntry.userId.toString(),
          title: diaryEntry.title,
          content: chunks[i], // Store chunk so the AI gets relevant context
          createdAt: diaryEntry.createdAt.toISOString()
        }
      });
    }

    if (records.length > 0) {
      try {
        await index.upsert(records);
      } catch (err) {
        // Fallback for older SDK object format
        await index.upsert({ records });
      }
    }

  } catch (error) {
    console.error("❌ [Pinecone] Error upserting diary entry:", error);
  }
}

async function queryRelevantDiaries(userId, queryText, topK = 5) {
  if (!process.env.PINECONE_API_KEY) return [];

  try {
    const embedding = await getEmbeddings(queryText);
    const index = pc.index(PINECONE_INDEX_NAME);

    const queryResponse = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter: {
        userId: { $eq: userId }
      }
    });

    return queryResponse.matches.map(match => match.metadata);
  } catch (error) {
    console.error("❌ [Pinecone] Error querying diary entries:", error);
    return [];
  }
}

module.exports = {
  initPineconeIndex,
  upsertDiaryToPinecone,
  queryRelevantDiaries,
  deleteDiaryFromPinecone
};
