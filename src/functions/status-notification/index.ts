/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  WebsocketApiGatewayProxyEventV2,
  getOcppMessage,
} from "../layers/config/nodejs/config";

export const handler = async (event: WebsocketApiGatewayProxyEventV2) => {
  const ocppMessage = getOcppMessage(event);
  // console.log("event: ", event);
  // console.log("ocppMessage: ", ocppMessage);

  return { statusCode: 200 };
};
