import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import { NammathamApp } from 'nammatham';
import { HealthAlertFunction } from './functions/health-alert.function';
import { SlackOption, SlackService } from './services/slack.service';
import { HttpClient } from './services/http-client';
import { Tokens } from './constants';

const builder = NammathamApp.createBuilder(__filename);
builder.addFunctions(HealthAlertFunction);
builder.container.bind(HttpClient).toSelf().inTransientScope();

/**
 * Slack service
 */
builder.container.bind<SlackOption>(Tokens.SlackOption).toConstantValue({
  websiteName: process.env.WEBSITE_SITE_NAME,
  prefix: 'Health Alert',
  slackWebhookURL: process.env.Slack_Webhook_URL || '',
  customSlackWarningAlert: process.env.Custom_Slack_Warning_Alert || '',
});
builder.container.bind(SlackService).toSelf().inSingletonScope();
builder.build();

export default builder.getApp();
