import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

const ProjectUploader = () => {
  const [uploadType, setUploadType] = useState('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = uploadType === 'file' ? '/upload-file/' : '/analyze-project/';
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onUploadSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Upload Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" onValueChange={setUploadType}>
          <TabsList>
            <TabsTrigger value="file">Single File</TabsTrigger>
            <TabsTrigger value="project">Project Directory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".py"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            <p className="text-sm text-gray-500 mt-2">Upload a single Python file to analyze its functions and relationships.</p>
          </TabsContent>
          
          <TabsContent value="project">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".zip"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            <p className="text-sm text-gray-500 mt-2">Upload a ZIP file containing your Python project to analyze relationships between files and functions.</p>
          </TabsContent>
        </Tabs>

        {loading && <div className="text-center mt-4">Processing...</div>}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectUploader;