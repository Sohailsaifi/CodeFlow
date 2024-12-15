import React, { useEffect, useRef, useState, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { API_URL } from '../config';

// Register the required extensions
Cytoscape.use(dagre);
Cytoscape.use(popper);


const ExportButtons = ({ onExport }) => (
  <div className="absolute bottom-4 right-4 space-x-2">
    <button
      onClick={() => onExport('svg')}
      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Export SVG
    </button>
    <button
      onClick={() => onExport('png')}
      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
    >
      Export PNG
    </button>
    <button
      onClick={() => onExport('json')}
      className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
    >
      Export JSON
    </button>
  </div>
);

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
      <div className="mt-4 pt-2 border-t">
        <p className="text-xs text-gray-500">
          Node colors indicate complexity:<br/>
          🟢 Green: Simple (5)<br/>
          🟡 Yellow: Moderate (10)<br/>
          🔴 Red: Complex (10)
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Red border indicates code smells<br/>
          Dashed border indicates dead code
        </p>
      </div>
    </div>
  </div>
);

const ProjectGraph = ({ data }) => {
  const [showLegend, setShowLegend] = useState(true);
  const cyRef = useRef(null);

  const elements = useMemo(() => {
    const nodes = data.nodes.map(node => ({
      data: {
        ...node,
        id: node.id,
        label: node.label,
        type: node.type
      }
    }));

    const edges = data.edges.map((edge, index) => ({
      data: {
        id: `e${index}`,
        source: edge.source,
        target: edge.target,
        type: edge.type
      }
    }));

    return [...nodes, ...edges];
  }, [data]);

  useEffect(() => {
    console.log('Data received:', data);
    console.log('Formatted elements:', elements);
  }, [data, elements]);

  const layout = {
    name: 'dagre',
    rankDir: 'TB',
    padding: 50,
    spacingFactor: 2,
    nodeDimensionsIncludeLabels: true,
    animate: true,
    animationDuration: 500,
    fit: true,
    rankSep: 120,
    nodeSep: 60
  };

  const stylesheet = [
    // Base node styles
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'color': '#ffffff',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'font-size': '14px',
        'text-max-width': '160px',
        'width': 'label',
        'height': 'label',
        'padding': '20px',
        'border-width': 2,
        'shadow-blur': '5px',
        'shadow-color': '#94a3b8',
        'shadow-opacity': 0.5,
        'transition-property': 'background-color, border-color, width, height',
        'transition-duration': '0.3s'
      }
    },
    // Class nodes
    {
      selector: 'node[type = "class"]',
      style: {
        'background-color': '#2563eb',
        'border-color': '#1d4ed8',
        'shape': 'roundrectangle',
        'width': 220,
        'height': 50,
        'font-weight': 'bold',
        'font-size': '16px'
      }
    },
    // Method nodes with metrics
    {
      selector: 'node[type = "method"]',
      style: {
        'shape': 'roundrectangle',
        'background-color': (ele) => {
          const complexity = ele.data('metadata')?.complexity || 0;
          if (complexity <= 5) return '#4ade80';  // Simple - Green
          if (complexity <= 10) return '#fbbf24'; // Moderate - Yellow
          return '#ef4444';  // Complex - Red
        },
        'border-width': (ele) => {
          const smells = ele.data('metadata')?.code_smells?.length || 0;
          return smells > 0 ? 4 : 2;
        },
        'border-color': (ele) => {
          const smells = ele.data('metadata')?.code_smells?.length || 0;
          return smells > 0 ? '#ef4444' : '#4f46e5';
        },
        'border-style': (ele) => {
          return ele.data('metadata')?.is_dead_code ? 'dashed' : 'solid';
        }
      }
    },
    // Function nodes with metrics
    {
      selector: 'node[type = "function"]',
      style: {
        'shape': 'roundrectangle',
        'background-color': (ele) => {
          const complexity = ele.data('metadata')?.complexity || 0;
          if (complexity <= 5) return '#4ade80';  // Simple - Green
          if (complexity <= 10) return '#fbbf24'; // Moderate - Yellow
          return '#ef4444';  // Complex - Red
        },
        'border-width': (ele) => {
          const smells = ele.data('metadata')?.code_smells?.length || 0;
          return smells > 0 ? 4 : 2;
        },
        'border-color': (ele) => {
          const smells = ele.data('metadata')?.code_smells?.length || 0;
          return smells > 0 ? '#ef4444' : '#7c3aed';
        },
        'border-style': (ele) => {
          return ele.data('metadata')?.is_dead_code ? 'dashed' : 'solid';
        }
      }
    },
    // File nodes
    {
      selector: 'node[type = "file"]',
      style: {
        'background-color': '#3b82f6',
        'border-color': '#2563eb',
        'width': 200,
        'height': 50,
        'font-weight': 'bold'
      }
    },
    // Edge base styles
    {
      selector: 'edge',
      style: {
        'width': 2,
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1.5
      }
    },
    // Contains relationship
    {
      selector: 'edge[type = "contains"]',
      style: {
        'line-color': '#94a3b8',
        'target-arrow-color': '#94a3b8',
        'line-style': 'solid',
        'width': 3
      }
    },
    // Calls relationship
    {
      selector: 'edge[type = "calls"]',
      style: {
        'line-color': '#6366f1',
        'target-arrow-color': '#6366f1',
        'line-style': 'solid'
      }
    },
    // Import relationship
    {
      selector: 'edge[type = "import"]',
      style: {
        'line-color': '#10b981',
        'target-arrow-color': '#10b981',
        'line-style': 'dashed'
      }
    }
];


  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;

      // Add tooltips using native Cytoscape events
      cy.nodes().unbind('mouseover');
      cy.nodes().bind('mouseover', (event) => {
        const node = event.target;
        const data = node.data();
        const metadata = data.metadata || {};
        
        const renderedPosition = node.renderedPosition();
        const tooltip = document.createElement('div');
        tooltip.className = 'cy-tooltip';
        tooltip.innerHTML = `
        <div class="p-4 bg-white rounded-lg shadow-lg border">
            <h3 class="font-semibold mb-2">${data.label}</h3>
            <div class="space-y-1 text-sm">
            <p><span class="font-medium">Complexity:</span> ${metadata.complexity || 'N/A'}</p>
            <p><span class="font-medium">Lines of Code:</span> ${metadata.lines || 'N/A'}</p>
            <p><span class="font-medium">Parameters:</span> ${metadata.parameters || 'N/A'}</p>
            <p><span class="font-medium">Defined at Line:</span> ${metadata.line_number || 'N/A'}</p>
            ${metadata.is_dead_code ? 
                '<p class="text-red-600 font-medium">⚠️ Potentially Dead Code</p>' 
                : ''}
            ${metadata.code_smells?.length ? `
                <div class="mt-2">
                <span class="font-medium text-red-600">Code Smells:</span>
                <ul class="ml-4 list-disc text-red-600">
                    ${metadata.code_smells.map(smell => `<li>${smell}</li>`).join('')}
                </ul>
                </div>
            ` : ''}
            ${metadata.docstring ? `
                <div class="mt-2 p-2 bg-gray-50 rounded text-xs">
                <span class="font-medium">Documentation:</span>
                <p class="mt-1">${metadata.docstring}</p>
                </div>
            ` : ''}
            </div>
        </div>
        `;

        tooltip.style.position = 'absolute';
        tooltip.style.left = `${renderedPosition.x }px`;
        tooltip.style.top = `${renderedPosition.y + 570}px`;
        document.body.appendChild(tooltip);
      });

      cy.nodes().unbind('mouseout');
      cy.nodes().bind('mouseout', () => {
        const tooltips = document.getElementsByClassName('cy-tooltip');
        while (tooltips.length > 0) {
          tooltips[0].parentNode.removeChild(tooltips[0]);
        }
      });

      // Clean up event listeners
      return () => {
        cy.nodes().unbind('mouseover');
        cy.nodes().unbind('mouseout');
      };
    }
  }, [data]);


  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`${API_URL}/export/${format}`, {
        method: 'GET'
      });

      console.log(response)

      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'json') {
        const data = await response.json();
        // Download JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code_analysis.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For other formats, use the blob from the response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code_analysis.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="relative h-[600px] border rounded-lg overflow-hidden shadow-lg">
      <CytoscapeComponent
        elements={elements}
        layout={layout}
        stylesheet={stylesheet}
        className="w-full h-full"
        cy={(cy) => { 
          cyRef.current = cy;
          // Force a layout after the component is mounted
          setTimeout(() => {
            cy.layout(layout).run();
          }, 100);
        }}
      />
      {showLegend && <Legend />}
      <button
        onClick={() => setShowLegend(!showLegend)}
        className="absolute top-6 right-6 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
      >
        {showLegend ? '✕' : 'ℹ️'}
      </button>

      {/* <ExportButtons onExport={handleExport} /> */}
    </div>
  );
};

export default ProjectGraph;