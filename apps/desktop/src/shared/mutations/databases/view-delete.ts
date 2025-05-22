export type ViewDeleteMutationInput = {
  type: 'view_delete';
  accountId: string;
  workspaceId: string;
  viewId: string;
};

export type ViewDeleteMutationOutput = {
  id: string;
};

declare module '@/shared/mutations' {
  interface MutationMap {
    view_delete: {
      input: ViewDeleteMutationInput;
      output: ViewDeleteMutationOutput;
    };
  }
}
