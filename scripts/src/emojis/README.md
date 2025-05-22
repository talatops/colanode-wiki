# Colanode emoji generator script

This directory contains a script that automatically downloads, processes, and packages emoji metadata and SVG files for **Colanode**. These emojis can then be used across the Colanode platform in two primary ways:

1. **Reactions to Messages** – Users can react to messages in chats or channels with these emojis.
2. **Icons** – Users can assign emojis as icons for their entries: channels, pages, databases, records, folders, etc.

By consolidating emojis from [Emoji Mart](https://github.com/missive/emoji-mart) and [Twemoji](https://github.com/twitter/twemoji) (in our case, a forked [jdecked/twemoji](https://github.com/jdecked/twemoji)), we ensure broad coverage of Unicode emojis with consistent SVG assets for an optimal user experience.

## How It Works

1. **Download Required Repositories**

   - **Emoji Mart** (from GitHub tag `v5.6.0`): Provides emoji metadata (names, keywords, categories, etc.).
   - **Twemoji** (from GitHub tag `v15.1.0`): Provides SVG files for each emoji in the set.

2. **Extract & Organize Files**  
   The script:

   - Unzips the downloaded archives into a temporary working directory (`src/emojis/temp`).
   - Reads the **Emoji Mart** metadata (from `en.json` and `twitter.json`).
   - Reads the **Twemoji** SVG assets from the `assets/svg` directory.

3. **Process & Generate**

   - Initializes or updates an `emojis.db` SQLite database in `src/emojis/`.
   - Creates (or reuses) the following tables:
     - **categories** (stores category info like name, display order, etc.)
     - **emojis** (stores each emoji’s core data, such as code, name, tags, emoticons, etc.)
     - **emoji_svgs** (stores each emoji skin’s SVG image as a BLOB)
     - **emoji_search** (FTS table for search queries across emoji names, tags, etc.)
   - Merges any existing data so as not to overwrite or lose previously assigned IDs. This ensures emojis already in use retain consistent IDs in the Colanode app.
   - Stores each emoji skin’s SVG data as a BLOB in a separate `emoji_svgs` table.
   - Maintains a full-text search (`emoji_search`) table for easy querying by name or tags.

4. **Cleanup**
   - Removes the temporary working directory once processing is complete.
   - Leaves you with a fully updated `emojis.db` containing all the emoji data and SVG images.

## Usage

1. **Install Dependencies** (from the root of the monorepo):

   ```bash
   npm install
   ```

2. **Generate Emojis** (from the `scripts` directory):

   ```bash
   npm run generate:emojis
   ```

Once the script completes, you’ll have a fresh `emojis.db` file that contains all relevant emoji metadata (IDs, categories, tags, etc.) and their corresponding SVG assets.

## Notes on Licensing

While **Colanode** is open source under its own [license terms](../../../LICENSE) (in the root of the monorepo), the emojis retrieved from **Emoji Mart** and **Twemoji** are subject to their respective licenses. Please review their repositories for details:

- [missive/emoji-mart](https://github.com/missive/emoji-mart)
- [jdecked/twemoji (originally Twitter’s Twemoji)](https://github.com/jdecked/twemoji)
