/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { APIGatewayProxyEventHeaders, APIGatewayProxyEventV2 } from "aws-lambda";
import { PutItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { AmazingLogger as logger } from "../layers/logging/nodejs/logger";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event: APIGatewayProxyEventV2) => {
  const untypedEvent = event as any;
  if (!checkProtocol(event.headers)
    || (event.queryStringParameters?.chargeBoxId == undefined)
    || (untypedEvent.requestContext.connectionId == undefined)) {
    return { statusCode: 400 };
  }
  const chargeBoxId = event.queryStringParameters.chargeBoxId;
  const connectionId = untypedEvent.requestContext.connectionId;
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      chargeBoxId: { S: chargeBoxId },
      connectionId: { S: connectionId },
      webSocketConnectionStatus: { S: 'connected' }
    }
  };

  try {
    await ddbClient.send(new PutItemCommand(params));
  } catch (error) {
    logger.error('error: ', error)
    return { statusCode: 400, body: 'unable to store connection' }
  }

  return { statusCode: 200, headers: { "Sec-WebSocket-Protocol": "ocpp1.6" } };
};

function checkProtocol(inputHeaders: APIGatewayProxyEventHeaders): boolean {
  if (inputHeaders != undefined) {
    const headers = toLowerCaseProperties(inputHeaders);

    if (headers['sec-websocket-protocol'] != undefined) {
      const subprotocolHeader = headers['sec-websocket-protocol'];
      const subprotocols = subprotocolHeader.split(',');

      if (subprotocols.indexOf('ocpp1.6') >= 0) {
        return true;
      }
    }
  }
  return false;
}

function toLowerCaseProperties(obj: APIGatewayProxyEventHeaders): APIGatewayProxyEventHeaders {
  return JSON.parse(JSON.stringify(obj).toLowerCase());
}
