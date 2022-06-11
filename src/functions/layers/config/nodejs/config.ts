/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */

import { createLogger, transports, format } from "winston";
import { DynamoDBClient, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";
import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const apiClient = new ApiGatewayManagementApiClient({
  region: process.env.REGION,
  endpoint: process.env.CLIENT_ENDPOINT,
});

const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(format.json()),
    }),
  ],
});

interface WebsocketApiGatewayEventRequestContextV2
  extends APIGatewayEventRequestContextV2 {
  connectionId: string;
}

interface WebsocketApiGatewayProxyEventV2 extends APIGatewayProxyEventV2 {
  requestContext: WebsocketApiGatewayEventRequestContextV2;
}

const getQueryParams = (
  event: WebsocketApiGatewayProxyEventV2
): QueryCommandInput => {
  return {
    KeyConditionExpression: "connectionId = :c",
    ExpressionAttributeValues: {
      ":c": { S: event.requestContext.connectionId },
    },
    TableName: process.env.TABLE_NAME,
    IndexName: "GSI1",
  };
};

const getOcppMessage = (event: WebsocketApiGatewayProxyEventV2): any => {
  const rawMessage = event.body == undefined ? "" : event.body;
  return JSON.parse(rawMessage);
};

const getChargeBoxId = async (
  event: WebsocketApiGatewayProxyEventV2
): Promise<string> => {
  const command = new QueryCommand(getQueryParams(event));
  const data = await ddbClient.send(command);
  const chargeBoxConnectorIds =
    (data.Items != null || undefined)
      ? data.Items?.filter((item) => item != null).map(
          (item) => item.chargeBoxConnectorId.S
        )
      : [];

  // @ts-ignore  
  return chargeBoxConnectorIds[0].substring(0, chargeBoxConnectorIds[0].indexOf('##'));
};

export {
  logger as AmazingLogger,
  ddbClient,
  apiClient,
  WebsocketApiGatewayProxyEventV2,
  WebsocketApiGatewayEventRequestContextV2,
  getQueryParams,
  getOcppMessage,
  getChargeBoxId
};
