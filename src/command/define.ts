import {environment} from '../config/environment';
import {BaseCommand} from './baseCommand';
import request from 'request';
import {logger} from "../utils/logger";
import {getChannel} from "../utils/utils";
import {RedisCommand} from "../utils/redisConnector";
import {Client, TextChannel} from "discord.js";

function getRapidApiHeader(apiName: string) {
  return {
    'x-rapidapi-host': environment.rapidApi[apiName].host,
    'x-rapidapi-key': environment.rapidApi[apiName].key
  };
}

export class Define extends BaseCommand {
  name = 'define';
  helpString = 'Defines a word';

  execute(bot: Client, rc: RedisCommand) {
    let options2 = {
      method: 'GET',
      url: 'https://mashape-community-urban-dictionary.p.rapidapi.com/define',
      headers: getRapidApiHeader("urbanDictionary"),
      qs: {term: rc.arguments[0]},
    };
    logger.debug("defining " + rc.arguments[0]);
    getChannel(bot, rc).then((channel: TextChannel) => {
      let out = `**${rc.arguments[0]}**\n`;
      request(options2, (error, response, body) => {
        if (error) throw new Error(error);
        body = JSON.parse(body);
        if (body.list.length === 0) return channel.send("word not found");

        let def = body.list[0];
        logger.debug("found " + def.definition);
        out += `${def.definition}\n`;
        out += `\n> ${def.example.replace(/\n/g, '\n> ')}\n`;
        channel.send(out.replace(/[\[\]]/g, '')).catch(logger.error);
      });
    });
  }
}
