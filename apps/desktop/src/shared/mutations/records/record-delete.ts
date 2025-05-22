export type RecordDeleteMutationInput = {
  type: 'record_delete';
  accountId: string;
  workspaceId: string;
  recordId: string;
};

export type RecordDeleteMutationOutput = {
  success: boolean;
};

declare module '@/shared/mutations' {
  interface MutationMap {
    record_delete: {
      input: RecordDeleteMutationInput;
      output: RecordDeleteMutationOutput;
    };
  }
}
