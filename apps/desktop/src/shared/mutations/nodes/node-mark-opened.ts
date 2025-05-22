export type NodeMarkOpenedMutationInput = {
  type: 'node_mark_opened';
  accountId: string;
  workspaceId: string;
  nodeId: string;
};

export type NodeMarkOpenedMutationOutput = {
  success: boolean;
};

declare module '@/shared/mutations' {
  interface MutationMap {
    node_mark_opened: {
      input: NodeMarkOpenedMutationInput;
      output: NodeMarkOpenedMutationOutput;
    };
  }
}
