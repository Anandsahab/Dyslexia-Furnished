// api/db.js
// Minimal MongoDB connection module for ReadX
// Connects to MongoDB Atlas using the official MongoDB Node.js driver.
// Enforces security: credentials and URIs are never logged or exposed.

const { MongoClient } = require('mongodb');

const DB_NAME = process.env.MONGODB_DB_NAME || 'readx';

// In-memory cache for serverless and dev environments
let cachedClient = null;
let cachedDb = null;
let connectionPromise = null;

/**
 * Normalizes MongoDB connection string if credentials contain unencoded special characters
 * (e.g., '@' in passwords which must be %40 per the MongoDB connection URI specification).
 */
function normalizeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return '';
  const schemeMatch = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!schemeMatch) return rawUri;

  const prefix = schemeMatch[1];
  const remaining = schemeMatch[2];
  const lastAtIndex = remaining.lastIndexOf('@');
  if (lastAtIndex === -1) return rawUri;

  const userInfo = remaining.slice(0, lastAtIndex);
  const hostAndRest = remaining.slice(lastAtIndex + 1);
  const firstColonIndex = userInfo.indexOf(':');
  if (firstColonIndex === -1) return rawUri;

  const username = userInfo.slice(0, firstColonIndex);
  const password = userInfo.slice(firstColonIndex + 1);

  const safeUser = encodeURIComponent(decodeURIComponent(username));
  const safePass = encodeURIComponent(decodeURIComponent(password));
  return `${prefix}${safeUser}:${safePass}@${hostAndRest}`;
}

/**
 * Sanitizes any string to prevent leaking MongoDB connection strings or credentials.
 */
function sanitizeError(err) {
  const msg = (err && err.message) ? err.message : String(err || 'Unknown database error');
  return msg.replace(/mongodb(\+srv)?:\/\/[^@]+@/g, 'mongodb+srv://***:***@');
}

/**
 * Connects to MongoDB Atlas or returns existing cached connection.
 * @returns {Promise<{ client: MongoClient, db: import('mongodb').Db }>}
 */
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    throw new Error('MONGODB_URI environment variable is not defined.');
  }

  const normalizedUri = normalizeMongoUri(rawUri);

  connectionPromise = (async () => {
    try {
      const client = new MongoClient(normalizedUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10
      });

      await client.connect();
      const db = client.db(DB_NAME);

      cachedClient = client;
      cachedDb = db;
      return { client, db };
    } catch (err) {
      connectionPromise = null;
      const safeMessage = sanitizeError(err);
      console.error('[MongoDB Error]: Connection failed safely:', safeMessage);
      throw new Error(`Database connection failed: ${safeMessage}`);
    }
  })();

  return connectionPromise;
}

/**
 * Returns the connected Db instance or throws if not connected.
 */
async function getDb() {
  const { db } = await connectToDatabase();
  return db;
}

/**
 * Pings the database to verify connectivity.
 */
async function pingDatabase() {
  const db = await getDb();
  return await db.command({ ping: 1 });
}

/**
 * Closes the cached client connection (useful for graceful shutdown or tests).
 */
async function closeConnection() {
  if (cachedClient) {
    try {
      await cachedClient.close();
    } catch (e) {
      // Safe ignore
    }
    cachedClient = null;
    cachedDb = null;
    connectionPromise = null;
  }
}

module.exports = {
  connectToDatabase,
  getDb,
  pingDatabase,
  closeConnection,
  normalizeMongoUri,
  sanitizeError,
  DB_NAME
};
