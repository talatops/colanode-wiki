import { generateId, IdType, PageAttributes } from '@colanode/core';

import { MutationHandler } from '@/main/lib/types';
import {
  PageCreateMutationInput,
  PageCreateMutationOutput,
} from '@/shared/mutations/pages/page-create';
import { WorkspaceMutationHandlerBase } from '@/main/mutations/workspace-mutation-handler-base';

export class PageCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<PageCreateMutationInput>
{
  async handleMutation(
    input: PageCreateMutationInput
  ): Promise<PageCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const id = generateId(IdType.Page);
    const attributes: PageAttributes = {
      type: 'page',
      parentId: input.parentId,
      avatar: input.avatar,
      name: input.name,
    };

    await workspace.nodes.createNode({
      id,
      attributes,
      parentId: input.parentId,
    });

    return {
      id: id,
    };
  }
}
