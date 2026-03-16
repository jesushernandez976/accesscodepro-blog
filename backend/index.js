import express from "express";
import connectDB from "./lib/connectDB.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import https from "https";
import bodyParser from "body-parser";
import sgMail from "@sendgrid/mail";

const app = express();


import dotenv from 'dotenv';
dotenv.config();



const PORT = process.env.PORT || 5000;

app.use("/webhooks", webhookRouter);

app.use(bodyParser.json());
app.use(express.json());
app.use(clerkMiddleware());
app.use(cors(process.env.CLIENT_URL));
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

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

  // 1. Validate all fields
  if (!name || !email || !phone || !message || !recaptchaResponse) {
    return res.status(400).json({ error: 'Missing fields or reCAPTCHA' });
  }

  // 2. Verify reCAPTCHA
  const recaptchaResult = await verifyRecaptcha(recaptchaResponse);
  if (!recaptchaResult.success) {
    return res.status(400).json({ error: 'reCAPTCHA failed' });
  }

  // 3. Send email with SendGrid
  try {
    await sgMail.send({
      to: process.env.EMAIL_USER,
      from: process.env.EMAIL_USER, // must be verified in SendGrid
      subject: `New inquiry from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}`
    });

    return res.json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});


app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port the ${PORT}`);
});
