import { FieldType } from '@colanode/core';

export type FieldCreateMutationInput = {
  type: 'field_create';
  accountId: string;
  workspaceId: string;
  databaseId: string;
  name: string;
  fieldType: FieldType;
  relationDatabaseId?: string | null;
};

export type FieldCreateMutationOutput = {
  id: string;
};

declare module '@/shared/mutations' {
  interface MutationMap {
    field_create: {
      input: FieldCreateMutationInput;
      output: FieldCreateMutationOutput;
    };
  }
}
