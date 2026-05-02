import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PhylogeneticNode } from '../types';

interface Props {
  data: PhylogeneticNode;
  width?: number;
  height?: number;
}

const PhylogeneticTree: React.FC<Props> = ({ data, width = 800, height = 600 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tree = d3.tree<PhylogeneticNode>()
      .size([innerHeight, innerWidth]);

    const root = d3.hierarchy(data);
    tree(root);

    // Links
    g.selectAll('.link')
      .data(root.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1.5)
      .attr('d', d3.linkHorizontal<any, any>()
        .x((d: any) => d.y)
        .y((d: any) => d.x));

    // Nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', (d: any) => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 4)
      .attr('fill', (d: any) => d.children ? '#10b981' : '#3b82f6')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    node.append('text')
      .attr('dy', '.31em')
      .attr('x', (d: any) => d.children ? -8 : 8)
      .attr('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .text((d: any) => d.data.name)
      .attr('font-size', '10px')
      .attr('font-weight', (d: any) => d.children ? 'bold' : 'normal')
      .attr('fill', '#1e293b')
      .clone(true).lower()
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

    // Zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    // @ts-ignore
    svg.call(zoomBehavior);

  }, [data, width, height]);

  return (
    <div className="w-full h-full bg-slate-50/30 rounded-2xl overflow-hidden cursor-move border border-slate-100">
      <svg 
        ref={svgRef} 
        width="100%" 
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default PhylogeneticTree;
