import express from 'express';
import nodemailer from 'nodemailer';
const accountSid = 'your-account-sid';
const authToken = 'your-auth-token';
const client = require('twilio')(accountSid, authToken);

const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/send-email', async (req, res) => {
    try {
        const { to, subject, body } = req.body;

        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            // Configure your email provider settings here
            // For example, for Gmail:
            service: 'Gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-password'
            }
        });

        // Send the email
        await transporter.sendMail({
            from: 'your-email@gmail.com',
            to,
            subject,
            text: body
        });

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});

app.post('/api/send-text-message', async (req, res) => {
    try {
        const { to, message } = req.body;

        // Implement your logic to send a text message using a SMS gateway service
        // For example, you can use Twilio:
        const accountSid = 'your-account-sid';
        const authToken = 'your-auth-token';

        await client.messages.create({
            body: message,
            from: 'your-twilio-phone-number',
            to
        });

        res.status(200).json({ message: 'Text message sent successfully' });
    } catch (error) {
        console.error('Error sending text message:', error);
        res.status(500).json({ message: 'Failed to send text message' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});