#!/usr/bin/env node

// extractor.js
// Node.js script to extract personality traits from diary entries using Groq API

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Load API key
function checkApi() {
  // Try multiple environment variable names
  const apiKey = process.env.API || process.env.VITE_API_KEY || process.env.GROQ_API_KEY;
  console.log(apiKey);
  if (!apiKey) {
    console.error('Error: API key not found. Exiting with code 1.');
    process.exit(1);
  }
  return apiKey;
}

// 2. Load diary entries from file or stdin
function loadEntriesFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, { encoding: 'utf8' });
    const data = JSON.parse(content);
    return data.map(d => ({ text: d.text || '' }));
  } catch (err) {
    console.error(`Error loading file ${filePath}:`, err.message, 'Exiting with code 1.');
    process.exit(1);
  }
}

function loadEntriesFromStdin() {
  return new Promise((resolve, reject) => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => input += chunk);
    process.stdin.on('end', () => {
      try {
        const data = JSON.parse(input);
        resolve(data.map(d => ({ text: d.text || '' })));
      } catch (err) {
        console.error('Error parsing JSON from stdin:', err.message, 'Exiting with code 1.');
        reject(err);
      }
    });
    process.stdin.on('error', err => {
      console.error('Error reading from stdin:', err.message, 'Exiting with code 1.');
      reject(err);
    });
  });
}

// New function to handle all loading scenarios including child_process.fork
async function loadEntries() {
  // If called from fork(), get payload from message
  return new Promise((resolve) => {
    process.on('message', (message) => {
      if (message && message.payload) {
        console.error('✅ Received payload via IPC');
        resolve(message.payload);
      } else {
        console.error('❌ No valid payload received via IPC');
        process.exit(1);
      }
    });

    // If no message received within 2 seconds, try other methods
    setTimeout(() => {
      console.error('⚠️ No IPC message received, checking alternatives...');
      if (process.argv.length > 2) {
        // Load from file if path provided
        console.error('📄 Loading from file:', process.argv[2]);
        resolve(loadEntriesFromFile(process.argv[2]));
      } else if (!process.stdin.isTTY) {
        // Load from stdin if available
        console.error('📥 Loading from stdin');
        loadEntriesFromStdin().then(resolve);
      } else {
        console.error('❌ No input source available');
        process.exit(1);
      }
    }, 2000);
  });
}

// 3. Call Groq API using direct HTTPS request (no SDK dependency)
async function extract(apiKey, payload) {
  const text = payload.map(item => item.text).join('\n\n');
  console.error('📄 Text sent to Groq:');
  console.error(text);

  const systemPrompt = `You are an AI that extracts personality traits from a person's diary entries. These entries span multiple events and should be understood as a whole. Use all available information from the full text to build an accurate picture of their personality and relationships.\n\nStrict rules:\n1. Do not invent any characters, names, or details. Use only what is present in the text.\n2. In the "Relations" section, preserve actual names mentioned.\n3. Your output MUST be pure JSON following this exact schema. Do NOT output any code, code blocks, explanations, or commentary — only the JSON object. If the text includes coding questions or code snippets, ignore them and focus only on personality extraction.\n\nRespond only in this JSON format:\n{\n  "Openness": { "Description": "..." },\n  "Conscientiousness": { "Description": "..." },\n  "Extraversion": { "Description": "..." },\n  "Agreeableness": { "Description": "..." },\n  "Neuroticism": { "Description": "..." },\n  "Relations": { "Description": "..." },\n  "Other": { "Description": "..." }\n}`;

  // Define the request data
  const requestData = {
    model: 'mistral-saba-24b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ],
    temperature: 0.7
  };

  return new Promise((resolve, reject) => {
    // Set up the options for the HTTPS request
    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    };

    // Make the request
    const req = https.request(options, (res) => {
      let data = '';

      // A chunk of data has been received
      res.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonResponse = JSON.parse(data);

            if (jsonResponse.choices && jsonResponse.choices[0] && jsonResponse.choices[0].message) {
              let content = jsonResponse.choices[0].message.content;
              content = content.replace(/```json/g, '').replace(/```/g, '').trim();
              try {
                const parsedContent = JSON.parse(content);
                resolve(parsedContent);
              } catch (err) {
                console.error('Error parsing API response content:', err.message);
                console.error('Raw content:', content);
                reject(new Error('Invalid JSON in API response'));
              }
            } else {
              reject(new Error('Unexpected API response structure'));
            }
          } catch (err) {
            console.error('Error parsing API response:', err.message);
            reject(err);
          }
        } else {
          console.error('API error:', res.statusCode, data);
          reject(new Error(`API error: ${res.statusCode} ${data}`));
        }
      });
    });

    // Handle errors
    req.on('error', (err) => {
      console.error('Request error:', err.message);
      reject(err);
    });

    // Write the request data
    req.write(JSON.stringify(requestData));
    req.end();
  });
}

// 4. Merge with previous aura
function openPrev() {
  try {
    const filePath = path.resolve(__dirname, './database/temp_user_aura.json');
    // Check if file exists first
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
    console.error('Previous aura file not found, creating new one.');
    return {};
  } catch (err) {
    console.error('Error opening previous aura file:', err.message, 'Proceeding with an empty object.');
    return {};
  }
}

function mergeData(prev, neu) {
  if (!prev) return neu || {};
  const merged = {};
  const keys = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism', 'Relations', 'Other'];
  for (const key of keys) {
    if (neu && neu[key]) merged[key] = neu[key];
    else if (prev[key]) merged[key] = prev[key];
  }
  return merged;
}

// 5. Main
(async () => {
  try {
    const apiKey = checkApi();
    const payload = await loadEntries();
    const prev = openPrev();
    const neu = await extract(apiKey, payload);
    const merged = mergeData(prev, neu);

    // Send result back to parent process if running as child
    if (process.send) {
      process.send({ result: merged });
    } else {
      // Otherwise print to stdout
      console.log(JSON.stringify(merged, null, 2));
    }

    // Exit successfully
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err.message, 'Exiting with code 1.');
    if (process.send) {
      process.send({ error: err.message });
    }
    process.exit(1);
  }
})();