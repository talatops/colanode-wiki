import { WorkspaceService } from '@/main/services/workspaces/workspace-service';
import { WorkspaceRadarData } from '@/shared/types/radars';
import {
  Event,
  NodeCounterUpdatedEvent,
  NodeCounterDeletedEvent,
} from '@/shared/types/events';
import { eventBus } from '@/shared/lib/event-bus';
import { NodeCounterType } from '@/shared/types/nodes';

export class RadarService {
  private readonly workspace: WorkspaceService;
  private readonly counters: Map<string, Map<NodeCounterType, number>>;
  private readonly eventSubscriptionId: string;

  constructor(workspace: WorkspaceService) {
    this.workspace = workspace;
    this.counters = new Map();
    this.eventSubscriptionId = eventBus.subscribe(this.handleEvent.bind(this));
  }

  public getData(): WorkspaceRadarData {
    const data: WorkspaceRadarData = {
      accountId: this.workspace.accountId,
      userId: this.workspace.userId,
      workspaceId: this.workspace.id,
      state: {
        hasUnread: false,
        unreadCount: 0,
      },
      nodeStates: {},
    };

    for (const [nodeId, counters] of this.counters.entries()) {
      let hasUnread = false;
      let unreadCount = 0;

      for (const [type, count] of counters.entries()) {
        if (count === 0) {
          continue;
        }

        if (type === 'unread_messages') {
          hasUnread = true;
        } else if (type === 'unread_important_messages') {
          hasUnread = true;
          unreadCount += count;
        } else if (type === 'unread_mentions') {
          hasUnread = true;
          unreadCount += count;
        }
      }

      data.nodeStates[nodeId] = {
        hasUnread,
        unreadCount,
      };

      data.state.hasUnread = data.state.hasUnread || hasUnread;
      data.state.unreadCount += unreadCount;
    }

    return data;
  }

  public async init(): Promise<void> {
    const nodeCounters = await this.workspace.database
      .selectFrom('node_counters')
      .selectAll()
      .execute();

    for (const nodeCounter of nodeCounters) {
      if (!this.counters.has(nodeCounter.node_id)) {
        this.counters.set(nodeCounter.node_id, new Map());
      }

      const counter = this.counters.get(nodeCounter.node_id);
      if (!counter) {
        continue;
      }

      counter.set(nodeCounter.type, nodeCounter.count);
    }
  }

  public destroy(): void {
    eventBus.unsubscribe(this.eventSubscriptionId);
  }

  private async handleEvent(event: Event) {
    if (event.type === 'node_counter_updated') {
      this.handleNodeCounterUpdated(event);
    } else if (event.type === 'node_counter_deleted') {
      this.handleNodeCounterDeleted(event);
    }
  }

  private handleNodeCounterUpdated(event: NodeCounterUpdatedEvent) {
    if (
      event.accountId !== this.workspace.accountId ||
      event.workspaceId !== this.workspace.id
    ) {
      return;
    }

    if (!this.counters.has(event.counter.nodeId)) {
      this.counters.set(event.counter.nodeId, new Map());
    }

    const nodeCounters = this.counters.get(event.counter.nodeId);
    if (!nodeCounters) {
      return;
    }

    const count = nodeCounters.get(event.counter.type);
    if (count === event.counter.count) {
      return;
    }

    nodeCounters.set(event.counter.type, event.counter.count);
    eventBus.publish({
      type: 'radar_data_updated',
    });
  }

  private handleNodeCounterDeleted(event: NodeCounterDeletedEvent) {
    if (
      event.accountId !== this.workspace.accountId ||
      event.workspaceId !== this.workspace.id
    ) {
      return;
    }

    const nodeCounter = this.counters.get(event.counter.nodeId);
    if (!nodeCounter) {
      return;
    }

    if (!nodeCounter.has(event.counter.type)) {
      return;
    }

    nodeCounter.delete(event.counter.type);
    eventBus.publish({
      type: 'radar_data_updated',
    });
  }
}
