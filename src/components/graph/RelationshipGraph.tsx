"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from "d3-force";
import type { GraphNode, GraphEdge } from "@/lib/graph";

const TYPE_COLOR: Record<string, string> = {
  PERSON: "#b8964e",
  VEHICLE: "#5f7f94",
  ORGANIZATION: "#a1493f",
  LOCATION: "#5f9463",
};

const ROUTE_PREFIX: Record<string, string> = {
  PERSON: "/annuaire",
  VEHICLE: "/vehicules",
  ORGANIZATION: "/organisations",
  LOCATION: "/lieux",
};

interface SimNode extends GraphNode {
  x?: number;
  y?: number;
}

const WIDTH = 900;
const HEIGHT = 560;

export function RelationshipGraph({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const router = useRouter();

  const positions = useMemo(() => {
    if (nodes.length === 0) return {} as Record<string, { x: number; y: number }>;

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const simLinks = edges.map((e) => ({ ...e }));

    const simulation = forceSimulation(simNodes)
      .force(
        "link",
        forceLink(simLinks)
          .id((d) => (d as SimNode).id)
          .distance(130)
          .strength(0.35),
      )
      .force("charge", forceManyBody().strength(-220))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collide", forceCollide(42))
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();

    const next: Record<string, { x: number; y: number }> = {};
    for (const node of simNodes) {
      next[node.id] = { x: node.x ?? WIDTH / 2, y: node.y ?? HEIGHT / 2 };
    }
    return next;
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
        Aucune donnee a representer pour le moment. Ajoutez des fiches et des relations.
      </p>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-[560px] w-full rounded-lg border border-border bg-panel"
    >
      <g>
        {edges.map((edge, i) => {
          const from = positions[edge.source];
          const to = positions[edge.target];
          if (!from || !to) return null;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={`${edge.source}-${edge.target}-${i}`}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#27272d" strokeWidth={1} />
              <text x={midX} y={midY} fontSize={9} fill="#9b988f" textAnchor="middle">
                {edge.label}
              </text>
            </g>
          );
        })}
      </g>
      <g>
        {nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;
          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="cursor-pointer"
              onClick={() => {
                const [type, id] = node.id.split(":");
                const prefix = ROUTE_PREFIX[type];
                if (prefix) router.push(`${prefix}/${id}`);
              }}
            >
              <circle r={9} fill={TYPE_COLOR[node.type] ?? "#6b6b70"} />
              <text x={13} y={4} fontSize={11} fill="#e8e6df">
                {node.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
