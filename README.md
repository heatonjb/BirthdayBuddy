# Birthday Event Management Platform

A comprehensive web-based platform for simplifying children's birthday event management, offering seamless RSVP tracking and personalized event experiences.

## 🌟 Features

- **Event Creation & Management**
  - Create personalized birthday events with child's details and interests
  - Customize event descriptions and date/time
  - Generate unique admin and guest links
  - Edit or cancel events as needed

- **Advanced RSVP Management**
  - Track RSVPs in real-time
  - Prevent duplicate RSVPs
  - Collect guest information including children's birth months
  - Optional event updates subscription

- **Smart Gift Suggestions**
  - Interest-based gift recommendations
  - Personalized suggestions based on child's preferences
  - Categorized gift ideas

- **Email Notifications**
  - Automatic event creation confirmation
  - RSVP confirmation emails
  - Calendar invites (ICS attachments)
  - Optional event updates for guests

- **Mobile-First Design**
  - Responsive layout for all devices
  - Clean, intuitive interface
  - Google-inspired minimalist design

## 🚀 Technologies Used

- **Frontend**
  - React with TypeScript
  - TanStack Query for data fetching
  - Tailwind CSS for styling
  - shadcn/ui components
  - Wouter for routing

- **Backend**
  - Express.js server
  - PostgreSQL database
  - Drizzle ORM
  - MailerSend for emails

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- MailerSend account for email functionality

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Email (MailerSend)
MAILERSEND_API_KEY=your_api_key
MAILERSEND_FROM_EMAIL=your_verified_email
MAILERSEND_FROM_NAME=Your Name
```

## 🛠️ Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/birthday-event-platform.git
cd birthday-event-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

6. Start in production mode:
```bash
npm start
```

## 📱 Usage Guide

### Creating an Event

1. Visit the homepage
2. Fill in the event details:
   - Parent's email
   - Child's name
   - Age turning
   - Event date and time
   - Select child's interests
   - Add event description
3. Submit to create the event
4. Receive confirmation email with admin and guest links

### Managing RSVPs

1. Share the guest link with invitees
2. Track RSVPs through the admin panel
3. View guest list and details
4. Make updates as needed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
