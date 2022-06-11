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
  getChargeBoxId,
  getOcppMessage,
  WebsocketApiGatewayProxyEventV2,
} from "../layers/config/nodejs/config";

const ACCEPTED = "Accepted";
const transactionId = 0;
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
  const confirmation = [
    callResult,
    ocppMessage[messageIdIndex],
    {
      transactionId: transactionId,
      idTagInfo: {
        status: ACCEPTED,
      },
    },
  ];

  return JSON.stringify(confirmation);
};

const getUpdateParams = (
  chargeBoxConnectorId: string,
  ocppMessage: any,
  requestContext: any
): UpdateItemCommandInput => {
  const meter = String(ocppMessage[messageBodyIndex].meterStart);

  return {
    TableName: process.env.TABLE_NAME,
    Key: { chargeBoxConnectorId: { S: chargeBoxConnectorId } },
    UpdateExpression:
      "set transactionId = :tid, authorizationStatus = :as, meter = :m, requestContext = :rc",
    ExpressionAttributeValues: {
      ":tid": { N: String(transactionId) },
      ":as": { S: ACCEPTED },
      ":m": { N: meter },
      ":rc": { M: marshall(requestContext) },
    },
  };
};
