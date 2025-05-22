import {
  SynchronizerOutputMessage,
  SyncCollaborationsInput,
  SyncCollaborationData,
} from '@colanode/core';

import { BaseSynchronizer } from '@/synchronizers/base';
import { Event } from '@/types/events';
import { database } from '@/data/database';
import { SelectCollaboration } from '@/data/schema';

export class CollaborationSynchronizer extends BaseSynchronizer<SyncCollaborationsInput> {
  public async fetchData(): Promise<SynchronizerOutputMessage<SyncCollaborationsInput> | null> {
    const collaborations = await this.fetchCollaborations();
    if (collaborations.length === 0) {
      return null;
    }

    return this.buildMessage(collaborations);
  }

  public async fetchDataFromEvent(
    event: Event
  ): Promise<SynchronizerOutputMessage<SyncCollaborationsInput> | null> {
    if (!this.shouldFetch(event)) {
      return null;
    }

    const collaborations = await this.fetchCollaborations();
    if (collaborations.length === 0) {
      return null;
    }

    return this.buildMessage(collaborations);
  }

  private async fetchCollaborations() {
    if (this.status === 'fetching') {
      return [];
    }

    this.status = 'fetching';
    const collaborations = await database
      .selectFrom('collaborations')
      .selectAll()
      .where('collaborator_id', '=', this.user.userId)
      .where('revision', '>', this.cursor)
      .orderBy('revision', 'asc')
      .limit(50)
      .execute();

    this.status = 'pending';
    return collaborations;
  }

  private buildMessage(
    unsyncedCollaborations: SelectCollaboration[]
  ): SynchronizerOutputMessage<SyncCollaborationsInput> {
    const items: SyncCollaborationData[] = unsyncedCollaborations.map(
      (collaboration) => ({
        nodeId: collaboration.node_id,
        workspaceId: collaboration.workspace_id,
        collaboratorId: collaboration.collaborator_id,
        role: collaboration.role,
        createdBy: collaboration.created_by,
        updatedBy: collaboration.updated_by,
        createdAt: collaboration.created_at.toISOString(),
        updatedAt: collaboration.updated_at?.toISOString() ?? null,
        deletedAt: collaboration.deleted_at?.toISOString() ?? null,
        deletedBy: collaboration.deleted_by ?? null,
        revision: collaboration.revision.toString(),
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
      event.type === 'collaboration_created' &&
      event.workspaceId === this.user.workspaceId &&
      event.collaboratorId === this.user.userId
    ) {
      return true;
    }

    if (
      event.type === 'collaboration_updated' &&
      event.workspaceId === this.user.workspaceId &&
      event.collaboratorId === this.user.userId
    ) {
      return true;
    }

    return false;
  }
}
