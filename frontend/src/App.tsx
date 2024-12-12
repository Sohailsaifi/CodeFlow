import React from 'react';
import Layout from './components/Layout';
import FlowchartViewer from './components/FlowchartViewer';

function App() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Python Code Analyzer
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Visualize your Python code structure, class relationships, and function calls with an interactive flowchart.
          </p>
        </div>
        <FlowchartViewer />
      </div>
    </Layout>
  );
}

export default App;