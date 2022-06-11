/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import {
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import {
  apiClient,
  ddbClient,
  WebsocketApiGatewayProxyEventV2,
  WebsocketApiGatewayEventRequestContextV2,
  getChargeBoxId,
  getOcppMessage,
} from "../layers/config/nodejs/config";

const transactionId = "0";
const callResult = 3;
const messageIdIndex = 1;
const messageBodyIndex = 3;

export const handler = async (event: WebsocketApiGatewayProxyEventV2) => {
  const ocppMessage = getOcppMessage(event);
  const chargeBoxId = await getChargeBoxId(event);

  const chargeBoxConnectorId =
    chargeBoxId + "##" + ocppMessage[messageBodyIndex].connectorId;

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
  const confirmation = [callResult, ocppMessage[messageIdIndex], {}];

  return JSON.stringify(confirmation);
};

const getUpdateParams = (
  chargeBoxConnectorId: string,
  ocppMessage: any,
  requestContext: WebsocketApiGatewayEventRequestContextV2
): UpdateItemCommandInput => {
  const reason =
    ocppMessage[messageBodyIndex].reason == null
      ? "local"
      : ocppMessage[messageBodyIndex].reason;
  return {
    TableName: process.env.TABLE_NAME,
    Key: { chargeBoxConnectorId: { S: chargeBoxConnectorId } },
    UpdateExpression:
      "set idToken = :it, transactionId = :ti, meter = :m, requestContext = :rc, stopTransactionReason = :str, transactionData = :td",
    ExpressionAttributeValues: {
      ":it": { S: "an-id-token" },
      ":ti": { S: transactionId },
      ":m": { N: String(ocppMessage[messageBodyIndex].meterStop) },
      ":rc": { M: marshall(requestContext) },
      ":str": { S: reason },
      ":td": { M: marshall(ocppMessage[messageBodyIndex].transactionData) },
    },
  };
};
