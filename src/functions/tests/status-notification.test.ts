/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as app from "../status-notification";

let updateParams: any;
let queryParams: any;
let queryReturn: any;
let sentToConnectionId: any;
let apiClientCommand: any;

const accepted = "Accepted";
const messageIdIndex = 1;

beforeEach(() => {
  queryReturn = {
    Items: [{ chargeBoxConnectorId: { S: "a-charge-box-connector-id##0" } }],
  };
});

jest.mock("@aws-sdk/client-dynamodb", () => {
  return {
    DynamoDBClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((_command?: any) => {
          return queryReturn;
        }),
      };
    }),
    QueryCommand: jest.fn().mockImplementation((p: any) => {
      queryParams = p;
      return {};
    }),
    UpdateItemCommand: jest.fn().mockImplementation((p: any) => {
      updateParams = p;
    }),
  };
});

jest.mock("@aws-sdk/client-apigatewaymanagementapi", () => {
  return {
    ApiGatewayManagementApiClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((_command?: any) => {}),
      };
    }),
    PostToConnectionCommand: jest.fn().mockImplementation((_p: any) => {
      sentToConnectionId = _p.ConnectionId;
      apiClientCommand = _p;
    }),
  };
});

describe("Status Notification Service Tests", () => {
  process.env.TABLE_NAME = "a-table-name";

  it("returns 200", async () => {
    const result = await app.handler(getEvent());

    expect(result).toStrictEqual({ statusCode: 200 });
  });
});

const getEvent = () => {
  return {
    requestContext: {
      routeKey: "StatusNotification",
      messageId: "SWStFfU7vHcCHHQ=",
      eventType: "MESSAGE",
      extendedRequestId: "SWStFEm_PHcFrgA=",
      requestTime: "19/May/2022:01:05:49 +0000",
      messageDirection: "IN",
      stage: "dev",
      connectedAt: 1652921823978,
      requestTimeEpoch: 1652922349154,
      identity: { userAgent: "Amazon CloudFront", sourceIp: "64.252.73.159" },
      requestId: "SWStFEm_PHcFrgA=",
      domainName: "tdxd1qivqd.execute-api.us-west-2.amazonaws.com",
      connectionId: "SWRbBefjvHcCHHQ=",
      apiId: "tdxd1qivqd",
    },
    body:
      "[\n" +
      " 2,\n" +
      ' "29",\n' +
      ' "StatusNotification",\n' +
      " {\n" +
      ' "connectorId": 1,\n' +
      ' "status": "Available",\n' +
      ' "errorCode": "NoError",\n' +
      ' "info": null,\n' +
      ' "timestamp": "2022-05-19T01:02:55.257Z",\n' +
      ' "vendorId": null,\n' +
      ' "vendorErrorCode": null\n' +
      " }\n" +
      "]",
    isBase64Encoded: false,
  } as any;
};
