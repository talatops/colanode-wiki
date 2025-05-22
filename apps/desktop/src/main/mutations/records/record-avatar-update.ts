import { RecordAttributes } from '@colanode/core';

import { MutationHandler } from '@/main/lib/types';
import { MutationError, MutationErrorCode } from '@/shared/mutations';
import {
  RecordAvatarUpdateMutationInput,
  RecordAvatarUpdateMutationOutput,
} from '@/shared/mutations/records/record-avatar-update';
import { WorkspaceMutationHandlerBase } from '@/main/mutations/workspace-mutation-handler-base';

export class RecordAvatarUpdateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<RecordAvatarUpdateMutationInput>
{
  async handleMutation(
    input: RecordAvatarUpdateMutationInput
  ): Promise<RecordAvatarUpdateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const result = await workspace.nodes.updateNode<RecordAttributes>(
      input.recordId,
      (attributes) => {
        attributes.avatar = input.avatar;
        return attributes;
      }
    );

    if (result === 'unauthorized') {
      throw new MutationError(
        MutationErrorCode.RecordUpdateForbidden,
        "You don't have permission to update this record."
      );
    }

    return {
      success: true,
    };
  }
}
