'use client';

import React from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface StructureFlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<never>;
  onEdgesChange: OnEdgesChange<never>;
  onConnect: (params: Connection) => void;
  type: 'frontend' | 'backend';
  height?: string;
}

export default function StructureFlow({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  type,
  height = '70dvh',
}: StructureFlowProps) {
  console.log(`${type} nodes:`, nodes);

  const getBackgroundColor = () => {
    return type === 'frontend' ? '#000F' : '#000';
  };

  const getGridColor = () => {
    return type === 'frontend' ? '#aaaF' : '#333';
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        maxHeight: height,
        height: '100%',
        mb: 6,
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        '& .react-flow__node': {
          backgroundColor: '#333 !important',
          borderRadius: '8px',
          border: '1px solid #bbb',
          color: '#fff',
        },
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange as any}
        onConnect={onConnect}
        fitView
      >
        <Background bgColor={getBackgroundColor()} color={getGridColor()} />
        <Controls
          style={{
            backgroundColor: 'white',
            color: 'black',
          }}
        />
      </ReactFlow>
    </Box>
  );
}
