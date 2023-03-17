import { BaseFunction, binding, functionName } from 'nammatham';
import { inject } from 'inversify';
import { SlackService } from '../services/slack.service';
import { HttpResponse } from '@azure/functions';

const bindings = [
  binding.httpTrigger({ name: 'req' as const }),
  binding.http_withReturn()
] as const;

export interface HealthAlertOption {
}


@functionName('health-alert', ...bindings)
export class HealthAlertFunction extends BaseFunction<typeof bindings> {
  public static Token = {
    Option: Symbol.for('HealthAlertOption'),
  };
  constructor(
    @inject(SlackService) protected slackService: SlackService,
    @inject(HealthAlertFunction.Token.Option) protected option: HealthAlertOption
  ) {
    super();
  }

  public override async execute(): Promise<HttpResponse> {
    return this.res.send(`Hey`);
  }
}
