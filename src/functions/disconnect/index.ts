/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import {
  ddbClient,
  getChargeBoxId,
  WebsocketApiGatewayProxyEventV2,
} from "../layers/config/nodejs/config";
import { marshall } from "@aws-sdk/util-dynamodb";

export const handler = async (event: WebsocketApiGatewayProxyEventV2) => {
  const chargeBoxId = await getChargeBoxId(event);
  const chargeBoxConnectorId = chargeBoxId + "##0";

  await ddbClient.send(
    new UpdateItemCommand(getUpdateParams(chargeBoxConnectorId, event))
  );
};

const getUpdateParams = (
  chargeBoxConnectorId: string,
  event: WebsocketApiGatewayProxyEventV2
): UpdateItemCommandInput => {
  const requestContext = event.requestContext;
  return {
    TableName: process.env.TABLE_NAME,
    Key: { chargeBoxConnectorId: { S: chargeBoxConnectorId } },
    UpdateExpression: "set requestContext = :w",
    ExpressionAttributeValues: {
      ":w": { M: marshall(requestContext) },
    },
  };
};
