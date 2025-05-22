import { DatabaseViewAttributes } from '@colanode/core';

import { MutationHandler } from '@/main/lib/types';
import {
  ViewNameUpdateMutationInput,
  ViewNameUpdateMutationOutput,
} from '@/shared/mutations/databases/view-name-update';
import { WorkspaceMutationHandlerBase } from '@/main/mutations/workspace-mutation-handler-base';
import { MutationErrorCode, MutationError } from '@/shared/mutations';

export class ViewNameUpdateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<ViewNameUpdateMutationInput>
{
  async handleMutation(
    input: ViewNameUpdateMutationInput
  ): Promise<ViewNameUpdateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const result = await workspace.nodes.updateNode<DatabaseViewAttributes>(
      input.viewId,
      (attributes) => {
        attributes.name = input.name;
        return attributes;
      }
    );

    if (result === 'unauthorized') {
      throw new MutationError(
        MutationErrorCode.ViewUpdateForbidden,
        "You don't have permission to update this view."
      );
    }

    if (result !== 'success') {
      throw new MutationError(
        MutationErrorCode.ViewUpdateFailed,
        'Something went wrong while updating the view.'
      );
    }

    return {
      id: input.viewId,
    };
  }
}
