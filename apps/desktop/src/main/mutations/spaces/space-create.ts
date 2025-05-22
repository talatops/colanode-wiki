import {
  ChannelAttributes,
  generateId,
  IdType,
  PageAttributes,
  SpaceAttributes,
} from '@colanode/core';

import { MutationHandler } from '@/main/lib/types';
import {
  SpaceCreateMutationInput,
  SpaceCreateMutationOutput,
} from '@/shared/mutations/spaces/space-create';
import { MutationError, MutationErrorCode } from '@/shared/mutations';
import { WorkspaceMutationHandlerBase } from '@/main/mutations/workspace-mutation-handler-base';

export class SpaceCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<SpaceCreateMutationInput>
{
  async handleMutation(
    input: SpaceCreateMutationInput
  ): Promise<SpaceCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    if (!workspace) {
      throw new MutationError(
        MutationErrorCode.WorkspaceNotFound,
        'Workspace was not found or has been deleted.'
      );
    }

    if (workspace.role === 'guest' || workspace.role === 'none') {
      throw new MutationError(
        MutationErrorCode.SpaceCreateForbidden,
        "You don't have permission to create spaces in this workspace."
      );
    }

    const spaceId = generateId(IdType.Space);
    const spaceAttributes: SpaceAttributes = {
      type: 'space',
      name: input.name,
      visibility: 'private',
      collaborators: {
        [workspace.userId]: 'admin',
      },
      description: input.description,
    };

    await workspace.nodes.createNode({
      id: spaceId,
      attributes: spaceAttributes,
      parentId: null,
    });

    const pageId = generateId(IdType.Page);
    const pageAttributes: PageAttributes = {
      type: 'page',
      name: 'Home',
      parentId: spaceId,
    };

    await workspace.nodes.createNode({
      id: pageId,
      attributes: pageAttributes,
      parentId: spaceId,
    });

    const channelId = generateId(IdType.Channel);
    const channelAttributes: ChannelAttributes = {
      type: 'channel',
      name: 'Discussions',
      parentId: spaceId,
    };

    await workspace.nodes.createNode({
      id: channelId,
      attributes: channelAttributes,
      parentId: spaceId,
    });

    return {
      id: spaceId,
    };
  }
}
