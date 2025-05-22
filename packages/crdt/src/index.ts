/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodText } from '@colanode/core';
import { diffChars } from 'diff';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { isEqual } from 'lodash-es';
import * as Y from 'yjs';
import { z, ZodSchema } from 'zod';

export const encodeState = (state: Uint8Array) => {
  return fromUint8Array(state);
};

export const decodeState = (state: string) => {
  return toUint8Array(state);
};

export class YDoc {
  private readonly doc: Y.Doc;

  constructor(state?: Uint8Array | string | Uint8Array[] | string[]) {
    this.doc = new Y.Doc();
    if (state) {
      if (Array.isArray(state)) {
        for (const update of state) {
          Y.applyUpdate(
            this.doc,
            typeof update === 'string' ? toUint8Array(update) : update
          );
        }
      } else {
        Y.applyUpdate(
          this.doc,
          typeof state === 'string' ? toUint8Array(state) : state
        );
      }
    }
  }

  public update(
    schema: ZodSchema,
    object: z.infer<typeof schema>
  ): Uint8Array | null {
    if (!schema.safeParse(object).success) {
      throw new Error('Invalid object', schema.safeParse(object).error);
    }

    const objectSchema = this.extractType(schema, object);
    if (!(objectSchema instanceof z.ZodObject)) {
      throw new Error('Schema must be a ZodObject');
    }

    const updates: Uint8Array[] = [];
    const onUpdateCallback: (update: Uint8Array) => void = (update) => {
      updates.push(update);
    };

    this.doc.on('update', onUpdateCallback);

    const objectMap = this.doc.getMap('object');
    this.doc.transact(() => {
      this.applyObjectChanges(objectSchema, object, objectMap);

      const parseResult = schema.safeParse(objectMap.toJSON());
      if (!parseResult.success) {
        throw new Error('Invalid object', parseResult.error);
      }
    });

    this.doc.off('update', onUpdateCallback);

    if (updates.length === 0) {
      return null;
    }

    if (updates.length > 1) {
      throw new Error('Invalid number of updates');
    }

    const update = updates[0];
    if (!update) {
      throw new Error('No update found');
    }

    return update;
  }

  public getObject<T>(): T {
    const objectMap = this.doc.getMap('object');
    const object = objectMap.toJSON() as T;
    return object;
  }

  public applyUpdate(update: Uint8Array | string) {
    Y.applyUpdate(
      this.doc,
      typeof update === 'string' ? toUint8Array(update) : update
    );
  }

  public getState(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  public getEncodedState(): string {
    return fromUint8Array(this.getState());
  }

  private applyObjectChanges(
    schema: z.ZodObject<any, any, any, any>,
    attributes: any,
    yMap: Y.Map<any>
  ) {
    for (const [key, value] of Object.entries(attributes)) {
      if (value === null || value === undefined) {
        if (yMap.has(key)) {
          yMap.delete(key);
        }

        continue;
      }

      const schemaField = this.extractType(schema.shape[key], value);
      if (schemaField instanceof z.ZodObject) {
        if (typeof value !== 'object') {
          throw new Error('Value must be an object');
        }

        let nestedMap = yMap.get(key);
        if (!(nestedMap instanceof Y.Map)) {
          nestedMap = new Y.Map();
          yMap.set(key, nestedMap);
        }

        this.applyObjectChanges(schemaField, value, nestedMap);
      } else if (schemaField instanceof z.ZodRecord) {
        if (typeof value !== 'object') {
          throw new Error('Value must be an object');
        }

        let nestedMap = yMap.get(key);
        if (!(nestedMap instanceof Y.Map)) {
          nestedMap = new Y.Map();
          yMap.set(key, nestedMap);
        }

        this.applyRecordChanges(schemaField, value, nestedMap);
      } else if (schemaField instanceof z.ZodArray) {
        if (!Array.isArray(value)) {
          throw new Error('Value must be an array');
        }

        let yArray = yMap.get(key);
        if (!(yArray instanceof Y.Array)) {
          yArray = new Y.Array();
          yMap.set(key, yArray);
        }

        this.applyArrayChanges(schemaField, value, yArray);
      } else if (schemaField instanceof ZodText) {
        if (typeof value !== 'string') {
          throw new Error('Value must be a string');
        }

        let yText = yMap.get(key);
        if (!(yText instanceof Y.Text)) {
          yText = new Y.Text();
          yMap.set(key, yText);
        }

        this.applyTextChanges(value, yText);
      } else {
        const currentValue = yMap.get(key);

        if (!isEqual(currentValue, value)) {
          yMap.set(key, value);
        }
      }
    }

    const deletedKeys = Array.from(yMap.keys()).filter(
      (key) => !Object.prototype.hasOwnProperty.call(attributes, key)
    );

    for (const key of deletedKeys) {
      yMap.delete(key);
    }
  }

  private applyArrayChanges(
    schemaField: z.ZodArray<any>,
    value: Array<any>,
    yArray: Y.Array<any>
  ) {
    const itemSchema = this.extractType(schemaField.element, value);
    const length = value.length;

    for (let i = 0; i < length; i++) {
      const item = value[i];

      if (item === null || item === undefined) {
        const currentItem = yArray.get(i);
        if (currentItem !== null && currentItem !== undefined) {
          yArray.delete(i, 1);

          if (yArray.length > i) {
            yArray.insert(i, [null]);
          }
        }

        continue;
      }

      if (itemSchema instanceof z.ZodObject) {
        if (yArray.length <= i) {
          const nestedMap = new Y.Map();
          yArray.insert(i, [nestedMap]);
        }

        let nestedMap = yArray.get(i);
        if (!(nestedMap instanceof Y.Map)) {
          nestedMap = new Y.Map();
          yArray.delete(i, 1);
          yArray.insert(i, [nestedMap]);
        }

        this.applyObjectChanges(itemSchema, item, nestedMap);
      } else if (itemSchema instanceof z.ZodRecord) {
        if (yArray.length <= i) {
          const nestedMap = new Y.Map();
          yArray.insert(i, [nestedMap]);
        }

        let nestedMap = yArray.get(i);
        if (!(nestedMap instanceof Y.Map)) {
          nestedMap = new Y.Map();
          yArray.delete(i, 1);
          yArray.insert(i, [nestedMap]);
        }

        this.applyRecordChanges(itemSchema, item, nestedMap);
      } else if (itemSchema instanceof ZodText) {
        if (yArray.length <= i) {
          const yText = new Y.Text();
          yArray.insert(i, [yText]);
        }

        let yText = yArray.get(i);
        if (!(yText instanceof Y.Text)) {
          yText = new Y.Text();
          yArray.delete(i, 1);
          yArray.insert(i, [yText]);
        }

        this.applyTextChanges(item, yText);
      } else {
        if (yArray.length <= i) {
          yArray.insert(i, [item]);
        } else {
          const currentItem = yArray.get(i);
          if (!isEqual(currentItem, item)) {
            yArray.delete(i);
            yArray.insert(i, [item]);
          }
        }
      }
    }

    if (yArray.length > length) {
      yArray.delete(length, yArray.length - length);
    }
  }

  private applyRecordChanges(
    schemaField: z.ZodRecord<any, any>,
    record: Record<any, any>,
    yMap: Y.Map<any>
  ) {
    const valueSchema = this.extractType(schemaField.valueSchema, record);
    for (const [key, value] of Object.entries(record)) {
      if (value === null || value === undefined) {
        if (yMap.has(key)) {
          yMap.delete(key);
        }

        continue;
      }

      if (valueSchema instanceof z.ZodObject) {
        if (typeof value !== 'object') {
          throw new Error('Value must be an object');
        }

        let nestedMap = yMap.get(key);
        if (!(nestedMap instanceof Y.Map)) {
          nestedMap = new Y.Map();
          yMap.set(key, nestedMap);
        }

        this.applyObjectChanges(valueSchema, value, nestedMap);
      } else if (valueSchema instanceof z.ZodRecord) {
        if (typeof value !== 'object') {
          throw new Error('Value must be an object');
        }

        let nestedMap = yMap.get(key);
        if (!(nestedMap instanceof Y.Map)) {
          nestedMap = new Y.Map();
          yMap.set(key, nestedMap);
        }

        this.applyRecordChanges(valueSchema, value, nestedMap);
      } else if (valueSchema instanceof z.ZodArray) {
        if (!Array.isArray(value)) {
          throw new Error('Value must be an array');
        }

        let yArray = yMap.get(key);
        if (!(yArray instanceof Y.Array)) {
          yArray = new Y.Array();
          yMap.set(key, yArray);
        }

        this.applyArrayChanges(valueSchema, value, yArray);
      } else if (valueSchema instanceof ZodText) {
        if (typeof value !== 'string') {
          throw new Error('Value must be a string');
        }

        let yText = yMap.get(key);
        if (!(yText instanceof Y.Text)) {
          yText = new Y.Text();
          yMap.set(key, yText);
        }

        this.applyTextChanges(value, yText);
      } else {
        const currentValue = yMap.get(key);
        if (!isEqual(currentValue, value)) {
          yMap.set(key, value);
        }
      }
    }

    const deletedKeys = Array.from(yMap.keys()).filter(
      (key) => !Object.prototype.hasOwnProperty.call(record, key)
    );

    for (const key of deletedKeys) {
      yMap.delete(key);
    }
  }

  private applyTextChanges(value: string, yText: Y.Text) {
    const currentText = yText.toString();
    const newText = value ? value.toString() : '';

    if (isEqual(currentText, newText)) {
      return;
    }

    const diffs = diffChars(currentText, newText);
    let index = 0;

    for (const diff of diffs) {
      if (diff.added) {
        yText.insert(index, diff.value);
        index += diff.value.length;
      } else if (diff.removed) {
        yText.delete(index, diff.value.length);
      } else {
        index += diff.value.length;
      }
    }
  }

  private extractType(
    schema: z.ZodType<any, any, any>,
    value: any
  ): z.ZodType<any, any, any> {
    if (schema instanceof z.ZodOptional) {
      return this.extractType(schema.unwrap(), value);
    }

    if (schema instanceof z.ZodNullable) {
      return this.extractType(schema.unwrap(), value);
    }

    if (
      schema instanceof z.ZodUnion ||
      schema instanceof z.ZodDiscriminatedUnion
    ) {
      for (const option of schema.options) {
        if (option.safeParse(value).success) {
          return this.extractType(option, value);
        }
      }
    }

    return schema;
  }
}
