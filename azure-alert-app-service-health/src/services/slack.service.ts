import { injectable, inject } from 'inversify';
// TODO: using TypedContext
import { Context } from 'nammatham';
import { HttpClient } from './http-client';
import { throwError } from '../libs/error';
import { Tokens } from '../constants';

export interface SlackOption {
  slackWebhookURL: string;
  customSlackWarningAlert?: string;
  prefix?: string;
  /**
   * Automatic assigned by Azure Function
   */
  websiteName?: string; // WEBSITE_SITE_NAME
}

@injectable()
export class SlackService {
  constructor(
    @inject(Tokens.SlackOption) protected option: SlackOption,
    @inject(HttpClient) protected httpClient: HttpClient
  ) {}

  public async notify(context: Context, message: string) {
    if (this.option.prefix) {
      message = `[${this.option.prefix}] ${message}`;
    }
    message = `${message} ${this.option.customSlackWarningAlert}`;
    if (this.option.websiteName) {
      message = `${message} (notified by ${this.option.websiteName})`;
    }
    context.log(`Notify to slack with message: "${message}"`);
    const data = { text: message };
    if (!this.httpClient) throw new Error(`HttpClient doesn't injected`);
    try {
      await this.httpClient.setHeaderJson().post(this.option.slackWebhookURL, { data });
    } catch (error) {
      context.log.error(`Cannot send notify to slack`);
      throwError(error);
    }
  }
}
