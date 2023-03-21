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
      this.context.log(error);
      // TODO: noti to slack
      return this.res.status(400).send(`Invalid request body | Details: ${error.message}`);
    }

    const { data: body } = parseBody;

    const resourceName = this.getReadableResourceName(body.data.essentials.configurationItems[0]); // TODO: checksize before access index 0, if length > 1 should log warning
    const health = this.getReadableHealthStatus(body.data.essentials.monitorCondition);
    const firedData = new Date(body.data.essentials.firedDateTime).toISOString().replace('T', ' ').replace('Z', '');
    const instances = this.getInstancesName(body.data.alertContext.condition.allOf[0].dimensions);
    const instanceList = instances.map(name => ` - ${name}\n`);

    const message = `\n[Dev MT - ${resourceName}] [${health}] At ${firedData} (UTC)\nInstace List\n${instanceList}`;

    this.context.log(message);
    // TODO: uncomment below to send notify to slack
    // this.slackService.notify(this.context, message);
    return this.res.send('Notifying Slack...');
  }

  private getReadableResourceName(resourceName: RequestBody['data']['essentials']['configurationItems'][number]) {
    const resourceMap: Record<typeof resourceName, string> = {
      '***REMOVED***': '***REMOVED***',
      '***REMOVED***': '***REMOVED***',
      '***REMOVED***': '***REMOVED***',
      '***REMOVED***': '***REMOVED***',
    };

    return resourceMap[resourceName];
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
