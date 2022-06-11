/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as app from "../disconnect";

let updateParams: string;
let queryParams: string;
let chargeBoxConnectorId = "a-charge-box-connector-id##0";
let returnChargeBoxConnectorId = true;

jest.mock("@aws-sdk/client-dynamodb", () => {
  return {
    DynamoDBClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((_command?: any) => {
          if (returnChargeBoxConnectorId) {
            return {
              Items: [{ chargeBoxConnectorId: { S: chargeBoxConnectorId } }],
            };
          } else {
            return {};
          }
        }),
      };
    }),
    QueryCommand: jest.fn().mockImplementation((p: any) => {
      queryParams = p;
      return undefined;
    }),
    UpdateItemCommand: jest.fn().mockImplementation((p: any) => {
      updateParams = p;
    }),
  };
});

describe("Disconnect Service Tests", () => {
  process.env.TABLE_NAME = "a-table-name";

  afterEach(() => {
    jest.clearAllMocks();
    returnChargeBoxConnectorId = true;
  });

  // Research why this doesn't work
  it.skip("returns error when no chargeBoxConnectorId", async () => {
    returnChargeBoxConnectorId = false;

    expect(() => {
      app.handler(getEvent());
    }).toThrowError("chargeBoxConnectorId is required");
  });

  it("calls ddb query with correct params", async () => {
    await app.handler(getEvent());

    expect(queryParams).toStrictEqual(wantedQueryParams());
  });

  it("calls ddb update with correct params", async () => {
    await app.handler(getEvent());

    expect(updateParams).toHaveProperty(
      "UpdateExpression",
      "set requestContext = :w"
    );
  });

  it("saves when disconnected", async () => {
    process.env.TABLE_NAME = "table-name";
    await app.handler(getEvent());

    expect(updateParams).toHaveProperty(
      "UpdateExpression",
      "set requestContext = :w"
    );
    expect(updateParams).toHaveProperty("Key", {
      chargeBoxConnectorId: { S: "a-charge-box-connector-id##0" },
    });
  });
});

const getEvent = () => {
  let event = {
    requestContext: {},
  } as any;
  event.requestContext["connectionId"] = "a-connection-id";

  return event;
};

const wantedQueryParams = () => {
  return {
    TableName: "a-table-name",
    IndexName: "GSI1",
    KeyConditionExpression: "connectionId = :c",
    ExpressionAttributeValues: {
      ":c": { S: "a-connection-id" },
    },
  };
};

/**disconnect untypedEvent:  {
  headers: {
    Host: 'ottk3t1xll.execute-api.us-west-2.amazonaws.com',
    'x-api-key': '',
    'X-Forwarded-For': '',
    'x-restapi': ''
  },
  multiValueHeaders: {
    Host: [ 'ottk3t1xll.execute-api.us-west-2.amazonaws.com' ],
    'x-api-key': [ '' ],
    'X-Forwarded-For': [ '' ],
    'x-restapi': [ '' ]
  },
  requestContext: {
    routeKey: '$disconnect',
    disconnectStatusCode: 1005,
    eventType: 'DISCONNECT',
    extendedRequestId: 'RYG0LEicPHcFo_A=',
    requestTime: '30/Apr/2022:04:16:26 +0000',
    messageDirection: 'IN',
    disconnectReason: 'Client-side close frame status not set',
    stage: 'dev',
    connectedAt: 1651292179479,
    requestTimeEpoch: 1651292186555,
    identity: { userAgent: 'Amazon CloudFront', sourceIp: '64.252.123.253' },
    requestId: 'RYG0LEicPHcFo_A=',
    domainName: 'ottk3t1xll.execute-api.us-west-2.amazonaws.com',
    connectionId: 'RYGzEcSNvHcCH8A=',
    apiId: 'ottk3t1xll'
  },
  isBase64Encoded: false
} */
