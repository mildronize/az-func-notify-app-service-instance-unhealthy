import { BaseFunction, binding, functionName } from 'nammatham';
import { inject } from 'inversify';
import { SlackService } from '../services/slack.service';
import { HttpResponse } from '@azure/functions';
import { Tokens } from '../constants';

const bindings = [
  binding.httpTrigger({ name: 'req' as const }),
  binding.http_withReturn()
] as const;

export interface HealthAlertOption {
}


@functionName('health-alert', ...bindings)
export class HealthAlertFunction extends BaseFunction<typeof bindings> {
  constructor(
    @inject(SlackService) protected slackService: SlackService,
    @inject(Tokens.HealthAlertOption) protected option: HealthAlertOption
  ) {
    super();
  }

  public override async execute(): Promise<HttpResponse> {
    // this.slackService.notify(this.context, 'test slack');
    return this.res.send(`Hey`);
  }
}
