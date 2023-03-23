import { BaseFunction, binding, functionName } from 'nammatham';
import { inject } from 'inversify';
import { SlackService } from '../services/slack.service';
import { HttpRequest, HttpResponse } from '@azure/functions';
import { Tokens } from '../constants';
import { z } from 'zod';

const reqeustBodySchema = z.object({
  schemaId: z.string(),
  data: z.object({
    essentials: z.object({
      alertId: z.string(),
      alertRule: z.string(),
      severity: z.string(),
      signalType: z.string(),
      monitorCondition: z.string(),
      monitoringService: z.string(),
      alertTargetIDs: z.array(z.string()),
      configurationItems: z.array(z.string()),
      originAlertId: z.string(),
      firedDateTime: z.string(),
      description: z.string(),
      essentialsVersion: z.string(),
      alertContextVersion: z.string(),
    }),
    alertContext: z.object({
      properties: z.any(),
      conditionType: z.string(),
      condition: z.object({
        windowSize: z.string(),
        allOf: z.array(
          z.object({
            metricName: z.string(),
            metricNamespace: z.string(),
            operator: z.string(),
            threshold: z.string(),
            timeAggregation: z.string(),
            dimensions: z.array(
              z.object({
                name: z.string(),
                value: z.string(),
              })
            ),
            metricValue: z.number(),
            webTestName: z.any(),
          })
        ),
        windowStartTime: z.string(),
        windowEndTime: z.string(),
      }),
    }),
  }),
});

type RequestBody = z.infer<typeof reqeustBodySchema>;

const bindings = [
  binding.httpTrigger({ name: 'req' as const, methods: ['get', 'post'] }),
  binding.http_withReturn(),
] as const;

export interface HealthAlertOption {}

@functionName('health-alert', ...bindings)
export class HealthAlertFunction extends BaseFunction<typeof bindings> {
  constructor(
    @inject(SlackService) protected slackService: SlackService,
    @inject(Tokens.HealthAlertOption) protected option: HealthAlertOption
  ) {
    super();
  }

  public override async execute(req: HttpRequest): Promise<HttpResponse> {
    const rawBody = req.body;
    const parseBody = reqeustBodySchema.safeParse(rawBody);
    if (!parseBody.success) {
      const { error } = parseBody;
      this.context.log.error(error);
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
      this.log.warn(
        `Don't expected Data schema: 'data.essentials.configurationItems'. Length of array is more than 1`
      );
    const resourceName = configurationItems[0];
    const health = this.getReadableHealthStatus(monitorCondition);
    const firedData = new Date(firedDateTime).toISOString().replace('T', ' ').replace('Z', '');

    /**
     * body.data.alertContext.condition.allOf[0].dimensions
     */
    const {allOf: conditionAllOf } = body.data.alertContext.condition;
    if(conditionAllOf.length === 0){
      return this.responseBadRequest(`Data schema: 'data.alertContext.condition.allOf'. Length of array is 0`);
    }
    if (conditionAllOf.length > 1)
      this.log.warn(
        `Don't expected Data schema: 'data.alertContext.condition.allOf'. Length of array is more than 1`
      );
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
