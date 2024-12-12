import React, { useEffect, useRef, useState  } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

Cytoscape.use(dagre);


const Legend = () => (
    <div className="absolute top-4 right-4 bg-white/95 p-4 rounded-lg shadow-lg border border-gray-200 w-64">
      <h3 className="font-semibold mb-3 text-gray-800">Graph Legend</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-blue-600 mr-2"></div>
          <span className="text-sm text-gray-600">Class</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-indigo-500 mr-2"></div>
          <span className="text-sm text-gray-600">Method</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-violet-500 mr-2"></div>
          <span className="text-sm text-gray-600">Function</span>
        </div>
        <div className="h-px bg-gray-200 my-2"></div>
        <div className="flex items-center">
          <div className="w-8 h-0.5 bg-gray-400 mr-2"></div>
          <span className="text-sm text-gray-600">Contains</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-0.5 bg-indigo-500 mr-2"></div>
          <span className="text-sm text-gray-600">Calls</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-0.5 border-t-2 border-dashed border-emerald-500 mr-2"></div>
          <span className="text-sm text-gray-600">Imports</span>
        </div>
      </div>
    </div>
  );

const ProjectGraph = ({ data }) => {
  const [showLegend, setShowLegend] = useState(true);
  const cyRef = useRef(null);

  const layout = {
    name: 'dagre',
    rankDir: 'TB',
    padding: 50,
    spacingFactor: 1.5,
    nodeDimensionsIncludeLabels: true,
    animate: true,
    animationDuration: 500,
    fit: true,
    rankSep: 100,
    nodeSep: 50
  };

  const elements = [
    ...data.nodes.map(node => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        ...node.metadata
      }
    })),
    ...data.edges.map((edge, index) => ({
      data: {
        id: `e${index}`,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        relationship: edge.relationship
      }
    }))
  ];

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'color': '#ffffff',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'font-size': '14px',
        'text-max-width': '160px', // Added to handle long text
        'width': 'label',
        'height': 'label',
        'padding': '20px', // Added padding around text
        'border-width': 2,
        'shadow-blur': '5px',
        'shadow-color': '#94a3b8',
        'shadow-opacity': 0.5,
        'transition-property': 'background-color, border-color, width, height',
        'transition-duration': '0.3s'
      }
    },
    {
      selector: 'node[type = "class"]',
      style: {
        'background-color': '#2563eb', // Blue-600
        'border-color': '#1d4ed8', // Blue-700
        'shape': 'roundrectangle',
        'width': 220,
        'height': 50,
        'font-weight': 'bold',
        'font-size': '16px'
      }
    },
    {
      selector: 'node[type = "method"]',
      style: {
        'background-color': '#6366f1', // Indigo-500
        'border-color': '#4f46e5', // Indigo-600
        'shape': 'roundrectangle'
      }
    },
    {
      selector: 'node[type = "function"]',
      style: {
        'background-color': '#8b5cf6', // Violet-500
        'border-color': '#7c3aed', // Violet-600
        'shape': 'roundrectangle'
      }
    },
    {
      selector: 'node[type = "file"]',
      style: {
        'background-color': '#3b82f6', // Blue-500
        'border-color': '#2563eb', // Blue-600
        'width': 200,
        'height': 50,
        'font-weight': 'bold'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1.5
      }
    },
    {
      selector: 'edge[type = "contains"]',
      style: {
        'line-color': '#94a3b8', // Gray-400
        'target-arrow-color': '#94a3b8',
        'line-style': 'solid',
        'width': 3
      }
    },
    {
      selector: 'edge[type = "calls"]',
      style: {
        'line-color': '#6366f1', // Indigo-500
        'target-arrow-color': '#6366f1',
        'line-style': 'solid'
      }
    },
    {
      selector: 'edge[type = "import"]',
      style: {
        'line-color': '#10b981', // Emerald-500
        'target-arrow-color': '#10b981',
        'line-style': 'dashed'
      }
    }
  ];

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.layout(layout).run();
    }
  }, [data]);

  return (
    <div className="relative h-[600px] border rounded-lg overflow-hidden shadow-lg bg-gray-50">
      <CytoscapeComponent
        elements={elements}
        layout={layout}
        stylesheet={stylesheet}
        className="w-full h-full"
        cy={(cy) => { cyRef.current = cy; }}
      />
      {showLegend && <Legend />}
      <button
        onClick={() => setShowLegend(!showLegend)}
        className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
      >
        {showLegend ? '✕' : 'ℹ️'}
      </button>
    </div>
  );
};

export default ProjectGraph;