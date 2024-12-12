import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const ProjectUploader = ({ onUploadSuccess }) => {
    const [uploadType, setUploadType] = useState('file');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);

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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => setUploadType('file')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                uploadType === 'file'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Single File
            </button>
            <button
              onClick={() => setUploadType('project')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                uploadType === 'project'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Project Directory
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center 
              ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}
              ${error ? 'border-red-300 bg-red-50' : ''}`}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload({ target: { files: e.dataTransfer.files } });
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              type="file"
              onChange={handleFileUpload}
              accept={uploadType === 'file' ? '.py' : '.zip'}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <svg
                className={`w-12 h-12 mb-4 ${
                  error ? 'text-red-400' : 'text-gray-400'
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m0 0v4a4 4 0 004 4h20a4 4 0 004-4V28m0 0V12a4 4 0 00-4-4h-4m4 20H8m20-12v8m0 0l-4-4m4 4l4-4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm text-gray-600">
                {uploadType === 'file'
                  ? 'Upload a Python file'
                  : 'Upload a ZIP file containing your project'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                or drag and drop here
              </span>
            </label>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Processing...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectUploader;