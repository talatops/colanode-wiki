import { set } from 'lodash-es';

import { MutationHandler } from '@/main/lib/types';
import {
  NodeCollaboratorCreateMutationInput,
  NodeCollaboratorCreateMutationOutput,
} from '@/shared/mutations/nodes/node-collaborator-create';
import { MutationError, MutationErrorCode } from '@/shared/mutations';
import { WorkspaceMutationHandlerBase } from '@/main/mutations/workspace-mutation-handler-base';

export class NodeCollaboratorCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<NodeCollaboratorCreateMutationInput>
{
  async handleMutation(
    input: NodeCollaboratorCreateMutationInput
  ): Promise<NodeCollaboratorCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const result = await workspace.nodes.updateNode(
      input.nodeId,
      (attributes) => {
        for (const collaboratorId of input.collaboratorIds) {
          set(attributes, `collaborators.${collaboratorId}`, input.role);
        }
        return attributes;
      }
    );

    if (result === 'unauthorized') {
      throw new MutationError(
        MutationErrorCode.NodeCollaboratorCreateForbidden,
        "You don't have permission to add collaborators to this node."
      );
    }

    if (result !== 'success') {
      throw new MutationError(
        MutationErrorCode.NodeCollaboratorCreateFailed,
        'Something went wrong while adding collaborators to the node.'
      );
    }

    return {
      success: true,
    };
  }
}
