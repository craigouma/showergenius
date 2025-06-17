# ShowerGenius 🚿💡

Transform your fleeting shower thoughts into AI-powered insights! ShowerGenius captures those brilliant ideas that strike when you least expect them and expands them into different creative formats.

## ✨ Features

- **Capture Shower Thoughts**: Quickly save those eureka moments
- **AI-Powered Expansions**: Transform thoughts into 4 different formats:
  - 📝 **Essay**: Deep, thoughtful analysis
  - 🚀 **Startup Pitch**: Turn ideas into business opportunities  
  - 🎵 **Rap Verse**: Creative lyrical expression
  - 🤔 **Counter Argument**: Challenge your own thinking
- **Free Voice Generation**: Hear your thoughts spoken using browser speech synthesis
- **Value Rating**: AI evaluates your expanded thoughts (Trash, Seedling, or Unicorn)
- **Beautiful UI**: Modern, responsive design with smooth animations

## 🎯 Why ShowerGenius?

We've all had those brilliant thoughts in the shower, only to forget them moments later. ShowerGenius ensures those fleeting moments of genius are captured and expanded into something meaningful. Whether it's the next billion-dollar idea or just a funny observation, every thought deserves to be explored.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shower-genius
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🔧 Configuration

### Groq API (AI Expansions)
1. Visit [Groq Console](https://console.groq.com)
2. Create a free account
3. Generate an API key
4. Add it to your `.env` file as `VITE_GROQ_API_KEY`

**Note**: Without a Groq API key, the app will use fallback mock expansions.

### Voice Generation
Voice generation uses **free browser speech synthesis** - no API keys required! This works in all modern browsers and provides unlimited voice generation at no cost.

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI**: Groq API (free alternative to OpenAI)
- **Voice**: Browser Speech Synthesis API (free)
- **Icons**: Lucide React
- **Storage**: Local Storage (client-side)

## 📱 Usage

1. **Add a Thought**: Click the "Add Thought" button and enter your shower thought
2. **Choose Expansion Mode**: Select how you want your thought expanded
3. **Generate**: Watch as AI transforms your thought into the selected format
4. **Listen**: Click the play button to hear your expanded thought
5. **Share**: Use the share button to post to Reddit (mock feature)

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── AudioPlayer.tsx  # Voice playback component
│   ├── ThoughtCard.tsx  # Individual thought display
│   └── ...
├── pages/              # App pages
│   ├── HomePage.tsx    # Main thoughts list
│   └── ThoughtDetailPage.tsx # Detailed thought view
├── services/           # Core services
│   ├── browser-speech.ts    # Free browser speech synthesis
│   ├── voice-generator.ts   # Voice generation orchestrator
│   ├── groq.ts             # AI expansion service
│   └── api.ts              # Main API integration
├── utils/              # Utility functions
│   ├── voice-player.ts # Voice playback utilities
│   └── api-test.ts     # Testing utilities
├── data/               # Data management
│   └── storage.ts      # Local storage management
└── types/              # TypeScript type definitions
```

## 🧪 Testing

The app includes built-in testing utilities. Open the browser console and try:

- `testAPIs()` - Test API configurations
- `testBrowserSpeech()` - Test voice synthesis
- `testVoiceGenerator()` - Test voice generation flow

## 🎨 Features in Detail

### Voice Generation
- **100% Free**: Uses browser's built-in speech synthesis
- **No Limits**: Generate unlimited voice content
- **Cross-browser**: Works in Chrome, Firefox, Safari, Edge
- **Customizable**: Adjustable rate, pitch, and voice selection

### AI Expansions
- **Powered by Groq**: Fast, free AI API
- **4 Creative Modes**: Essay, Startup Pitch, Rap Verse, Counter Argument
- **Smart Fallbacks**: Mock responses when API unavailable
- **Value Rating**: AI evaluates thought quality

### Modern UI
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Engaging user experience  
- **Clean Layout**: Minimalist, distraction-free interface
- **Dark Mode Ready**: (Future feature)

## 🔮 Future Enhancements

- **Social Features**: Share with community, follow other users
- **Advanced AI**: GPT-4, Claude integration options
- **Export Options**: PDF, audio files, social media formats
- **Analytics**: Track your most valuable thoughts
- **Mobile App**: Native iOS and Android versions
- **Collaboration**: Team shower thoughts for businesses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** for providing free AI API access
- **Browser vendors** for implementing speech synthesis
- **React team** for the amazing framework
- **Tailwind CSS** for making styling enjoyable
- **All shower thinkers** who inspired this project

---

**Ready to turn your shower thoughts into genius? Start thinking! 🚿✨** 