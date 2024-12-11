import React, { useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

Cytoscape.use(dagre);

const ProjectGraph = ({ data }) => {
  const [elements, setElements] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    // Transform data into cytoscape format
    const cytoscapeElements = {
      nodes: data.nodes.map(node => ({
        data: { ...node }
      })),
      edges: data.edges.map(edge => ({
        data: { ...edge }
      }))
    };
    setElements(cytoscapeElements);
  }, [data]);

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
      selector: 'node[type = "file"]',
      style: {
        'background-color': '#3b82f6',
        'label': 'data(label)',
        'color': '#ffffff',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': 200,
        'height': 50,
        'font-size': '14px',
        'text-wrap': 'wrap',
        'border-width': 3,
        'border-color': '#1d4ed8',
        'shape': 'roundrectangle'
      }
    },
    {
      selector: 'node[type = "user_function"]',
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
      selector: 'edge',
      style: {
        'width': 2,
        'curve-style': 'bezier',
        'line-color': '#94a3b8',
        'target-arrow-color': '#94a3b8',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.5
      }
    },
    {
      selector: 'edge[type = "import"]',
      style: {
        'line-style': 'dashed',
        'line-color': '#6366f1'
      }
    },
    {
      selector: 'edge[type = "contains"]',
      style: {
        'line-style': 'solid',
        'line-color': '#818cf8'
      }
    }
  ];

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden shadow-lg">
      <CytoscapeComponent
        elements={elements}
        layout={layout}
        stylesheet={stylesheet}
        className="w-full h-full"
      />
    </div>
  );
};

export default ProjectGraph;