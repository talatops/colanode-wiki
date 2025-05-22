import {
  DatabaseAttributes,
  generateId,
  generateNodeIndex,
  IdType,
  DatabaseViewAttributes,
} from '@colanode/core';

import { MutationHandler } from '@/main/lib/types';
import {
  DatabaseCreateMutationInput,
  DatabaseCreateMutationOutput,
} from '@/shared/mutations/databases/database-create';
import { WorkspaceMutationHandlerBase } from '@/main/mutations/workspace-mutation-handler-base';

export class DatabaseCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<DatabaseCreateMutationInput>
{
  async handleMutation(
    input: DatabaseCreateMutationInput
  ): Promise<DatabaseCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const databaseId = generateId(IdType.Database);
    const viewId = generateId(IdType.DatabaseView);
    const fieldId = generateId(IdType.Field);

    const databaseAttributes: DatabaseAttributes = {
      type: 'database',
      name: input.name,
      avatar: input.avatar,
      parentId: input.parentId,
      fields: {
        [fieldId]: {
          id: fieldId,
          type: 'text',
          index: generateNodeIndex(null, null),
          name: 'Comment',
        },
      },
    };

    const viewAttributes: DatabaseViewAttributes = {
      type: 'database_view',
      name: 'Default',
      index: generateNodeIndex(null, null),
      layout: 'table',
      parentId: databaseId,
    };

    await workspace.nodes.createNode({
      id: databaseId,
      attributes: databaseAttributes,
      parentId: input.parentId,
    });

    await workspace.nodes.createNode({
      id: viewId,
      attributes: viewAttributes,
      parentId: databaseId,
    });

    return {
      id: databaseId,
    };
  }
}
