/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { marshall } from "@aws-sdk/util-dynamodb";
import * as app from "../stop-transaction";

let updateParams: any;
let queryParams: any;
let queryReturn: any;
let apiClientCommand: any;

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
        send: jest.fn().mockImplementation((_command?: any) => {
          /* noop */
        }),
      };
    }),
    PostToConnectionCommand: jest.fn().mockImplementation((_p: any) => {
      apiClientCommand = _p;
    }),
  };
});

describe("StopTransaction Service Tests", () => {
  process.env.TABLE_NAME = "a-table-name";

  it("returns 200", async () => {
    const result = await app.handler(getEvent());

    expect(result).toStrictEqual({ statusCode: 200 });
  });

  it("calls get chargeBoxConnectorId by connectionId", async () => {
    await app.handler(getEvent());

    expect(queryParams).toHaveProperty("ExpressionAttributeValues", {
      ":c": { S: getEvent().requestContext.connectionId },
    });
  });

  it("sends empty conf for all stop transaction requests", async () => {
    await app.handler(getEvent());
    const body = JSON.parse(apiClientCommand.Data);

    expect(body).toEqual([3, "20", {}]);
  });

  it("updates idTag, meter, stopTransactionReason, transactionData", async () => {
    await app.handler(getEvent());

    const ocppMessage = JSON.parse(getEvent().body);
    const reason =
      ocppMessage[3].reason == null ? "local" : ocppMessage[3].reason;

    expect(updateParams.ExpressionAttributeValues).toEqual({
      ":it": { S: "an-id-token" },
      ":ti": { S: "0" },
      ":m": { N: String(ocppMessage[3].meterStop) },
      ":rc": { M: marshall(getEvent().requestContext) },
      ":str": { S: reason },
      ":td": { M: marshall(ocppMessage[3].transactionData) },
    });

    expect(updateParams.UpdateExpression).toEqual(
      "set idToken = :it, transactionId = :ti, meter = :m, requestContext = :rc, stopTransactionReason = :str, transactionData = :td"
    );
  });

  it("returns with messageId from request", async () => {
    const ocppMessage = JSON.parse(getEvent().body);
    await app.handler(getEvent());
    const body = JSON.parse(apiClientCommand.Data);

    expect(body[1]).toEqual(ocppMessage[messageIdIndex]);
  });

  const getEvent = () => {
    return {
      requestContext: {
        routeKey: "StopTransaction",
        messageId: "SWB51d6EPHcCGVQ=",
        eventType: "MESSAGE",
        extendedRequestId: "SWB51H8KvHcFlQQ=",
        requestTime: "18/May/2022:23:11:07 +0000",
        messageDirection: "IN",
        stage: "dev",
        connectedAt: 1652915439935,
        requestTimeEpoch: 1652915467503,
        identity: { userAgent: "Amazon CloudFront", sourceIp: "64.252.73.162" },
        requestId: "SWB51H8KvHcFlQQ=",
        domainName: "tdxd1qivqd.execute-api.us-west-2.amazonaws.com",
        connectionId: "SWB1hdfcPHcCGVQ=",
        apiId: "tdxd1qivqd",
      },
      body:
        "[\n" +
        " 2,\n" +
        ' "20",\n' +
        ' "StopTransaction",\n' +
        " {\n" +
        ' "transactionId": 0,\n' +
        ' "idTag": "<idTag>",\n' +
        ' "timestamp": "2022-05-18T23:10:57.476Z",\n' +
        ' "meterStop": 10100,\n' +
        ' "reason": null,\n' +
        ' "transactionData": []\n' +
        " }\n" +
        "]",
      isBase64Encoded: false,
    } as any;
  };
});
