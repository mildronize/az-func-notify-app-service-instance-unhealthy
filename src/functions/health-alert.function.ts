import { BaseFunction, binding, functionName } from 'nammatham';
import { inject } from 'inversify';
import { SlackService } from '../services/slack.service';
import { requestBodySchema } from './health-alert.schema';
import { HttpRequest } from '@azure/functions';
import { z } from 'zod';

export type RequestBody = z.infer<typeof requestBodySchema>;

const bindings = [
  binding.httpTrigger({ name: 'req' as const, methods: ['get', 'post'] }),
  binding.http_withReturn(),
] as const;

@functionName('health-alert', ...bindings)
export class HealthAlertFunction extends BaseFunction<typeof bindings> {
  constructor(@inject(SlackService) protected slackService: SlackService) {
    super();
  }

  public override async execute(req: HttpRequest): Promise<binding.inferReturn<typeof bindings>> {
    const rawBody = req.body;
    const parseBody = requestBodySchema.safeParse(rawBody);
    if (!parseBody.success) {
      const { error } = parseBody;
      this.log.error(error);
      return this.responseBadRequest(`Health Alert schema is not correct, ${error.message}`);
    }

    const { data: body } = parseBody;
    const { configurationItems, monitorCondition, firedDateTime } = body.data.essentials;
    /**
     * body.data.essentials.configurationItems
     */
    if (configurationItems.length === 0)
      return this.responseBadRequest(`Data schema: 'data.essentials.configurationItems'. Length of array is 0`);
    if (configurationItems.length > 1)
      this.log.warn(`Don't expected Data schema: 'data.essentials.configurationItems'. Length of array is more than 1`);
    const resourceName = configurationItems[0];
    const health = this.getReadableHealthStatus(monitorCondition);
    const firedData = new Date(firedDateTime).toISOString().replace('T', ' ').replace('Z', '');

    /**
     * body.data.alertContext.condition.allOf[0].dimensions
     */
    const { allOf: conditionAllOf } = body.data.alertContext.condition;
    if (conditionAllOf.length === 0) {
      return this.responseBadRequest(`Data schema: 'data.alertContext.condition.allOf'. Length of array is 0`);
    }
    if (conditionAllOf.length > 1)
      this.log.warn(`Don't expected Data schema: 'data.alertContext.condition.allOf'. Length of array is more than 1`);
    const instances = this.getInstancesName(conditionAllOf[0].dimensions);
    const instanceList = instances.map(name => ` - ${name}\n`);

    const message = `\n[${resourceName}] [${health}] At ${firedData} (UTC)\nInstance List:\n${instanceList}`;

    this.context.log(message);
    this.slackService.notify(this.context, message);
    return this.res.send('Notifying Slack...');
  }

  private responseBadRequest(message: string) {
    const _message = `Invalid request body | Details: ${message}`;
    this.slackService.notify(this.context, _message);
    return this.res.status(400).send(_message);
  }

  private getReadableHealthStatus(monitorCondition: RequestBody['data']['essentials']['monitorCondition']) {
    if (monitorCondition === 'Fired') {
      return '❌ Down';
    }

    return '✅ Up';
  }

  private getInstancesName(
    dimensions: RequestBody['data']['alertContext']['condition']['allOf'][number]['dimensions']
  ) {
    return dimensions.map(item => item.value);
  }
}
