import React from 'react';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    {/* Header */}
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">
              CodeFlow
            </span>
            <span className="ml-2 text-sm text-gray-500">
              Dynamic Flowchart Generator
            </span>
          </div>
          <div className="flex items-center space-x-4">
            
            <a
              href="#features"
              className="text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
              >
              Features
            </a>
            
              <a
              href="https://github.com/Sohailsaifi/CodeFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
            >
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>

    {/* Hero Section */}
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Code Analysis
          </h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
            Visualize Your Code Structure
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Upload your Python code and get an interactive visualization of your codebase's structure,
            dependencies, and relationships.
          </p>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {children}
    </main>

    {/* Features Section */}
    <section id="features" className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-indigo-600 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Fast Analysis</h3>
            <p className="mt-2 text-gray-500">
              Quickly analyze Python files or entire projects to understand their structure.
            </p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-indigo-600 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Interactive Visualization</h3>
            <p className="mt-2 text-gray-500">
              Explore your code structure through an interactive, dynamic flowchart.
            </p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-indigo-600 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Code Quality Insights</h3>
            <p className="mt-2 text-gray-500">
              Get insights about code complexity, dependencies, and potential improvements.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p className="text-gray-500 text-sm">
            Built with ♥️ using React, Python, and FastAPI
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Documentation
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

export default Layout;