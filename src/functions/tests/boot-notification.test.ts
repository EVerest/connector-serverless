/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as app from "../boot-notification";

let updateParams: string;
let queryParams: string;
let queryReturn: any;
let sentToConnectionId: any;

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
        send: jest.fn().mockImplementation((_command?: any) => {
          return "no";
        }),
      };
    }),
    PostToConnectionCommand: jest.fn().mockImplementation((_p: any) => {
      sentToConnectionId = _p.ConnectionId;
    }),
  };
});

describe("BootNotification Service Tests", () => {
  process.env.TABLE_NAME = "a-table-name";

  it("returns 200", async () => {
    const result = await app.handler(getEvent());

    expect(result).toStrictEqual({ statusCode: 200 });
  });

  it("expects a chargeBoxConnectorId", async () => {
    await app.handler(getEvent());

    expect(updateParams).toHaveProperty("Key", {
      chargeBoxConnectorId: { S: "a-charge-box-connector-id##0" },
    });
  });

  it("expects required fields chargePointModel, chargePointVendor, requestContext, interval, status and ocppEvent", async () => {
    await app.handler(getEvent());

    expect(updateParams).toHaveProperty(
      "UpdateExpression",
      "set chargePointModel = :cpm, chargePointVendor = :cpv, requestContext = :rc, ocppData = :od, messageInterval = :i, registrationStatus = :s, ocppMessageId = :omid"
    );
  });

  it("sends a bootNotification.conf back to the evse", async () => {
    await app.handler(getEvent());

    expect(sentToConnectionId).toEqual(getEvent().requestContext.connectionId);
  });
});

const getEvent = () => {
  return {
    body: '[\n  2,\n  "2",\n  "BootNotification",\n  {\n    "chargePointVendor": "EV-BOX",\n    "chargePointModel": "Test Model",\n    "firmwareVersion": "1.0"\n  }\n]',
    isBase64Encoded: false,
    requestContext: {
      apiId: "ottk3t1xll",
      connectedAt: 1651207856898,
      connectionId: "RU47qe8kPHcCGVw=",
      domainName: "ottk3t1xll.execute-api.us-west-2.amazonaws.com",
      eventType: "MESSAGE",
      extendedRequestId: "RU47-EHHvHcFu7w=",
      identity: {
        sourceIp: "64.252.70.127",
        userAgent: "Amazon CloudFront",
      },
      messageDirection: "IN",
      messageId: "RU47-e9YvHcCGVw=",
      requestId: "RU47-EHHvHcFu7w=",
      requestTime: "29/Apr/2022:04:50:58 +0000",
      requestTimeEpoch: 1651207858861,
      routeKey: "BootNotification",
      stage: "dev",
    },
  } as any;
};

/**bootnotification untypedEvent:  {
  requestContext: {
    routeKey: 'BootNotification',
    messageId: 'RYGzxcT1vHcCH8A=',
    eventType: 'MESSAGE',
    extendedRequestId: 'RYGzxHqCPHcFrkw=',
    requestTime: '30/Apr/2022:04:16:23 +0000',
    messageDirection: 'IN',
    stage: 'dev',
    connectedAt: 1651292179479,
    requestTimeEpoch: 1651292183956,
    identity: { userAgent: 'Amazon CloudFront', sourceIp: '64.252.123.253' },
    requestId: 'RYGzxHqCPHcFrkw=',
    domainName: 'ottk3t1xll.execute-api.us-west-2.amazonaws.com',
    connectionId: 'RYGzEcSNvHcCH8A=',
    apiId: 'ottk3t1xll'
  },
  body: '[\n' +
    '  2,\n' +
    '  "2",\n' +
    '  "BootNotification",\n' +
    '  {\n' +
    '    "chargePointVendor": "EV-BOX",\n' +
    '    "chargePointModel": "Test Model",\n' +
    '    "firmwareVersion": "1.0"\n' +
    '  }\n' +
    ']',
  isBase64Encoded: false
}
*/
