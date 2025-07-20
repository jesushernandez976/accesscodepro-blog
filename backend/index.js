import express from "express";
import connectDB from "./lib/connectDB.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import cors from "cors";
import nodemailer from "nodemailer";
import https from "https";
import bodyParser from "body-parser";



import dotenv from 'dotenv';
dotenv.config();

// app.use("/email", emailRouter);
app.use(clerkMiddleware());
app.use("/webhooks", webhookRouter);
app.use(express.json());

const allowedOrigins = [process.env.CLIENT_URL]; // e.g. "https://accesscodepro.blog"

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from origin ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // if you want to allow cookies/auth headers
}));

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.use((error, req, res, next) => {
  res.status(error.status || 500);

  res.json({
    message: error.message || "Something went wrong!",
    status: error.status,
    stack: error.stack,
  });
});



// Middleware
app.use(bodyParser.json());

// Function to verify reCAPTCHA
function verifyRecaptcha(token) {
  return new Promise((resolve, reject) => {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const postData = `secret=${secretKey}&response=${token}`;

    const options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// POST route to receive form data and send email
app.post('/send-email', async (req, res) => {
  const { name, email, phone, message, recaptchaResponse } = req.body;

  // Validate all required fields
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Please fill all fields' });
  }

  // Validate reCAPTCHA
  if (!recaptchaResponse) {
    return res.status(400).json({ error: 'Please complete the reCAPTCHA verification' });
  }

  try {
    // Verify reCAPTCHA with Google
    const recaptchaResult = await verifyRecaptcha(recaptchaResponse);

    if (!recaptchaResult.success) {
      console.log('reCAPTCHA verification failed:', recaptchaResult);
      return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }

    // Create transporter object using SMTP (example uses Gmail)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASS       
      }
    });

    // Email options
    let mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, 
      subject: `New inquiry from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({ error: 'Failed to send email' });
      }
      console.log('Email sent: ' + info.response);
      res.json({ message: 'Email sent successfully!' });
    });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({ error: 'Server error during verification. Please try again.' });
  }
});


app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});