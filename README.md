# Private Bank Proposal Generator (v8)

A high-fidelity proposal generator for private wealth advisors, featuring dual-scenario analysis and print-ready PDF generation.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 🛠 Features

- **Dual Scenario Analysis**: Compare different wealth preservation strategies (A/B testing).
- **Vector Infographics**: High-quality SVG visualizations for core values.
- **Print-Ready PDF**: A4 landscape formatted PDF generation using `html2pdf.js`.
- **Multi-language Support**: Seamless switching between Simplified and Traditional Chinese.

## 📦 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini Pro (optional via `geminiService.ts`)
- **PDF Generation**: `html2pdf.js`

## 🚀 Deployment

### GitHub Actions
The project includes a CI/CD pipeline in `.github/workflows/deploy.yml`. 
- **Requirement**: Set `GEMINI_API_KEY` in GitHub Repo Secrets if using AI features.
- **Workflow**: Automated build and deploy to `gh-pages` on every push to `main` or `master`.

### Manual Deployment
```bash
npm run deploy
```

## 📄 License
Private and Confidential. (c) 2026 Private Bank.
