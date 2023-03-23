import { z } from 'zod';

export const requestBodySchema = z.object({
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

