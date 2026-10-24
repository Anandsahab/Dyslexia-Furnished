// api/notes.js
// Vercel Serverless Function for ReadX Notes Persistence with MongoDB Atlas
// Supports GET, POST, PUT, DELETE operations for notes associated with topics and documents.

const { getDb, sanitizeError } = require('./db.js');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (typeof res.status === 'function') {
    res.status(statusCode);
  } else {
    res.statusCode = statusCode;
  }
  if (typeof res.json === 'function') {
    res.json(data);
  } else {
    res.end(JSON.stringify(data));
  }
}

/**
 * Clean Note object for API response by omitting internal MongoDB `_id`
 */
function formatNote(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    type: doc.type,
    targetId: doc.targetId,
    text: doc.text,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { success: true });
  }

  try {
    const db = await getDb();
    const collection = db.collection('notes');

    // Parse query params
    const query = req.query || {};
    // Parse body if string
    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    // 2. GET — Retrieve notes by type and targetId
    if (req.method === 'GET') {
      const type = String(query.type || '').trim();
      const targetId = String(query.id || query.targetId || '').trim();

      if (!type || !targetId) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missing required query parameters: "type" and "id" are required.'
        });
      }

      const docs = await collection
        .find({ type, targetId })
        .sort({ createdAt: 1 })
        .toArray();

      const notes = docs.map(formatNote);
      return sendJson(res, 200, { success: true, notes });
    }

    // 3. POST — Create or Upsert note
    if (req.method === 'POST') {
      const type = String(body.type || '').trim();
      const targetId = String(body.id || body.targetId || '').trim();
      const text = typeof body.text === 'string' ? body.text.trim() : '';

      if (!type || !targetId) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missing required fields: "type" and "id" (or "targetId") are required.'
        });
      }

      if (!text) {
        return sendJson(res, 400, {
          success: false,
          error: 'Note text cannot be empty.'
        });
      }

      const now = Date.now();
      const noteId = String(body.noteId || body.id_custom || ('note_' + now + '_' + Math.random().toString(36).substr(2, 5)));

      const noteDoc = {
        id: noteId,
        type: type,
        targetId: targetId,
        text: text,
        createdAt: typeof body.createdAt === 'number' ? body.createdAt : now,
        updatedAt: typeof body.updatedAt === 'number' ? body.updatedAt : now
      };

      await collection.updateOne(
        { id: noteId },
        { $set: noteDoc },
        { upsert: true }
      );

      return sendJson(res, 201, {
        success: true,
        note: formatNote(noteDoc)
      });
    }

    // 4. PUT — Update existing note text
    if (req.method === 'PUT') {
      const noteId = String(body.noteId || body.id || query.noteId || '').trim();
      const text = typeof body.text === 'string' ? body.text.trim() : '';

      if (!noteId) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missing required field: "noteId" is required to update a note.'
        });
      }

      if (!text) {
        return sendJson(res, 400, {
          success: false,
          error: 'Note text cannot be empty.'
        });
      }

      const updatedAt = Date.now();
      const updated = await collection.findOneAndUpdate(
        { id: noteId },
        { $set: { text, updatedAt } },
        { returnDocument: 'after' }
      );

      const doc = updated && updated.value !== undefined ? updated.value : updated;
      if (!doc) {
        return sendJson(res, 404, {
          success: false,
          error: `Note with id "${noteId}" not found.`
        });
      }

      return sendJson(res, 200, {
        success: true,
        note: formatNote(doc)
      });
    }

    // 5. DELETE — Remove a note
    if (req.method === 'DELETE') {
      const noteId = String(query.noteId || query.id || body.noteId || body.id || '').trim();

      if (!noteId) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missing required parameter: "noteId" is required to delete a note.'
        });
      }

      const result = await collection.deleteOne({ id: noteId });

      if (result.deletedCount === 0) {
        return sendJson(res, 404, {
          success: false,
          error: `Note with id "${noteId}" not found.`
        });
      }

      return sendJson(res, 200, {
        success: true,
        deletedCount: result.deletedCount
      });
    }

    // 6. Non-supported method
    return sendJson(res, 405, {
      success: false,
      error: `Method ${req.method} not allowed. Supported methods: GET, POST, PUT, DELETE, OPTIONS.`
    });

  } catch (err) {
    const safeError = sanitizeError(err);
    console.error('[api/notes error]:', safeError);
    return sendJson(res, 500, {
      success: false,
      error: 'An internal database error occurred while processing the note request.'
    });
  }
};
