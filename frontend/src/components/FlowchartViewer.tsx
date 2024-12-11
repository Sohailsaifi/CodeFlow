import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';

Cytoscape.use(dagre);

const FlowchartViewer = () => {
  const [elements, setElements] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cy, setCy] = useState(null);

  const layout = {
    name: 'dagre',
    rankDir: 'TB',
    padding: 50,
    spacingFactor: 1.5,
    animate: true,
    animationDuration: 500,
    fit: true,
    nodeDimensionsIncludeLabels: true
  };

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': '#4f46e5',
        'label': 'data(label)',
        'color': '#ffffff',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': 180,
        'height': 45,
        'font-size': '14px',
        'text-wrap': 'wrap',
        'border-width': 2,
        'border-color': '#312e81',
        'shape': 'roundrectangle'
      }
    },
    {
      selector: 'node[type = "builtin"]',
      style: {
        'background-color': '#9ca3af',
        'border-color': '#4b5563',
        'width': 120,
        'height': 35,
        'font-size': '12px',
        'shape': 'ellipse',
        'opacity': 0.7
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'curve-style': 'bezier',
        'line-color': '#94a3b8',
        'target-arrow-color': '#94a3b8',
        'target-arrow-shape': 'triangle'
      }
    },
    {
      selector: 'edge[type = "builtin"]',
      style: {
        'line-style': 'dotted',
        'opacity': 0.5,
        'width': 1
      }
    }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload-file/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate flowchart');
      }

      const data = await response.json();
      
      // Convert the data to Cytoscape format
      const cytoscapeElements = {
        nodes: data.nodes.map(node => ({
          data: {
            ...node,
            label: node.label,
          }
        })),
        edges: data.edges.map(edge => ({
          data: {
            ...edge,
            source: edge.source,
            target: edge.target
          }
        }))
      };

      setElements(cytoscapeElements);
      
      // Force relayout
      if (cy) {
        cy.elements().remove();
        cy.add(cytoscapeElements);
        cy.layout(layout).run();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto p-4">
      <CardHeader>
        <CardTitle>Dynamic Flowchart Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".py,.yaml,.yml,.txt"
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
          
          {loading && <div className="text-center">Generating flowchart...</div>}
          
          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}
          
          {elements.nodes.length > 0 && (
            <div className="h-[600px] border rounded-lg overflow-hidden">
              <CytoscapeComponent
                elements={[...elements.nodes, ...elements.edges]}
                layout={layout}
                stylesheet={stylesheet}
                className="w-full h-full"
                cy={(cy) => { setCy(cy); }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FlowchartViewer;