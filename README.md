# AI-Native Consumer Health Experiences 🍎

An AI-powered consumer health co-pilot built for the **Encode 2026 Hackathon**. This application helps users make informed food decisions by analyzing ingredients, nutritional information, and product data through intelligent AI reasoning.

## 🚀 Features

- **Intelligent Food Analysis**: AI-powered analysis of ingredients and nutritional information
- **Image Recognition**: Upload photos of food labels for instant OCR text extraction and analysis
- **Multi-Model Support**: Choose from various AI models (Gemini, Gemma, etc.) for analysis
- **Personalized Insights**: Tailored recommendations based on health goals and dietary needs
- **Open Food Facts Integration**: Enriched analysis using comprehensive food database
- **Real-time Chat Interface**: Conversational experience with chat history
- **Offline Support**: Works offline with cached data

## 🏗️ Architecture

This project consists of two main components:

### Backend (Python/FastAPI)
- **FastAPI** server with OCR capabilities
- **LangChain** integration for AI model management
- **PaddleOCR** for image text extraction
- **Open Food Facts** API integration
- Multiple AI model support (Gemini, Ollama, etc.)
- **Runs on port 53300**

### Frontend (React/TypeScript)
- **React** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** components with Tailwind CSS
- **Framer Motion** for smooth animations
- **Zustand** for state management
- **React Query** for API management

## 📋 Prerequisites

### Backend Requirements
- Python 3.11+
- uv package manager (recommended)

### Frontend Requirements
- Node.js 18+
- npm

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/elan2006/encode2026-hackathon-public.git
cd encode2026-hackathon-public
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
uv sync

# Create environment file
cp .env.example .env
# Edit .env with your API keys (see API Configuration below)
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm i
```

## 🚀 Running the Application

### Backend Server (Port 53300)

#### Windows
```cmd
cd backend
uv sync
# Activate virtual environment
.venv\Scripts\activate
uvicorn server:app --reload --port 53300
```

#### macOS
```bash
cd backend
uv sync
# Activate virtual environment
source .venv/bin/activate
uvicorn server:app --reload --port 53300
```

#### Linux
```bash
cd backend
uv sync
# Activate virtual environment
source .venv/bin/activate
uvicorn server:app --reload --port 53300
```

The backend server will be available at `http://localhost:53300`

### Frontend Development Server (Port 8080)
```bash
cd frontend
npm run dev -- --port 8080
```

The frontend application will be available at `http://localhost:8080` (or the port shown in terminal)

## 🔧 Troubleshooting

### Frontend Import Resolution Issues

If you encounter errors like "Failed to resolve import @/components/ui/toaster", try these solutions:

1. **Clear Vite cache and restart**:
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   npm run dev -- --port 8080
   ```

2. **Reinstall dependencies**:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm i
   npm run dev -- --port 8080
   ```

3. **Verify path aliases are working**:
   - Check that `vite.config.ts` has the `@` alias pointing to `./src`
   - Restart the dev server after any config changes

### Backend Connection Issues

If you see "Cannot connect to backend" errors:

1. **Verify backend is running**:
   ```bash
   curl http://localhost:53300/health
   ```
   Should return: `{"status":"healthy","service":"AI-Native Consumer Health API"}`

2. **Check backend logs** for any startup errors

3. **Verify API keys** in backend `.env` file are set correctly

### Common Issues

- **Port conflicts**: Ensure ports 53300 (backend) and 8080 (frontend) are available
- **API key errors**: Verify your `.env` file has valid `GOOGLE_API_KEY` and `OCR_API_KEY`
- **CORS issues**: Backend allows frontend on `http://localhost:8080`

## 🔑 API Configuration

Before running the application, you need to configure the required API keys in the backend `.env` file:

### Required API Keys

1. **Google API Key** (for Gemini AI):
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Add to `.env` file: `GOOGLE_API_KEY=your_google_api_key_here`

2. **OCR Space API Key** (for image text extraction):
   - Get your free API key from [OCR.space](https://ocr.space/ocrapi)
   - Add to `.env` file: `OCR_API_KEY=your_ocr_space_api_key_here`

### Setup Steps

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values:
   ```env
   GOOGLE_API_KEY=your_actual_google_api_key
   OCR_API_KEY=your_actual_ocr_space_api_key
   ```

3. Save the file and proceed with running the application

## 📖 Usage

1. **Start Both Services**: Run the backend server first, then start the frontend development server

2. **Text Analysis**: Type any food-related question like "Should I eat this cereal?" or "What's in chicken biryani?"

3. **Image Analysis**: Upload a photo of a food label or product packaging for instant ingredient analysis

4. **Follow-up Questions**: Ask follow-up questions to get more specific insights about nutrition, health impacts, or alternatives

5. **Model Selection**: Choose different AI models for varied analysis perspectives

## 🎯 Example Interactions

**Question**: "Should I eat this ice cream?"

**AI Response**: Provides structured insights including:
- What the product really is
- What matters most (key ingredients)
- Who this matters for (dietary considerations)
- Trade-offs & uncertainty
- Bottom-line guidance

## 📁 Project Structure

```
encode2026-hackathon-public/
├── backend/
│   ├── main.py                 # Core application logic
│   ├── server.py              # FastAPI server (port 53300)
│   ├── ocr/                   # OCR text extraction
│   ├── mcptools/              # Open Food Facts integration
│   ├── modelmanager/          # AI model management
│   ├── prompts/               # System prompts
│   └── tests/                 # User persona tests
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Application pages
│   │   └── stores/           # State management
│   └── public/               # Static assets
└── README.md
```

## 🔧 Configuration

### Backend Configuration
- Set `GOOGLE_API_KEY` and `OCR_API_KEY` in `.env` file (see API Configuration section)
- Configure model preferences in `modelmanager/`
- Customize system prompts in `prompts/`
- Server runs on port **53300**

### Frontend Configuration
- Update API endpoint to point to `http://localhost:53300`
- Styling customization via Tailwind CSS
- Component theming with shadcn/ui

## 🧪 Testing

The backend includes comprehensive testing with different user personas:
- Health-conscious users
- Users with specific conditions (diabetes, obesity)
- Fitness-focused users
- Professional dietitians

Run tests:
```bash
cd backend
uv run main.py
```

## 🚦 Development Workflow

1. **Start Backend**:
   ```bash
   cd backend
   uv sync  # Install dependencies if not done
   source .venv/bin/activate  # Activate virtual environment
   uvicorn server:app --reload --port 53300  # Starts on port 53300
   ```

2. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm i  # Install dependencies if not done
   npm run dev -- --port 8080
   ```

3. **Access Application**:
   - Frontend: `http://localhost:8080` (or port shown in terminal)
   - Backend API: `http://localhost:53300`
   - API Documentation: `http://localhost:53300/docs`

## 🎯 Hackathon Submission

This project is built for the **Encode 2026 Hackathon** focusing on AI-native consumer health experiences. The application demonstrates:

- Advanced AI reasoning for health decisions
- Multi-modal input processing (text + images)
- Real-time OCR and data enrichment
- User-centric design for health insights
- Scalable architecture with modern tech stack

## 📝 License

This project is part of the Encode 2026 Hackathon.

## 🙏 Acknowledgments

- Built for the **Encode 2026 Hackathon**
- Uses Open Food Facts database for nutritional information
- Powered by various AI models for intelligent analysis
- OCR capabilities provided by PaddleOCR

---

**Made with ❤️ for better food decisions at Encode 2026 Hackathon**
