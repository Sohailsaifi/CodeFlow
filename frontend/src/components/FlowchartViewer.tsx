import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import ProjectUploader from './ProjectUploader';
import ProjectGraph from './ProjectGraph';

const FlowchartViewer = () => {
  const [graphData, setGraphData] = useState(null);

  const handleUploadSuccess = (data) => {
    // Ensure data has the correct structure
    if (data && data.nodes && data.edges) {
      setGraphData(data);
    } else {
      console.error('Invalid data structure:', data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex flex-col space-y-4">
          <ProjectUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
      
      {graphData && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Code Visualization</h3>
            <p className="mt-1 text-sm text-gray-500">
              Interactive flowchart showing your code's structure and relationships.
            </p>
          </div>
          <ProjectGraph data={graphData} />
        </div>
      )}
    </div>
  );
};

export default FlowchartViewer;