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
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Dynamic Flowchart Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectUploader onUploadSuccess={handleUploadSuccess} />
          {graphData && <ProjectGraph data={graphData} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlowchartViewer;