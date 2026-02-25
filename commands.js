import 'dotenv/config';
import {  InstallGlobalCommands } from './utils.js';

const WIKI_COMMAND = {
  name: 'wiki',
  description: 'Search the Path of Exile wiki for a specified page',
  type: 1,
  options: [
    {
      name: 'input',
      type: 3,
      description: 'enter the name of the page you would like to view',
      required: true
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const ALL_COMMANDS = [WIKI_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
