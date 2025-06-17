# Deployment Guide - Netlify

## Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/craigouma/showergenius)

## Manual Deployment Steps

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select `craigouma/showergenius`

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (set in Netlify environment)

3. **Environment Variables**
   Add these in Netlify Dashboard → Site Settings → Environment Variables:
   
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```
   
   **Get Groq API Key:**
   - Visit [Groq Console](https://console.groq.com)
   - Create free account
   - Generate API key
   - Add to Netlify environment variables

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy
   - Get your live URL: `https://your-site-name.netlify.app`

## Features Working on Deployment

✅ **Free Browser Speech** - Works immediately, no setup needed  
✅ **AI-Powered Expansions** - Works with Groq API key  
✅ **Responsive Design** - Mobile and desktop ready  
✅ **Local Storage** - Thoughts persist across sessions  

## Build Optimization

The app is optimized for production:
- Tree-shaking removes unused code
- Minified JavaScript and CSS
- Optimized images and assets
- Fast loading with Vite

## Custom Domain (Optional)

1. Go to Site Settings → Domain Management
2. Add your custom domain
3. Configure DNS records
4. Enable HTTPS (automatic)

## Analytics & Monitoring

Consider adding:
- Netlify Analytics
- Google Analytics
- Sentry for error tracking

---

**Live Demo:** Your deployed URL will be available after setup!  
**Repository:** [https://github.com/craigouma/showergenius](https://github.com/craigouma/showergenius) 