import {
  SynchronizerOutputMessage,
  SyncUserData,
  SyncUsersInput,
} from '@colanode/core';

import { BaseSynchronizer } from '@/synchronizers/base';
import { Event } from '@/types/events';
import { database } from '@/data/database';
import { SelectUser } from '@/data/schema';

export class UserSynchronizer extends BaseSynchronizer<SyncUsersInput> {
  public async fetchData(): Promise<SynchronizerOutputMessage<SyncUsersInput> | null> {
    const users = await this.fetchUsers();
    if (users.length === 0) {
      return null;
    }

    return this.buildMessage(users);
  }

  public async fetchDataFromEvent(
    event: Event
  ): Promise<SynchronizerOutputMessage<SyncUsersInput> | null> {
    if (!this.shouldFetch(event)) {
      return null;
    }

    const users = await this.fetchUsers();
    if (users.length === 0) {
      return null;
    }

    return this.buildMessage(users);
  }

  private async fetchUsers() {
    if (this.status === 'fetching') {
      return [];
    }

    this.status = 'fetching';
    const users = await database
      .selectFrom('users')
      .selectAll()
      .where('workspace_id', '=', this.user.workspaceId)
      .where('revision', '>', this.cursor)
      .orderBy('revision', 'asc')
      .limit(50)
      .execute();

    this.status = 'pending';
    return users;
  }

  private buildMessage(
    unsyncedUsers: SelectUser[]
  ): SynchronizerOutputMessage<SyncUsersInput> {
    const items: SyncUserData[] = unsyncedUsers.map((user) => ({
      id: user.id,
      workspaceId: user.workspace_id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      customName: user.custom_name,
      customAvatar: user.custom_avatar,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at?.toISOString() ?? null,
      revision: user.revision.toString(),
      status: user.status,
    }));

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
      event.type === 'user_created' &&
      event.workspaceId === this.user.workspaceId
    ) {
      return true;
    }

    if (
      event.type === 'user_updated' &&
      event.workspaceId === this.user.workspaceId
    ) {
      return true;
    }

    return false;
  }
}
