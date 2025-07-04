# 🛍️ My Marketplace

A modern e-commerce marketplace built with Next.js and Supabase, featuring secure authentication and a clean, responsive design.

## ✨ Features

- **🔐 Secure Authentication**: Magic link authentication powered by Supabase
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🎨 Modern UI**: Clean and intuitive user interface
- **⚡ Fast Performance**: Built with Next.js 15 and React 19
- **🔄 Real-time Updates**: Live authentication state management
- **🎯 Type Safety**: Modern JavaScript with proper error handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gabo05555/Marketplace.git
   cd Marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to find your project URL and anon key
3. Add these to your `.env.local` file
4. Enable Email authentication in Authentication → Settings

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## 🛠️ Built With

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - JavaScript library for building user interfaces
- **[Supabase](https://supabase.com/)** - Backend as a Service with authentication
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[ESLint](https://eslint.org/)** - Code linting and formatting

## 📁 Project Structure

```
marketplace/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles
│   │   ├── layout.js        # Root layout
│   │   ├── page.js          # Home page (marketplace)
│   │   └── login/
│   │       └── page.js      # Login page
│   └── lib/
│       └── supabaseClient.js # Supabase configuration
├── public/                  # Static assets
├── .env.local              # Environment variables (create this)
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🎯 Usage

### Authentication Flow

1. **Login Required**: Users must authenticate to access the marketplace
2. **Magic Link**: Users receive a login link via email
3. **Auto-redirect**: Authenticated users are automatically logged in
4. **Logout**: Users can sign out using the logout button

### Features Overview

- **Product Display**: Grid layout showing product cards
- **User Authentication**: Secure login/logout system
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time State**: Authentication state updates in real-time

## 🚀 Deployment

### Deploy on Vercel

1. **Connect your repository** to [Vercel](https://vercel.com)
2. **Add environment variables** in your Vercel project settings
3. **Deploy** - Vercel will automatically build and deploy your app

### Deploy on Netlify

1. **Connect your repository** to [Netlify](https://netlify.com)
2. **Set build command**: `npm run build`
3. **Set publish directory**: `out` (if using static export)
4. **Add environment variables** in site settings

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues

If you encounter any issues, please [create an issue](https://github.com/yourusername/marketplace/issues) on GitHub.

## 📞 Support

For support, email your-email@example.com or create an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
