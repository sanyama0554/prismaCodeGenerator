import React, { useCallback, useState, useRef } from 'react';
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
  useReactFlow,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PrismaSchema, PrismaModel } from '../types/schema';
import { ModelCard } from './ModelCard';
import { Paper, Text, Stack, Group, ActionIcon, Tooltip, useMantineTheme, Button, Slider, Divider } from '@mantine/core';
import { 
  IconZoomIn, 
  IconZoomOut, 
  IconArrowsMaximize, 
  IconRefresh,
  IconLayoutGrid,
  IconLayoutDistributeHorizontal,
  IconLayoutDistributeVertical,
  IconArrowsShuffle,
} from '@tabler/icons-react';

interface ModelFlowProps {
  schema: PrismaSchema;
  selectedModels: string[];
  onModelSelect?: (modelName: string) => void;
}

// カスタムノードタイプとしてModelCardを使用
const ModelNode = ({ data }: { data: { model: PrismaModel; isSelected: boolean; onSelect?: (name: string) => void } }) => {
  const theme = useMantineTheme();
  return (
    <div style={{ 
      padding: theme.spacing.xs,
      background: 'white',
      borderRadius: theme.radius.md,
      position: 'relative',
      transition: theme.other.transition.default,
      boxShadow: theme.shadows.sm,
    }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          background: theme.colors.gray[3],
          width: '12px', 
          height: '12px',
          border: `2px solid ${theme.colors.gray[0]}`,
          transition: theme.other.transition.default,
        }}
      />

      <ModelCard
        model={data.model}
        isSelected={data.isSelected}
        onSelect={data.onSelect}
      />

      <Handle
        type="source"
        position={Position.Right}
        style={{ 
          background: theme.colors.gray[3],
          width: '12px', 
          height: '12px',
          border: `2px solid ${theme.colors.gray[0]}`,
          transition: theme.other.transition.default,
        }}
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  modelNode: ModelNode,
};

// コントロールパネルコンポーネント
const ControlPanel = ({ 
  onZoomIn, 
  onZoomOut, 
  onFitView, 
  onResetLayout,
  onAutoLayout,
  onHorizontalLayout,
  onVerticalLayout,
  zoomLevel,
}: { 
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetLayout: () => void;
  onAutoLayout: () => void;
  onHorizontalLayout: () => void;
  onVerticalLayout: () => void;
  zoomLevel: number;
}) => {
  const theme = useMantineTheme();

  const handleZoomChange = (value: number) => {
    const zoom = value / 100;
    const flow = document.querySelector<HTMLElement>('.react-flow__viewport');
    if (flow) {
      flow.style.transform = `scale(${zoom})`;
    }
  };

  return (
    <Paper 
      shadow="sm" 
      p="md" 
      withBorder 
      style={{
        backgroundColor: 'white',
        borderColor: theme.colors.gray[3],
        transition: theme.other.transition.default,
      }}
    >
      <Stack gap="md">
        <Group gap="xs">
          <Tooltip label="ズームイン">
            <ActionIcon variant="light" onClick={onZoomIn}>
              <IconZoomIn size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="ズームアウト">
            <ActionIcon variant="light" onClick={onZoomOut}>
              <IconZoomOut size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="全体を表示">
            <ActionIcon variant="light" onClick={onFitView}>
              <IconArrowsMaximize size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="レイアウトをリセット">
            <ActionIcon variant="light" onClick={onResetLayout}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Slider
          label="ズームレベル"
          value={zoomLevel * 100}
          min={10}
          max={150}
          step={1}
          onChange={handleZoomChange}
          styles={{
            root: { width: '200px' },
            track: { transition: theme.other.transition.default },
            thumb: { transition: theme.other.transition.default },
          }}
        />

        <Divider />

        <Stack gap="xs">
          <Text size="sm" fw={500}>レイアウト</Text>
          <Group gap="xs">
            <Button
              variant="light"
              size="xs"
              leftSection={<IconArrowsShuffle size={16} />}
              onClick={onAutoLayout}
              styles={{
                root: {
                  transition: theme.other.transition.default,
                }
              }}
            >
              自動配置
            </Button>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconLayoutDistributeHorizontal size={16} />}
              onClick={onHorizontalLayout}
              styles={{
                root: {
                  transition: theme.other.transition.default,
                }
              }}
            >
              水平配置
            </Button>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconLayoutDistributeVertical size={16} />}
              onClick={onVerticalLayout}
              styles={{
                root: {
                  transition: theme.other.transition.default,
                }
              }}
            >
              垂直配置
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
};

// リレーションの種類を表示するコンポーネント
const RelationshipLegend = () => {
  const theme = useMantineTheme();
  
  return (
    <Paper 
      shadow="sm" 
      p="md" 
      withBorder 
      style={{
        backgroundColor: 'white',
        borderColor: theme.colors.gray[3],
        transition: theme.other.transition.default,
      }}
    >
      <Stack gap="xs">
        <Text fw={500} size="sm">リレーションの種類</Text>
        <Stack gap="xs">
          <Group gap="xs" align="center">
            <div style={{ 
              width: '2rem', 
              height: '2px', 
              backgroundColor: theme.colors.pink[6],
              transition: theme.other.transition.default,
            }} />
            <Text size="sm">1:N</Text>
          </Group>
          <Group gap="xs" align="center">
            <div style={{ 
              width: '2rem', 
              height: '2px', 
              backgroundColor: theme.colors.green[6],
              transition: theme.other.transition.default,
            }} />
            <Text size="sm">1:1</Text>
          </Group>
          <Group gap="xs" align="center">
            <div style={{ 
              width: '2rem', 
              height: '2px', 
              backgroundColor: theme.colors.blue[6],
              transition: theme.other.transition.default,
            }} />
            <Text size="sm">N:1</Text>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
};

export function ModelFlow({ schema, selectedModels, onModelSelect }: ModelFlowProps) {
  const theme = useMantineTheme();
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // モデルからノードを生成
  const getNodePosition = (modelName: string, layout: 'default' | 'horizontal' | 'vertical' | 'auto' = 'default') => {
    const index = schema.models.findIndex(m => m.name === modelName);
    const spacing = 300;
    
    switch (layout) {
      case 'horizontal':
        return { x: index * spacing, y: 0 };
      case 'vertical':
        return { x: 0, y: index * spacing };
      case 'auto':
        const angle = (2 * Math.PI * index) / schema.models.length;
        const radius = spacing * 2;
        return {
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle)
        };
      default:
        return { x: 0, y: index * spacing };
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
        
        const edgeColor = isOneToMany ? theme.colors.pink[6] : 
                         isOneToOne ? theme.colors.green[6] : 
                         theme.colors.blue[6];
        
        return {
          id: `${sourceModel.name}-${field.name}-${field.type}`,
          source: sourceModel.name,
          target: field.type,
          animated: true,
          label: `${field.name} (${isOneToMany ? '1:N' : isOneToOne ? '1:1' : 'N:1'})`,
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { 
            fill: 'white',
            fillOpacity: 0.95,
            stroke: theme.colors.gray[3],
            strokeWidth: 1,
          },
          labelStyle: {
            fontSize: 12,
            fontWeight: 500,
            fill: edgeColor,
          },
          type: 'smoothstep',
          style: {
            strokeWidth: 2,
            stroke: edgeColor,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: edgeColor,
          },
        };
      });
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView, zoomIn: flowZoomIn, zoomOut: flowZoomOut } = useReactFlow();

  // レイアウトをリセット
  const resetLayout = useCallback(() => {
    const newNodes = nodes.map(node => ({
      ...node,
      position: getNodePosition(node.id),
    }));
    setNodes(newNodes);
    setTimeout(() => fitView(), 50);
  }, [nodes, setNodes, fitView]);

  // 水平レイアウト
  const horizontalLayout = useCallback(() => {
    const newNodes = nodes.map(node => ({
      ...node,
      position: getNodePosition(node.id, 'horizontal'),
    }));
    setNodes(newNodes);
    setTimeout(() => fitView(), 50);
  }, [nodes, setNodes, fitView]);

  // 垂直レイアウト
  const verticalLayout = useCallback(() => {
    const newNodes = nodes.map(node => ({
      ...node,
      position: getNodePosition(node.id, 'vertical'),
    }));
    setNodes(newNodes);
    setTimeout(() => fitView(), 50);
  }, [nodes, setNodes, fitView]);

  // 自動レイアウト
  const autoLayout = useCallback(() => {
    const newNodes = nodes.map(node => ({
      ...node,
      position: getNodePosition(node.id, 'auto'),
    }));
    setNodes(newNodes);
    setTimeout(() => fitView(), 50);
  }, [nodes, setNodes, fitView]);

  // ズーム操作
  const handleZoomIn = useCallback(() => {
    flowZoomIn();
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  }, [flowZoomIn]);

  const handleZoomOut = useCallback(() => {
    flowZoomOut();
    setZoomLevel(prev => Math.max(prev - 0.1, 0.1));
  }, [flowZoomOut]);

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
          style: { strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        }}
        onInit={setReactFlowInstance}
        proOptions={{ hideAttribution: true }}
        style={{
          backgroundColor: theme.colors.gray[0],
        }}
      >
        <Background gap={16} size={1} color={theme.colors.gray[2]} />
        <Panel position="top-right">
          <RelationshipLegend />
        </Panel>
        <Panel position="bottom-right">
          <ControlPanel
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={() => fitView()}
            onResetLayout={resetLayout}
            onAutoLayout={autoLayout}
            onHorizontalLayout={horizontalLayout}
            onVerticalLayout={verticalLayout}
            zoomLevel={zoomLevel}
          />
        </Panel>
      </ReactFlow>
    </div>
  );
} 