import {
  SynchronizerOutputMessage,
  SyncNodeReactionsInput,
  SyncNodeReactionData,
} from '@colanode/core';

import { BaseSynchronizer } from '@/synchronizers/base';
import { Event } from '@/types/events';
import { database } from '@/data/database';
import { SelectNodeReaction } from '@/data/schema';

export class NodeReactionSynchronizer extends BaseSynchronizer<SyncNodeReactionsInput> {
  public async fetchData(): Promise<SynchronizerOutputMessage<SyncNodeReactionsInput> | null> {
    const nodeReactions = await this.fetchNodeReactions();
    if (nodeReactions.length === 0) {
      return null;
    }

    return this.buildMessage(nodeReactions);
  }

  public async fetchDataFromEvent(
    event: Event
  ): Promise<SynchronizerOutputMessage<SyncNodeReactionsInput> | null> {
    if (!this.shouldFetch(event)) {
      return null;
    }

    const nodeReactions = await this.fetchNodeReactions();
    if (nodeReactions.length === 0) {
      return null;
    }

    return this.buildMessage(nodeReactions);
  }

  private async fetchNodeReactions() {
    if (this.status === 'fetching') {
      return [];
    }

    this.status = 'fetching';
    const nodeReactions = await database
      .selectFrom('node_reactions')
      .selectAll()
      .where('root_id', '=', this.input.rootId)
      .where('revision', '>', this.cursor)
      .orderBy('revision', 'asc')
      .limit(20)
      .execute();

    this.status = 'pending';
    return nodeReactions;
  }

  private buildMessage(
    unsyncedNodeReactions: SelectNodeReaction[]
  ): SynchronizerOutputMessage<SyncNodeReactionsInput> {
    const items: SyncNodeReactionData[] = unsyncedNodeReactions.map(
      (nodeReaction) => ({
        nodeId: nodeReaction.node_id,
        collaboratorId: nodeReaction.collaborator_id,
        reaction: nodeReaction.reaction,
        rootId: nodeReaction.root_id,
        workspaceId: nodeReaction.workspace_id,
        createdAt: nodeReaction.created_at.toISOString(),
        deletedAt: nodeReaction.deleted_at?.toISOString() ?? null,
        revision: nodeReaction.revision.toString(),
      })
    );

    return {
      type: 'synchronizer_output',
      userId: this.user.userId,
      id: this.id,
      items: items.map((item) => ({
        cursor: item.revision,
        data: item,
      })),
    };
  }

  private shouldFetch(event: Event) {
    if (
      event.type === 'node_reaction_created' &&
      event.rootId === this.input.rootId
    ) {
      return true;
    }

    if (
      event.type === 'node_reaction_deleted' &&
      event.rootId === this.input.rootId
    ) {
      return true;
    }

    return false;
  }
}
