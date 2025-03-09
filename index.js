require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();

// Middleware

app.use(cors({
  origin: ["https://spopeer-eight.vercel.app"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],
  credentials: true
}));


app.use(express.json());

// Function to clean private key
const cleanPrivateKey = (key) => {
  if (!key) {
    console.error('Private key is empty or undefined');
    return '';
  }

  try {
    // First, check if the key is already properly formatted
    if (key.includes('-----BEGIN PRIVATE KEY-----') && 
        key.includes('-----END PRIVATE KEY-----') && 
        key.includes('\n')) {
      console.log('Key appears to be properly formatted already');
      return key;
    }

    // Remove any existing line endings and spaces
    let cleaned = key.replace(/\\n/g, '\n')
                    .replace(/\s+/g, '\n')
                    .trim();

    // If the key doesn't have the proper PEM format, add it
    if (!cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
      cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
    }

    // Log the first and last 20 characters of the cleaned key (for security)
    console.log('Cleaned key starts with:', cleaned.substring(0, 20));
    console.log('Cleaned key ends with:', cleaned.substring(cleaned.length - 20));
    
    return cleaned;
  } catch (error) {
    console.error('Error cleaning private key:', error);
    throw error;
  }
};

// Initialize Google Sheets Auth
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: cleanPrivateKey(process.env.GOOGLE_SHEETS_PRIVATE_KEY)
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Add error handling for auth initialization
let sheets;
try {
  sheets = google.sheets({ version: 'v4', auth });
  console.log('Google Sheets client initialized successfully');
} catch (error) {
  console.error('Error initializing Google Sheets client:', error);
  throw error;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Temporary debug endpoint (REMOVE IN PRODUCTION)
app.get('/api/debug-auth', (req, res) => {
  try {
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    res.json({
      keyLength: privateKey ? privateKey.length : 0,
      hasBeginMarker: privateKey ? privateKey.includes('-----BEGIN PRIVATE KEY-----') : false,
      hasEndMarker: privateKey ? privateKey.includes('-----END PRIVATE KEY-----') : false,
      hasNewlines: privateKey ? privateKey.includes('\\n') : false,
      nodeVersion: process.version,
      nodeOptions: process.env.NODE_OPTIONS || 'not set'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Waitlist endpoint
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, role, sport } = req.body;

    // Prepare row data
    const row = [
      new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      email,
      role,
      sport
    ];

    // Append to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Waitlist!A:D',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row]
      }
    });

    res.status(200).json({ message: 'Successfully added to waitlist!' });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({ error: 'Failed to add to waitlist' });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Prepare row data
    const row = [
      new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      name,
      email,
      message
    ];

    // Append to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Support!A:D',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row]
      }
    });

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Only start the server if we're not in Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
