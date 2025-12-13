# RentAPog - Daily Domain Rental Platform

## Overview
RentAPog is a daily domain rental marketplace that allows users to rent domains for $20-$199/day. It features an innovative affiliate system where the 2nd sale goes to the platform (admin) to cover costs, and all other sales go 100% to the user. The platform provides automated subdomain creation, an affiliate tracking system with clean URLs, and a comprehensive email automation sequence to onboard users and drive referrals. It also includes a marketplace for users to rent out their registered subdomains. The business vision is to create a dynamic and profitable ecosystem for domain rentals and affiliate marketing.

## User Preferences
I prefer iterative development with clear communication on changes. Please ask before making major architectural changes or introducing new core technologies. For explanations, I prefer detailed breakdowns, especially for complex features like the affiliate pass-up logic and Stripe integrations. Do not make changes to the existing environment variables without explicit confirmation.

## System Architecture

### UI/UX
The frontend is built with React, Wouter for routing, Tailwind CSS, and Radix UI components for a modern and responsive design. It features a patriotic red, white, and blue gradient theme. Key pages include the home page with email capture, an admin setup page, a domain registry landing page, and a backend user dashboard. Data test IDs are present on all interactive elements for robust testing.

### Technical Implementations
- **Frontend**: React, Wouter, Tailwind CSS, Radix UI, Framer Motion, TypeScript.
- **Backend**: Express.js (Node.js), TypeScript. Handles authentication, user profiles, affiliate tracking, domain management, and Stripe integrations.
- **Database**: PostgreSQL with Drizzle ORM and schema validation. Stores users, email schedules, affiliate sales, rental domains, and email leads.
- **Email System**: Nodemailer with Gmail SMTP for sending automated email sequences. A background worker sends scheduled emails every 10 seconds. Resend API is used for transactional emails (e.g., password resets, domain notifications).
- **Payment Processing**: Stripe for one-time payments and subscriptions, including Stripe Connect for user payouts.
- **Domain Management**: Namecheap API for automatic subdomain creation, deletion, and URL forwarding (e.g., `domainname.rentapog.com` forwarding to user's affiliate link).
- **Authentication**: Cross-subdomain cookie-based authentication with 7-day persistence. Admin authentication uses server-side session storage with httpOnly cookies for enhanced security.
- **Affiliate System**: Captures affiliate codes from URLs, stores them in localStorage, and applies pass-up logic for sales and rentals (1st, 3rd+ sale/rental to user; 2nd to admin).
- **Subdomain Rental Marketplace**: Allows users to list their registered subdomains for rent, with Stripe subscriptions handling daily rental charges and applying pass-up logic.
- **Level-Based Commissions**: Users earn commissions only on sales at or below their membership level; higher-level sales pass up to admin.
- **Niche-Based Domain Notifications**: Users can select niches and receive email notifications when new domains in those niches are listed.
- **Admin Tools**: Secure admin panel with Stripe status display, affiliate link tester, and detailed analytics.
- **Website Builder**: Admin-only feature to create, edit, and deploy static websites to Cloudflare Pages. Uses Coey AI to generate HTML content on demand.
- **Deployment**: Runs on Replit with `npm run dev`, using Vite for frontend bundling and `tsx` for backend TypeScript runtime.

### Feature Specifications
- **User Registration**: Email-based signup with optional affiliate code.
- **Affiliate Links**: Automatic generation and tracking, including clean subdomain forwarding.
- **Email Automation**: 7-email sequence triggered on signup with unique affiliate links.
- **Domain Rental**: Users can rent domains for a daily fee, with automated subdomain creation and forwarding.
- **Stripe Connect**: Mandatory OAuth flow for users to connect their Stripe accounts for receiving payouts.
- **Password Reset**: Secure forgot password flow with token-based reset.
- **Admin/User Segregation**: Separate login and dashboards for admin and regular users.

## External Dependencies
- **Stripe**: For payment processing, subscriptions, and affiliate payouts via Stripe Connect.
- **Namecheap API**: For automated subdomain registration, management, and URL forwarding.
- **Cloudflare Pages API**: For deploying static websites created in the admin website builder.
- **Gmail SMTP**: Used by Nodemailer for sending automated email sequences.
- **Resend API**: For transactional emails like domain fulfillment notifications, password resets, and niche-based domain alerts.
- **PostgreSQL**: The primary database for all application data.
- **Anthropic (Claude)**: Integrated for AI functionalities (via `CLAUDE_API_KEY`).
- **AWeber**: Mentioned for email automation, though manual setup is required.