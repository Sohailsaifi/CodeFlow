# Dynamic Flowchart Generator 🔄

A sophisticated Python code analysis and visualization tool that automatically generates interactive flowcharts from Python codebases. This tool helps developers understand complex codebases, identify code smells, and visualize relationships between different components of their code.

## ✨ Features

### Code Analysis
- **Multi-level Analysis**
  - Single file analysis
  - Complete project analysis
  - Class and method relationship mapping
  - Function call tracking
  - Import dependency visualization

### Metrics & Quality Insights
- **Cyclomatic Complexity Analysis**
  - Color-coded complexity indicators
  - Visual warnings for complex functions
  - Detailed complexity metrics

- **Code Quality Detection**
  - Dead code identification
  - Code smell detection
  - Function size analysis
  - Parameter count optimization suggestions

### Visualization
- **Interactive Flowcharts**
  - Zoomable and pannable interface
  - Collapsible node groups
  - Customizable layouts
  - Real-time updates

- **Visual Indicators**
  - Color-coded nodes based on complexity
  - Dashed borders for dead code
  - Distinct edge styles for different relationships
  - Clear hierarchy visualization

### User Interface
- **Modern Web Interface**
  - Clean, intuitive design
  - Drag-and-drop file upload
  - Project ZIP upload support
  - Interactive tooltips with detailed information

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 14+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dynamic-flowchart-generator.git
cd dynamic-flowchart-generator
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
python -m app.main
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## 🔍 Usage

### Single File Analysis
1. Click "Single File" in the upload section
2. Select a Python file (.py)
3. View the generated flowchart with metrics

### Project Analysis
1. Click "Project Directory" in the upload section
2. Upload a ZIP file containing your Python project
3. Explore the complete project structure and relationships

### Understanding the Visualization

#### Node Colors
- 🟢 Green: Low complexity (≤5)
- 🟡 Yellow: Moderate complexity (≤10)
- 🔴 Red: High complexity (>10)

#### Border Styles
- Solid: Active code
- Dashed: Potentially dead code
- Thick Red: Contains code smells

#### Edge Types
- Solid Blue: Contains relationship
- Solid Purple: Function calls
- Dashed Green: Import relationship

## 🛠 Technical Architecture

### Backend
- FastAPI for high-performance API endpoints
- NetworkX for graph operations
- AST for Python code parsing
- Custom metrics analyzers

### Frontend
- React with TypeScript
- Cytoscape.js for graph visualization
- Tailwind CSS for styling
- Vite for development and building

## 📊 Code Metrics

The tool analyzes various metrics including:
- Cyclomatic Complexity
- Lines of Code (LOC)
- Parameter Count
- Nesting Depth
- Code Smells
- Dead Code Detection

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Acknowledgments

- [Cytoscape.js](https://js.cytoscape.org/) for graph visualization
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework