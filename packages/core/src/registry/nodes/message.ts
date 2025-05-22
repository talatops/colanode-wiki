import { z } from 'zod';

import { NodeModel } from './core';

import { blockSchema } from '../block';
import { extractBlockTexts } from '../../lib/texts';
import { extractNodeRole } from '../../lib/nodes';
import { hasNodeRole } from '../../lib/permissions';
import { extractBlocksMentions } from '../../lib/mentions';

export const messageAttributesSchema = z.object({
  type: z.literal('message'),
  subtype: z.enum(['standard', 'question', 'answer']),
  name: z.string().optional(),
  parentId: z.string(),
  referenceId: z.string().nullable().optional(),
  content: z.record(blockSchema).optional().nullable(),
  selectedContextNodeIds: z.array(z.string()).optional().nullable(),
});

export type MessageAttributes = z.infer<typeof messageAttributesSchema>;

export const messageModel: NodeModel = {
  type: 'message',
  attributesSchema: messageAttributesSchema,
  canCreate: (context) => {
    if (context.tree.length === 0) {
      return false;
    }

    const role = extractNodeRole(context.tree, context.user.id);
    if (!role) {
      return false;
    }

    return hasNodeRole(role, 'collaborator');
  },
  canUpdateAttributes: (context) => {
    if (context.tree.length === 0) {
      return false;
    }

    const role = extractNodeRole(context.tree, context.user.id);
    if (!role) {
      return false;
    }

    return context.node.createdBy === context.user.id;
  },
  canUpdateDocument: () => {
    return false;
  },
  canDelete: (context) => {
    if (context.tree.length === 0) {
      return false;
    }

    const role = extractNodeRole(context.tree, context.user.id);
    if (!role) {
      return false;
    }

    return (
      context.node.createdBy === context.user.id || hasNodeRole(role, 'admin')
    );
  },
  canReact: (context) => {
    if (context.tree.length === 0) {
      return false;
    }

    const role = extractNodeRole(context.tree, context.user.id);
    if (!role) {
      return false;
    }

    return hasNodeRole(role, 'viewer');
  },
  extractText: (id, attributes) => {
    if (attributes.type !== 'message') {
      throw new Error('Invalid node type');
    }

    const attributesText = extractBlockTexts(id, attributes.content);

    return {
      name: attributes.name,
      attributes: attributesText,
    };
  },
  extractMentions: (id, attributes) => {
    if (attributes.type !== 'message') {
      throw new Error('Invalid node type');
    }

    return extractBlocksMentions(id, attributes.content);
  },
};
