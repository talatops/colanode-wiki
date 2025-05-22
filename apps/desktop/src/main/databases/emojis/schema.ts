import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

interface CategoriesTable {
  id: ColumnType<string, never, never>;
  name: ColumnType<string, never, never>;
  count: ColumnType<number, never, never>;
  display_order: ColumnType<number, never, never>;
}

export type SelectCategory = Selectable<CategoriesTable>;
export type CreateCategory = Insertable<CategoriesTable>;
export type UpdateCategory = Updateable<CategoriesTable>;

interface EmojisTable {
  id: ColumnType<string, never, never>;
  category_id: ColumnType<string, never, never>;
  code: ColumnType<string, never, never>;
  name: ColumnType<string, never, never>;
  tags: ColumnType<string, never, never>;
  emoticons: ColumnType<string, never, never>;
  skins: ColumnType<string, never, never>;
}

export type SelectEmoji = Selectable<EmojisTable>;
export type CreateEmoji = Insertable<EmojisTable>;
export type UpdateEmoji = Updateable<EmojisTable>;

interface EmojiSvgsTable {
  skin_id: ColumnType<string, never, never>;
  emoji_id: ColumnType<string, never, never>;
  svg: ColumnType<Buffer, never, never>;
}

export type SelectEmojiSvg = Selectable<EmojiSvgsTable>;
export type CreateEmojiSvg = Insertable<EmojiSvgsTable>;
export type UpdateEmojiSvg = Updateable<EmojiSvgsTable>;

interface EmojiSearchTable {
  id: ColumnType<string, never, never>;
  text: ColumnType<string, never, never>;
}

export type SelectEmojiSearch = Selectable<EmojiSearchTable>;
export type CreateEmojiSearch = Insertable<EmojiSearchTable>;
export type UpdateEmojiSearch = Updateable<EmojiSearchTable>;

export interface EmojiDatabaseSchema {
  emojis: EmojisTable;
  categories: CategoriesTable;
  emoji_search: EmojiSearchTable;
  emoji_svgs: EmojiSvgsTable;
}
