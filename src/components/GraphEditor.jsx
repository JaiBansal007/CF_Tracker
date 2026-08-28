import React, { useState, useEffect, useMemo, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { LuNetwork, LuSettings, LuType } from 'react-icons/lu';

export default function GraphEditor({ darkMode }) {
  const [graphText, setGraphText] = useState("1 2\n2 3\n3 1\n4 2");
  const [isDirected, setIsDirected] = useState(false);
  const [containerWidth, setContainerWidth] = useState(600);
  const containerRef = useRef(null);
  const fgRef = useRef();

  // Resize listener for the graph container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    // Small delay to ensure flex layout is resolved
    setTimeout(updateDimensions, 100);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = useMemo(() => {
    const lines = graphText.split('\n');
    const nodes = new Set();
    const links = [];

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const source = parts[0];
        const target = parts[1];
        const label = parts.length >= 3 ? parts[2] : '';
        
        if (source && target) {
          nodes.add(source);
          nodes.add(target);
          links.push({
            source,
            target,
            label,
            id: `${source}-${target}-${links.length}` // unique id to prevent issues with duplicates
          });
        }
      } else if (parts.length === 1 && parts[0] !== '') {
        // Single isolated node
        nodes.add(parts[0]);
      }
    });

    return {
      nodes: Array.from(nodes).map(id => ({ id, name: id })),
      links: links
    };
  }, [graphText]);

  // Center graph on data update
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.d3Force('charge').strength(-300); // spread them out a bit
    }
  }, [graphData]);

  return (
    <div className={`max-w-7xl mx-auto ${darkMode ? 'text-gray-200' : 'text-gray-800'} h-full min-h-[80vh] flex flex-col`}>
      <div className="flex flex-col gap-4 flex-grow">
        
        {/* Header */}
        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0d0d0d] border-[#1f1f1f]' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <LuNetwork className="text-violet-500" />
                Graph Editor
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Visualize graphs dynamically from text input.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-900/30 p-1.5 rounded-lg border border-gray-800">
              <button 
                onClick={() => setIsDirected(false)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${!isDirected ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Undirected
              </button>
              <button 
                onClick={() => setIsDirected(true)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${isDirected ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Directed
              </button>
            </div>
          </div>
        </div>

        {/* Main Editor Split View */}
        <div className="flex flex-col md:flex-row gap-4 flex-grow min-h-[500px]">
          
          {/* Left: Editor */}
          <div className={`flex flex-col w-full md:w-1/3 rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#0d0d0d] border-[#1f1f1f]' : 'bg-white border-gray-200'}`}>
            <div className={`px-4 py-3 flex items-center gap-2 border-b ${darkMode ? 'border-[#1f1f1f] bg-[#111111]' : 'border-gray-200 bg-gray-50'}`}>
              <LuType className="text-violet-500" size={16} />
              <h3 className="text-sm font-semibold tracking-wide uppercase">Input Data</h3>
            </div>
            <div className="p-4 flex-grow flex flex-col">
              <p className="text-xs text-gray-500 mb-3 font-mono">
                Format: <span className="text-violet-400">node1</span> <span className="text-violet-400">node2</span> [label]<br/>
                Example:<br/>
                1 2<br/>
                2 3 weight_5
              </p>
              <textarea
                value={graphText}
                onChange={(e) => setGraphText(e.target.value)}
                className={`w-full h-full flex-grow resize-none p-4 font-mono text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                  darkMode ? 'bg-[#151515] text-gray-200 placeholder-gray-700' : 'bg-gray-50 text-gray-800 placeholder-gray-400'
                }`}
                placeholder="Enter graph edges here..."
                spellCheck="false"
              />
            </div>
          </div>

          {/* Right: Graph Visualizer */}
          <div ref={containerRef} className={`flex flex-col w-full md:w-2/3 rounded-2xl border overflow-hidden relative ${darkMode ? 'bg-[#0a0a0a] border-[#1f1f1f]' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`absolute top-0 inset-x-0 px-4 py-3 flex justify-between items-center z-10 pointer-events-none`}>
              <div className="flex items-center gap-2">
                <LuSettings className="text-gray-500" size={16} />
                <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-400">Visualizer</h3>
              </div>
              <div className="text-xs text-gray-600 font-mono pointer-events-auto">
                Nodes: {graphData.nodes.length} | Edges: {graphData.links.length}
              </div>
            </div>
            
            <div className="w-full h-full min-h-[500px] flex items-center justify-center cursor-move pt-12">
              <ForceGraph2D
                ref={fgRef}
                width={containerWidth}
                height={500}
                graphData={graphData}
                nodeLabel="name"
                nodeColor={() => darkMode ? '#8b5cf6' : '#7c3aed'}
                nodeRelSize={6}
                linkColor={() => darkMode ? '#333333' : '#cbd5e1'}
                linkWidth={2}
                linkDirectionalArrowLength={isDirected ? 6 : 0}
                linkDirectionalArrowRelPos={1}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.name;
                  const fontSize = 14/globalScale;
                  ctx.font = `bold ${fontSize}px Sans-Serif`;
                  
                  // Draw Node
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
                  ctx.fillStyle = darkMode ? '#8b5cf6' : '#7c3aed';
                  ctx.fill();
                  
                  // Draw Border
                  ctx.lineWidth = 1.5/globalScale;
                  ctx.strokeStyle = darkMode ? '#000000' : '#ffffff';
                  ctx.stroke();

                  // Draw Text
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = darkMode ? '#e2e8f0' : '#1e293b';
                  ctx.fillText(label, node.x, node.y - 12);
                }}
                linkCanvasObjectMode={() => 'after'}
                linkCanvasObject={(link, ctx, globalScale) => {
                  if (!link.label) return;
                  
                  // Calculate label position (middle of link)
                  const start = link.source;
                  const end = link.target;
                  if (typeof start !== 'object' || typeof end !== 'object') return; // wait for positions

                  const textPos = Object.assign(...['x', 'y'].map(c => ({
                    [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
                  })));

                  const fontSize = 10 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  const label = link.label;
                  
                  // Draw text background for readability
                  ctx.fillStyle = darkMode ? '#0a0a0a' : '#f8fafc';
                  const textWidth = ctx.measureText(label).width;
                  const bgPadding = 2 / globalScale;
                  ctx.fillRect(textPos.x - textWidth/2 - bgPadding, textPos.y - fontSize/2 - bgPadding, textWidth + bgPadding*2, fontSize + bgPadding*2);

                  // Draw text
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = darkMode ? '#94a3b8' : '#64748b';
                  ctx.fillText(label, textPos.x, textPos.y);
                }}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
              />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
