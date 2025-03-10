require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors({
  origin: ["https://spopeer-eight.vercel.app","http://localhost:8080"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


//count for number of waitlist entries
app.get('/api/waitlist/count', async (req, res) => {
  const count = await prisma.waitlist.count();
  res.json({ count });
});

// Waitlist endpoint
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, role, sport } = req.body;

    // Validate input
    if (!email || !role || !sport) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create waitlist entry
    const entry = await prisma.waitlist.create({
      data: {
        email,
        role,
        sport
      }
    });

    res.status(200).json({ message: 'Successfully added to waitlist!', data: entry });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({ error: 'Failed to add to waitlist' });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create contact entry
    const entry = await prisma.contact.create({
      data: {
        name,
        email,
        message
      }
    });

    res.status(200).json({ message: 'Message sent successfully!', data: entry });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and Prisma Client...');
  await prisma.$disconnect();
  process.exit(0);
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




// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { google } = require('googleapis');

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? ["https://spopeer-eight.vercel.app","http://localhost:8080"] 
//     : 'http://localhost:8080'
// }));
// app.use(express.json());

// // Function to clean private key
// const cleanPrivateKey = (key) => {
//   if (!key) return '';
//   // Remove any extra spaces and convert literal \n to actual newlines
//   return key.replace(/\\n/g, '\n').replace(/(-----(BEGIN|END) PRIVATE KEY-----)/g, '$1\n');
// };


// // Initialize Google Sheets Auth
// const auth = new google.auth.GoogleAuth({
//   credentials: {
//     client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
//     private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n')
//   },
//   scopes: ['https://www.googleapis.com/auth/spreadsheets']
// });

// const sheets = google.sheets({ version: 'v4', auth });

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok' });
// });

// // Waitlist endpoint
// app.post('/api/waitlist', async (req, res) => {
//   try {
//     const { email, role, sport } = req.body;

//     // Prepare row data
//     const row = [
//       new Date().toLocaleString('en-GB', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: false
//       }),
//       email,
//       role,
//       sport
//     ];

//     // Append to Google Sheet
//     await sheets.spreadsheets.values.append({
//       spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
//       range: 'Waitlist!A:D',
//       valueInputOption: 'RAW',
//       insertDataOption: 'INSERT_ROWS',
//       requestBody: {
//         values: [row]
//       }
//     });

//     res.status(200).json({ message: 'Successfully added to waitlist!' });
//   } catch (error) {
//     console.error('Error adding to waitlist:', error);
//     res.status(500).json({ error: 'Failed to add to waitlist' });
//   }
// });

// // Contact form endpoint
// app.post('/api/contact', async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     // Prepare row data
//     const row = [
//       new Date().toLocaleString('en-GB', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: false
//       }),
//       name,
//       email,
//       message
//     ];

//     // Append to Google Sheet
//     await sheets.spreadsheets.values.append({
//       spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
//       range: 'Support!A:D',
//       valueInputOption: 'RAW',
//       insertDataOption: 'INSERT_ROWS',
//       requestBody: {
//         values: [row]
//       }
//     });

//     res.status(200).json({ message: 'Message sent successfully!' });
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({ error: 'Failed to send message' });
//   }
// });

// // Only start the server if we're not in Vercel
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// // Export the app for Vercel
// module.exports = app;
