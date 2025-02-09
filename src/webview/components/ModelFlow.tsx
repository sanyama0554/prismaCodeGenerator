import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  NodeTypes,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionLineType,
  Position,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PrismaSchema, PrismaModel } from '../types/schema';
import { ModelCard } from './ModelCard';

interface ModelFlowProps {
  schema: PrismaSchema;
  selectedModels: string[];
  onModelSelect?: (modelName: string) => void;
}

// カスタムノードタイプとしてModelCardを使用
const ModelNode = ({ data }: { data: { model: PrismaModel; isSelected: boolean; onSelect?: (name: string) => void } }) => {
  return (
    <div style={{ 
      padding: '10px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      position: 'relative',
    }}>
      {/* エッジを受け取るハンドル */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '10px', height: '10px' }}
      />

      <ModelCard
        model={data.model}
        isSelected={data.isSelected}
        onSelect={data.onSelect}
      />

      {/* エッジを出すハンドル */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: '10px', height: '10px' }}
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  modelNode: ModelNode,
};

export function ModelFlow({ schema, selectedModels, onModelSelect }: ModelFlowProps) {
  console.log('ModelFlow: Received schema', schema);

  // モデルからノードを生成
  const getNodePosition = (modelName: string) => {
    switch (modelName) {
      case 'User':
        return { x: 0, y: 300 };
      case 'Post':
        return { x: 700, y: 100 };
      case 'Comment':
        return { x: 1400, y: 100 };
      case 'Profile':
        return { x: 700, y: 500 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialNodes: Node[] = schema.models.map(model => ({
    id: model.name,
    type: 'modelNode',
    position: getNodePosition(model.name),
    data: {
      model,
      isSelected: selectedModels.includes(model.name),
      onSelect: onModelSelect,
    },
    style: {
      width: 420,
      height: 'auto',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }));

  // リレーションからエッジを生成
  const initialEdges: Edge[] = schema.models.flatMap(sourceModel => {
    return sourceModel.fields
      .filter(field => {
        const targetModel = schema.models.find(m => m.name === field.type);
        const isModelType = targetModel !== undefined;
        const hasRelation = field.relation !== undefined;
        const isValid = isModelType || hasRelation;
        return isValid;
      })
      .map(field => {
        const isOneToMany = field.isList;
        const isOneToOne = !field.isList && (
          field.isUnique || 
          field.relation?.references.some(ref => {
            const targetModel = schema.models.find(m => m.name === field.type);
            return targetModel?.fields.find(f => f.name === ref)?.isUnique;
          })
        );
        
        const edgeColor = isOneToMany ? '#ff0072' : isOneToOne ? '#00ff72' : '#0072ff';
        
        return {
          id: `${sourceModel.name}-${field.name}-${field.type}`,
          source: sourceModel.name,
          target: field.type,
          animated: true,
          label: `${field.name} (${isOneToMany ? '1:N' : isOneToOne ? '1:1' : 'N:1'})`,
          labelBgPadding: [12, 8],
          labelBgBorderRadius: 6,
          labelBgStyle: { 
            fill: '#ffffff',
            fillOpacity: 0.95,
          },
          labelStyle: {
            fontSize: 14,
            fontWeight: 600,
            fill: edgeColor,
          },
          type: 'smoothstep',
          style: {
            strokeWidth: 3,
            stroke: edgeColor,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 25,
            height: 25,
            color: edgeColor,
          },
        };
      });
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // レイアウトをリセット
  const resetLayout = useCallback(() => {
    const newNodes = nodes.map(node => ({
      ...node,
      position: getNodePosition(node.id),
    }));
    setNodes(newNodes);
  }, [nodes, setNodes]);

  return (
    <div style={{ width: '100%', height: '800px', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ 
          padding: 0.2,
          includeHiddenNodes: true,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 25,
            height: 25,
          },
        }}
        proOptions={{ hideAttribution: true }}
        style={{
          backgroundColor: '#ffffff',
        }}
      >
        <Background gap={16} size={1} />
        <Controls />
        <Panel position="top-right">
          <button
            onClick={resetLayout}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            レイアウトをリセット
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
} 