import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getAgentByName } from '@/debate/ConversationOrchestrator';
import { Brain, MessageSquare } from 'lucide-react';

interface Message {
  agent: string;
  content: string;
  turn: number;
  timestamp: string;
  sections?: Record<string, string>;
  [key: string]: any;
}

interface DebateFlowGraphProps {
  conversation: Message[];
}

const DebateFlowGraph = ({ conversation }: DebateFlowGraphProps) => {
  const initialNodes: Node[] = useMemo(() => {
    return conversation.map((message, index) => {
      const agent = getAgentByName(message.agent);
      const hasReasoning = message.sections?.["Reasoning"];
      
      // Calculate position in a flowing timeline
      const x = 100 + (index % 2) * 400;
      const y = 100 + Math.floor(index / 2) * 200;
      
      return {
        id: `${message.agent}-${message.turn}`,
        type: 'default',
        position: { x, y },
        data: {
          label: (
            <div className="p-3 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: agent?.color || '#666' }}
                >
                  {message.agent.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{agent?.name || message.agent}</div>
                  <div className="text-xs text-muted-foreground">Turn {message.turn}</div>
                </div>
              </div>
              {hasReasoning && (
                <div className="flex items-center gap-1 text-xs text-primary mt-1">
                  <Brain className="w-3 h-3" />
                  <span>Step-by-step reasoning</span>
                </div>
              )}
              {message.sections && Object.keys(message.sections).length > 1 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{Object.keys(message.sections).length} sections</span>
                </div>
              )}
            </div>
          ),
        },
        style: {
          background: '#ffffff',
          border: `2px solid ${agent?.color || '#666'}`,
          borderRadius: '12px',
          padding: 0,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [conversation]);

  const initialEdges: Edge[] = useMemo(() => {
    return conversation.slice(0, -1).map((message, index) => {
      const nextMessage = conversation[index + 1];
      const currentAgent = getAgentByName(message.agent);
      const nextAgent = getAgentByName(nextMessage.agent);
      
      // Determine edge label based on agent transition
      let label = '';
      if (message.agent === 'Researcher' && nextMessage.agent === 'Critic') {
        label = 'critiques';
      } else if (message.agent === 'Critic' && nextMessage.agent === 'Researcher') {
        label = 'responds';
      } else if (message.agent === 'Critic' && nextMessage.agent === 'Synthesizer') {
        label = 'satisfied → synthesize';
      } else if (message.agent === 'Synthesizer' && nextMessage.agent === 'Validator') {
        label = 'validates';
      }
      
      return {
        id: `e-${message.turn}-${nextMessage.turn}`,
        source: `${message.agent}-${message.turn}`,
        target: `${nextMessage.agent}-${nextMessage.turn}`,
        type: 'smoothstep',
        animated: true,
        label,
        labelStyle: { 
          fill: '#666', 
          fontSize: 10, 
          fontWeight: 500,
        },
        labelBgStyle: { 
          fill: '#ffffff',
          fillOpacity: 0.9,
        },
        style: { 
          stroke: nextAgent?.color || '#666',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: nextAgent?.color || '#666',
          width: 20,
          height: 20,
        },
      };
    });
  }, [conversation]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [conversation, initialNodes, initialEdges, setNodes, setEdges]);

  if (conversation.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center border rounded-lg bg-muted/20">
        <div className="text-center text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No debate data to visualize yet</p>
          <p className="text-sm mt-1">Start an analysis to see the agent conversation flow</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const agent = getAgentByName(node.id.split('-')[0]);
            return agent?.color || '#666';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};

export default DebateFlowGraph;
