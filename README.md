# 8D Coach - Interactive Problem Solving Platform

A comprehensive web application for managing the 8D (Eight Disciplines) problem-solving methodology with integrated AI coaching. Built with React, TypeScript, and modern web technologies.

## Overview

8D Coach is an intelligent platform designed to guide teams through the systematic 8D problem-solving process, from initial complaint registration to final corrective action implementation. The application combines structured workflows with AI-powered coaching to ensure effective root cause analysis and sustainable solutions.

## Key Features

### 📋 Complaint Management

- **Complaint Registration**: Structured form for capturing customer complaints with all critical details
- **Complaint Tracking**: Real-time dashboard showing complaint status and progress

### 🔄 8D Process Implementation

Complete implementation of all eight disciplines:

- **D1 - Team Formation**: Build cross-functional teams with defined roles and responsibilities
- **D2 - Problem Description**: Detailed problem characterization using 5W2H methodology
- **D3 - Interim Containment**: Immediate actions to protect customers
- **D4 - Root Cause Analysis**: Advanced tools including 5 Whys and Ishikawa diagrams
- **D5 - Corrective Actions**: Define and validate permanent solutions
- **D6 - Implementation**: Execute corrective actions with tracking and verification
- **D7 - Prevention**: Systematic approach to prevent recurrence
- **D8 - Team Recognition**: Celebrate success and capture lessons learned

### 🤖 AI-Powered Coaching

- **Contextual Guidance**: Real-time AI coach providing discipline-specific insights
- **Best Practice Recommendations**: Industry-standard methodologies and templates
- **Validation Support**: AI-assisted review of completeness and quality

### 📊 Analytics & Reporting

- **Dashboard Overview**: Key metrics and KPIs at a glance
- **Progress Tracking**: Visual indicators for each 8D discipline
- **Timeline Visualization**: Track problem resolution from start to finish
- **Export Capabilities**: Generate reports in multiple formats

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/STS-Engineer/problem-solving-app-frontend.git

# Navigate to project directory
cd problem-solving-app-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Application Structure

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context + Hooks
- **Routing**: React Router v6
- **AI Integration**: Anthropic Claude API
- **Build Tool**: Vite
- **Code Quality**: ESLint + Prettier

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000

```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow

1. Fork the repository
2. Create a feature branch:

```bash
   git checkout -b feature/amazing-feature
```

3. Make your changes and commit:

```bash
   git commit -m 'Add amazing feature'
```

4. Push to your branch:

```bash
   git push origin feature/amazing-feature
```

5. Open a Pull Request
