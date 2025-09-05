'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { Box } from '@mui/material';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  MarkerType,
  ConnectionLineType,
  ReactFlowInstance,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface StructureFlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (params: Connection) => void;
  type?: 'frontend' | 'backend';
  height?: number | string;
  readOnly?: boolean;
}

// دالة لإعادة تنظيم العقد بطريقة هرمية
const organizeNodesLayout = (nodes: Node[], edges: Edge[]): Node[] => {
  if (!nodes.length) return nodes;

  // بناء خريطة العلاقات
  const children = new Map<string, string[]>();
  const parents = new Map<string, string>();
  
  edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;
    
    parents.set(targetId, sourceId);
    if (!children.has(sourceId)) {
      children.set(sourceId, []);
    }
    children.get(sourceId)!.push(targetId);
  });

  // تحديد المستويات
  const levels: string[][] = [];
  const visited = new Set<string>();
  
  // الجذور (العقد بدون آباء)
  const roots = nodes
    .filter(node => !parents.has(node.id))
    .map(node => node.id);
  
  if (roots.length > 0) {
    levels.push([...roots]);
    roots.forEach(id => visited.add(id));
  }

  // المستويات التالية
  let currentLevel = [...roots];
  while (currentLevel.length > 0) {
    const nextLevel: string[] = [];
    currentLevel.forEach(nodeId => {
      const nodeChildren = children.get(nodeId) || [];
      nodeChildren.forEach(childId => {
        if (!visited.has(childId)) {
          nextLevel.push(childId);
          visited.add(childId);
        }
      });
    });
    if (nextLevel.length > 0) {
      levels.push([...nextLevel]);
    }
    currentLevel = nextLevel;
  }

  // العقد المتبقية (غير متصلة)
  const orphans = nodes
    .filter(node => !visited.has(node.id))
    .map(node => node.id);
  if (orphans.length > 0) {
    levels.push(orphans);
  }

  // حساب المواضع
  const nodeWidth = 200;
  const nodeHeight = 80;
  const horizontalSpacing = 150;
  const verticalSpacing = 180;

  const layoutedNodes: Node[] = nodes.map(node => {
    // العثور على المستوى والموضع
    let levelIndex = 0;
    let positionInLevel = 0;
    
    for (let i = 0; i < levels.length; i++) {
      const levelPosition = levels[i].indexOf(node.id);
      if (levelPosition !== -1) {
        levelIndex = i;
        positionInLevel = levelPosition;
        break;
      }
    }

    const level = levels[levelIndex];
    const levelWidth = level.length * nodeWidth + (level.length - 1) * horizontalSpacing;
    const startX = Math.max(50, (800 - levelWidth) / 2);
    
    const x = startX + (positionInLevel * (nodeWidth + horizontalSpacing));
    const y = 100 + (levelIndex * (nodeHeight + verticalSpacing));

    return {
      ...node,
      position: { x, y },
      style: {
        ...node.style,
        width: nodeWidth,
        height: nodeHeight,
      },
    };
  });

  return layoutedNodes;
};

export default function StructureFlow({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  type = 'frontend',
  height = '70vh',
  readOnly = false,
}: StructureFlowProps) {
  const rfRef = useRef<ReactFlowInstance | null>(null);

  // إعادة تنظيم العقد تلقائياً
  const organizedNodes = useMemo(() => {
    return organizeNodesLayout(nodes, edges);
  }, [nodes, edges]);

  // fit view عند تغيير العقد
  useEffect(() => {
    if (rfRef.current && organizedNodes.length > 0) {
      const timeoutId = setTimeout(() => {
        rfRef.current?.fitView({ 
          padding: 0.1,
          includeHiddenNodes: false,
          maxZoom: 1.2,
          minZoom: 0.5
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [organizedNodes.length]);

  // تعديل الحواف لتبدو أفضل
  const enhancedEdges = useMemo((): Edge[] => {
    return edges.map((edge): Edge => ({
      ...edge,
      type: 'smoothstep',
      animated: false,
      style: {
        strokeWidth: 3,
        stroke: '#6B7280',
        ...edge.style,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 25,
        height: 25,
        color: '#6B7280',
      },
    }));
  }, [edges]);

  const handleConnect = (params: Connection) => {
    onConnect(params);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        '& .react-flow__node': {
          fontSize: '14px',
          fontWeight: 600,
          border: '2px solid',
          borderColor: 'transparent',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.2s ease',
          cursor: readOnly ? 'default' : 'grab',
          '&:hover': {
            transform: readOnly ? 'none' : 'scale(1.02)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          },
          '&.selected': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
          },
        },
        '& .react-flow__edge': {
          '&.selected .react-flow__edge-path': {
            stroke: 'primary.main',
            strokeWidth: 4,
          },
        },
        '& .react-flow__controls': {
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          '& button': {
            backgroundColor: 'transparent',
            border: 'none',
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          },
        },
      }}
    >
      <ReactFlow
        nodes={organizedNodes}
        edges={enhancedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onInit={(inst: ReactFlowInstance) => {
          rfRef.current = inst;
          setTimeout(() => {
            inst.fitView({ 
              padding: 0.1,
              maxZoom: 1.2,
              minZoom: 0.5
            });
          }, 50);
        }}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ 
          padding: 0.1,
          maxZoom: 1.2,
          minZoom: 0.5
        }}
        minZoom={0.3}
        maxZoom={2}
        panOnDrag={!readOnly}
        zoomOnScroll={!readOnly}
        zoomOnPinch={!readOnly}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { 
            strokeWidth: 3, 
            stroke: '#6B7280',
            opacity: 0.8 
          },
        }}
        deleteKeyCode={readOnly ? null : 'Delete'}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={2}
          color="#E5E7EB"
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
          showFitView
          showZoom
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      </ReactFlow>
    </Box>
  );
}