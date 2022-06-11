/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import {
  AmazingLogger as logger,
  WebsocketApiGatewayProxyEventV2,
} from "../layers/config/nodejs/config";

const client = new SNSClient({ region: process.env.REGION });

export const handler = async (event: WebsocketApiGatewayProxyEventV2) => {
  const params = {
    Message: JSON.stringify(event.body),
    TopicArn: process.env.TOPIC_ARN,
  };
  const command = new PublishCommand(params);
  try {
    await client.send(command);
  } catch (error) {
    logger.error(error);
    return { statusCode: 400 };
  }
  return { statusCode: 200 };
};
