import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { DiscordRequest } from './utils.js';
import { parseWikiText } from './wikiTextParser.js'

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// To keep track of our active games
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "wiki" command
    if (name === 'wiki') {
      const input = req.body.data.options[0].value;
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;
      const apiURL = "https://www.poewiki.net/api.php?" +
        new URLSearchParams({
          origin: "*",
          action: "parse",
          page: input,
          format: "json",
          prop: "wikitext",
          section: 0,
        });
      let wikiText = "";

      console.log("URL: ", apiURL);

      try {
        await res.send({
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
         });
      } catch (err) {
        console.error("Error deferring message", err);
      }

      try {
        const wikiReq = await fetch(apiURL);
        const wikiJSON = await wikiReq.json();
        wikiText = wikiJSON.parse.wikitext['*'];

        console.log("wikiText:");
        console.log(wikiText);
      } catch (err) {
        console.error("Error with wiki request: ", err);
      }

      console.log("user input: ", input);

      try {
        await DiscordRequest(endpoint, {
          method: "PATCH",
          body: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: parseWikiText(input, wikiText),
          }
        });
      } catch (err) {
        console.error("Error sending message: ", err);
      }

      return;
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
