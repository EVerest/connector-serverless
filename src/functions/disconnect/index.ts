/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { PutItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { AmazingLogger as logger } from "../layers/logging/nodejs/logger";

const ddbClient = new DynamoDBClient({ region: process.env.REGION })

export const handler = async (event: APIGatewayProxyEventV2) => {
  const untypedEvent = event as any;
  if (untypedEvent.requestContext.connectionId != undefined) {
    // look up chargeBoxId by connectionId on secondary index
    // update to disconnected by chargeBoxId

  } else {
    logger.warn('disconnected without connectionId', { requestContext: untypedEvent.requestContext })
  }
};



