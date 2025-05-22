import {
  generateId,
  generateNodeIndex,
  IdType,
  DatabaseViewAttributes,
} from '@colanode/core';

import { MutationHandler } from '@/main/lib/types';
import {
  ViewCreateMutationInput,
  ViewCreateMutationOutput,
} from '@/shared/mutations/databases/view-create';
import { WorkspaceMutationHandlerBase } from '@/main/mutations/workspace-mutation-handler-base';
import { mapNode } from '@/main/lib/mappers';

export class ViewCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<ViewCreateMutationInput>
{
  async handleMutation(
    input: ViewCreateMutationInput
  ): Promise<ViewCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const id = generateId(IdType.DatabaseView);
    const otherViews = await workspace.database
      .selectFrom('nodes')
      .selectAll()
      .where('parent_id', '=', input.databaseId)
      .where('type', '=', 'database_view')
      .execute();

    let maxIndex: string | null = null;
    for (const otherView of otherViews) {
      const view = mapNode(otherView);
      if (view.attributes.type !== 'database_view') {
        continue;
      }

      const index = view.attributes.index;
      if (maxIndex === null || index > maxIndex) {
        maxIndex = index;
      }
    }

    const attributes: DatabaseViewAttributes = {
      type: 'database_view',
      name: input.name,
      index: generateNodeIndex(maxIndex, null),
      layout: input.viewType,
      parentId: input.databaseId,
      groupBy: input.groupBy,
    };

    await workspace.nodes.createNode({
      id: id,
      attributes: attributes,
      parentId: input.databaseId,
    });

    return {
      id: id,
    };
  }
}
