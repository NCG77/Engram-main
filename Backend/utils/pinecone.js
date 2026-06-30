const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || 'MISSING_KEY'
});

const PINECONE_INDEX_NAME = 'engram-diary-index';

async function deleteDiaryFromPinecone(diaryId) {
  if (!process.env.PINECONE_API_KEY) return;
  try {
    const index = pc.index(PINECONE_INDEX_NAME);
    await index.deleteOne({ id: diaryId.toString() });

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

async function getEmbeddings(text) {
  try {
    const response = await pc.inference.embed({
      model: 'multilingual-e5-large',
      inputs: [text],
      parameters: { inputType: 'passage', truncate: 'END' }
    });
    return (response.data || response)[0].values;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

async function upsertDiaryToPinecone(diaryEntry) {
  if (!process.env.PINECONE_API_KEY) return;

  try {
    const textToEmbed = `Title: ${diaryEntry.title}\n\n${diaryEntry.content}`;
    const embedding = await getEmbeddings(textToEmbed);

    const index = pc.index(PINECONE_INDEX_NAME);
    await index.upsert({
      records: [{
        id: diaryEntry._id.toString(),
        values: embedding,
        metadata: {
          userId: diaryEntry.userId.toString(),
          title: diaryEntry.title,
          content: diaryEntry.content,
          createdAt: diaryEntry.createdAt.toISOString()
        }
      }]
    });

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
