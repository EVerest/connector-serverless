/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import {
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import {
  ddbClient,
  WebsocketApiGatewayProxyEventV2,
  WebsocketApiGatewayEventRequestContextV2,
  getQueryParams,
  getOcppMessage,
  getChargeBoxId,
} from "../layers/config/nodejs/config";
import { marshall } from "@aws-sdk/util-dynamodb";

const apiClient = new ApiGatewayManagementApiClient({
  region: process.env.REGION,
  endpoint: process.env.CLIENT_ENDPOINT,
});
const messageBodyIndex = 3;
const callResult = 3;
const messageIdIndex = 1;
const ACCEPTED = "Accepted";

export const handler = async (event: WebsocketApiGatewayProxyEventV2) => {
  const ocppMessage = getOcppMessage(event);
  const chargeBoxId = await getChargeBoxId(event);
  const chargeBoxConnectorId = chargeBoxId + "##0";
  const updateParameters = getUpdateParams(
    chargeBoxConnectorId,
    ocppMessage,
    event.requestContext
  );
  await ddbClient.send(new UpdateItemCommand(updateParameters));

  await apiClient.send(
    new PostToConnectionCommand({
      // @ts-ignore
      Data: createConf(ocppMessage),
      ConnectionId: event.requestContext.connectionId,
    })
  );

  return { statusCode: 200 };
};

const createConf = (ocppMessage: any): string => {
  const confirmation = [
    callResult,
    ocppMessage[messageIdIndex],
    {
      status: ACCEPTED,
      currentTime: Date.now,
      heartbeatInterval: 300,
    },
  ];

  return JSON.stringify(confirmation);
};

const getUpdateParams = (
  chargeBoxConnectorId: string,
  ocppMessage: any,
  requestContext: WebsocketApiGatewayEventRequestContextV2
): UpdateItemCommandInput => {
  return {
    TableName: process.env.TABLE_NAME,
    Key: { chargeBoxConnectorId: { S: chargeBoxConnectorId } },
    UpdateExpression:
      "set chargePointModel = :cpm, chargePointVendor = :cpv, requestContext = :rc, ocppData = :od, messageInterval = :i, registrationStatus = :s, ocppMessageId = :omid",
    ExpressionAttributeValues: {
      ":cpm": { S: ocppMessage[messageBodyIndex].chargePointModel },
      ":cpv": { S: ocppMessage[messageBodyIndex].chargePointVendor },
      ":rc": { M: marshall(requestContext) },
      ":od": { M: marshall(ocppMessage[messageBodyIndex]) },
      ":s": { S: "Accepted" },
      ":i": { N: "300" },
      ":omid": { S: ocppMessage[messageIdIndex] },
    },
  };
};
