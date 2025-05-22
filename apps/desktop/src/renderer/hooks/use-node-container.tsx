import { NodeRole, extractNodeRole } from '@colanode/core';

import { useWorkspace } from '@/renderer/contexts/workspace';
import { useQuery } from '@/renderer/hooks/use-query';
import { LocalNode } from '@/shared/types/nodes';

type UseNodeContainerResult<T extends LocalNode> =
  | {
      isPending: true;
      node: null;
    }
  | {
      isPending: false;
      node: null;
    }
  | {
      isPending: false;
      node: T;
      breadcrumb: LocalNode[];
      root: LocalNode;
      role: NodeRole;
    };

export const useNodeContainer = <T extends LocalNode>(
  id: string
): UseNodeContainerResult<T> => {
  const workspace = useWorkspace();

  const { data, isPending } = useQuery({
    type: 'node_tree_get',
    nodeId: id,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (isPending) {
    return { isPending: true, node: null };
  }

  const nodes = data ?? [];
  const node = nodes.find((node) => node.id === id);

  if (!node) {
    return { isPending: false, node: null };
  }

  const root = nodes.find((node) => node.id === node.rootId);

  if (!root) {
    return { isPending: false, node: null };
  }

  const role = extractNodeRole(root, workspace.userId);

  if (!role) {
    return { isPending: false, node: null };
  }

  return {
    isPending: false,
    node: node as T,
    root: root,
    breadcrumb: nodes,
    role,
  };
};
