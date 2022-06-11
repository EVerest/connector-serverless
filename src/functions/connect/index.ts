/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { APIGatewayProxyEventHeaders } from "aws-lambda";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import {
  ddbClient,
  WebsocketApiGatewayProxyEventV2,
} from "../layers/config/nodejs/config";

const connectorId = "0";

export const handler = async (event: WebsocketApiGatewayProxyEventV2) => {
  if (isNotValid(event)) {
    return { statusCode: 400 };
  }

  try {
    await ddbClient.send(new UpdateItemCommand(getParams(event)));
  } catch (error) {
    return { statusCode: 400, body: "unable to store connection" };
  }
  return { statusCode: 200, headers: { "Sec-WebSocket-Protocol": "ocpp1.6" } };
};

const isNotValid = (event: WebsocketApiGatewayProxyEventV2) => {
  return (
    !checkProtocol(event.headers) ||
    event.queryStringParameters?.chargeBoxId == undefined
  );
};

const getParams = (event: WebsocketApiGatewayProxyEventV2) => {
  const chargeBoxId = event.queryStringParameters?.chargeBoxId;
  return {
    TableName: process.env.TABLE_NAME,
    Key: { chargeBoxConnectorId: { S: chargeBoxId + "##" + connectorId } },
    UpdateExpression: "set requestContext = :w, connectionId = :c",
    ExpressionAttributeValues: {
      ":w": { M: marshall(event.requestContext) },
      ":c": { S: event.requestContext.connectionId },
    },
  };
};

function checkProtocol(inputHeaders: APIGatewayProxyEventHeaders): boolean {
  if (inputHeaders != undefined) {
    const headers = toLowerCaseProperties(inputHeaders);

    if (headers["sec-websocket-protocol"] != undefined) {
      const subprotocolHeader = headers["sec-websocket-protocol"];
      const subprotocols = subprotocolHeader.split(",");

      if (subprotocols.indexOf("ocpp1.6") >= 0) {
        return true;
      }
    }
  }
  return false;
}

function toLowerCaseProperties(
  obj: APIGatewayProxyEventHeaders
): APIGatewayProxyEventHeaders {
  return JSON.parse(JSON.stringify(obj).toLowerCase());
}
