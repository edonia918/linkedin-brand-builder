# LaunchBrand - Personal Brand Builder for LinkedIn

A modern web application that helps professionals build authentic personal brands on LinkedIn using AI-powered content generation.

## Features

- **AI-Powered Content Generation**: Create compelling LinkedIn posts and stories
- **Subscription Model**: $18.99/month with 7-day free trial
- **Email Confirmations**: Automatic email notifications for sign-ins and sign-ups
- **Secure Payments**: Stripe integration for subscription management
- **Responsive Design**: Clean, editorial aesthetic without AI-generated appearance

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Payments**: Stripe API
- **Email**: Nodemailer
- **Authentication**: JWT tokens

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Stripe account
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd linkedin-brand-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your actual values:
   - Get Stripe keys from your [Stripe Dashboard](https://dashboard.stripe.com/)
   - Set up Gmail app password for email sending
   - Generate a secure JWT secret

4. **Update Stripe publishable key in signin.html**
   Replace `pk_test_YOUR_STRIPE_PUBLISHABLE_KEY` in `signin.html` with your actual publishable key.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3001`

## Subscription Model

- **Price**: $18.99 per month
- **Trial Period**: 7 days free
- **Billing**: Automatic monthly charges after trial ends
- **Cancellation**: Users can cancel anytime before trial ends to avoid charges

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account with subscription
- `POST /api/auth/signin` - Sign in to existing account

### Email
- `POST /api/email/confirmation` - Send confirmation emails

### Subscriptions
- `POST /api/subscription/cancel` - Cancel subscription

### Webhooks
- `POST /api/webhooks/stripe` - Handle Stripe webhook events

## File Structure

```
├── index.html              # Homepage
├── about.html              # About page
├── contact.html            # Contact page
├── how-it-works.html       # Process explanation
├── signin.html             # Authentication page
├── styles.css              # Global styles
├── script.js               # Frontend JavaScript
├── server.js               # Backend API server
├── package.json            # Dependencies
├── .env.example            # Environment template
└── images/                 # Static assets
```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

### Testing Payments

Use Stripe's test card numbers for testing:
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`

## Deployment

1. Set up environment variables on your hosting platform
2. Configure Stripe webhooks to point to your `/api/webhooks/stripe` endpoint
3. Deploy the application
4. Update CORS settings if needed

## Support

For questions or issues, please contact support@launchbrand.com

## License

© 2025 LaunchBrand. All rights reserved.</content>
<parameter name="filePath">/Users/elizabethdonia/linkedin-brand-builder/README.md