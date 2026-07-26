# HireHuntAI 🤖

An **Agentic Interview Management System** that leverages AI to automate and streamline the hiring process. This system intelligently manages candidate applications, conducts automated interviews, and provides comprehensive recruitment analytics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- **Intelligent Candidate Shortlisting** - Automated candidate filtering and ranking based on ATS scores
- **AI-Powered Interviews** - Conduct automated interviews using generative AI (Google Gemini & OpenAI)
- **Email Notifications** - Automated email communications with candidates and recruiters
- **Scheduled Processing** - Cron-based job scheduling for automated workflows
- **Drag & Drop UI** - Intuitive candidate management interface with drag-and-drop support
- **PDF Report Generation** - Create professional interview reports and scorecards
- **Real-time Collaboration** - Socket.io integration for live updates
- **Authentication** - Secure user management with Clerk

### Advanced Features
- **Candidate Ranking Algorithm** - Multi-factor scoring system for intelligent shortlisting
- **Customizable Email Templates** - Mustache/Handlebars templating for dynamic email content
- **Interview Analytics** - Comprehensive dashboards and performance metrics
- **Dark Mode Support** - Theme switching capability
- **Mobile Responsive** - Fully responsive UI with Radix UI components

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 15.3.3
- **UI Components:** Radix UI with Tailwind CSS
- **Icons:** Tabler Icons, Lucide React
- **Charts & Data:** Recharts, TanStack React Table
- **State Management:** Zustand
- **Form Handling:** Zod for validation
- **Drag & Drop:** @dnd-kit

### Backend
- **Runtime:** Node.js with ES Modules
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Clerk
- **Email Service:** Nodemailer
- **Job Scheduling:** node-cron
- **Real-time:** Socket.io
- **File Upload:** Cloudinary, Formidable

### AI/ML Services
- **Google Generative AI** (@google/generative-ai)
- **Google GenAI** (@google/genai)
- **OpenAI** (for alternative AI capabilities)

### PDF & Document Processing
- **PDF Generation:** jsPDF, PDFKit, pdfmake, pdf-creator-node
- **PDF Parsing:** pdf-parse, pdfjs
- **HTML to PDF:** html-to-pdfmake, puppeteer
- **React PDF:** react-pdf

### Utilities
- **HTTP Client:** Axios
- **Date Handling:** date-fns
- **DOM Parsing:** jsdom
- **Templating:** Mustache, Handlebars
- **Environment:** dotenv

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ (with ES Module support)
- MongoDB instance (local or cloud)
- Git
- npm/pnpm/yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/doshantgiradkar/HireHuntAI.git
   cd HireHuntAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   pnpm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   
   ```
   MONGODB_URI=mongodb://localhost:27017/interview-management
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASS=your-app-specific-password
   GOOGLE_API_KEY=your_google_api_key
   OPENAI_API_KEY=your_openai_api_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CRON_ENABLED=true
   CRON_TIMEZONE=UTC
   SVIX_WEBHOOK_SECRET=your_svix_secret
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to http://localhost:3000

## 📁 Project Structure

```
HireHuntAI/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   └── page.js
│   ├── components/
│   │   ├── ui/
│   │   └── feature components
│   ├── lib/
│   │   ├── shortlistingLogic.js
│   │   ├── emailService.js
│   │   ├── cronJobs.js
│   │   └── utilities
│   └── hooks/
├── public/
├── tests/
│   ├── shortlistingLogic.test.js
│   ├── emailService.test.js
│   ├── cronJobs.integration.test.js
│   ├── cronApi.test.js
│   └── e2e.test.js
├── .env.local
├── next.config.js
├── tailwind.config.js
└── package.json
```

## ⚙️ Configuration

### Database Setup

**MongoDB Local:**
```bash
mongod
```

**MongoDB Atlas (Cloud):**

Use connection string format: `mongodb+srv://username:password@cluster.mongodb.net/interview-management`

### Email Service Setup

1. **Gmail Setup:**
   - Enable 2-Factor Authentication
   - Create an App Password at https://myaccount.google.com/apppasswords
   - Store in GMAIL_USER and GMAIL_APP_PASS

2. **SMTP Configuration:**
   - Update settings in src/lib/emailService.js if using different provider

### AI Service Configuration

**Google Generative AI:**
- Get API key from https://makersuite.google.com/app/apikey
- Add to GOOGLE_API_KEY

**OpenAI:**
- Get API key from https://platform.openai.com/api-keys
- Add to OPENAI_API_KEY

## 💻 Usage

### Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linter
npm test         # Run all tests
```

### Test Commands

```bash
npm run test:shortlisting  # Test candidate ranking algorithm
npm run test:email         # Test email notifications
npm run test:cron          # Test job scheduling
npm run test:api           # Test API endpoints
npm run test:e2e           # Test end-to-end workflows
```

### Key Features

#### Candidate Shortlisting
The system automatically shortlists candidates based on:
- ATS score threshold (≥ 70)
- Target count calculation (1.5x job openings)
- Candidate ranking by match score
- Job status and expiration

#### Email Notifications
- Shortlist notifications to selected candidates
- Rejection emails to unselected candidates
- Summary reports to recruiters
- Customizable email templates

#### Scheduled Jobs (Cron)
- Runs hourly to process expired jobs
- Automatically shortlists candidates
- Schedules interviews
- Sends notifications
- Manually triggerable via API

## 🧪 Testing

The project includes comprehensive test suites covering all major features:

| Suite | Coverage | Tests | Command |
|-------|----------|-------|---------|
| Shortlisting Algorithm | 100% | 14 | npm run test:shortlisting |
| Email Service | 100% | 16 | npm run test:email |
| Cron Jobs | 100% | 14 | npm run test:cron |
| API Endpoints | 100% | 26 | npm run test:api |
| E2E Workflows | 100% | 25 | npm run test:e2e |
| **Total** | **100%** | **95** | npm test |

### Running Tests

```bash
npm test
```

Test reports are generated at tests/report.html after running the full test suite.

For detailed test documentation, see tests/README.md

## 📡 API Reference

### Cron Endpoints

**GET /api/cron**
- Returns the current status of the cron job scheduler
- Response: `{ status: "running" | "stopped", lastRun: Date, nextRun: Date }`

**POST /api/cron**
- Manually trigger the candidate shortlisting workflow
- Response: `{ success: boolean, message: string, shortlistedCount: number }`

All API routes are protected by Clerk authentication.

## 📦 Key Dependencies

- **Next.js** - React framework for production
- **Mongoose** - MongoDB object modeling
- **Clerk** - Authentication and user management
- **Nodemailer** - Email delivery
- **node-cron** - Task scheduling
- **Socket.io** - Real-time communication
- **Radix UI** - Accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Zod** - TypeScript-first schema validation
- **Zustand** - State management
- **Google Generative AI** - AI interview capabilities
- **OpenAI** - Alternative AI capabilities

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the LICENSE file for details.

## 🙋 Support

For issues, questions, or suggestions:
- Open an Issue on GitHub
- Check existing documentation in the tests/ directory
- Review test files for usage examples

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Clerk Authentication](https://clerk.com/docs)
- [Google Generative AI](https://ai.google.dev/)
- [Radix UI Components](https://www.radix-ui.com/)

---

**Built with ❤️ for intelligent hiring**

*Last Updated: July 2026*
