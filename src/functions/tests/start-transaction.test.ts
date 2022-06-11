/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { marshall } from "@aws-sdk/util-dynamodb";
import * as app from "../start-transaction";

let updateParams: any;
let queryParams: any;
let queryReturn: any;
let sentToConnectionId: any;
let apiClientCommand: any;

const ACCEPTED = "Accepted";
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
          /*noop*/
        }),
      };
    }),
    PostToConnectionCommand: jest.fn().mockImplementation((_p: any) => {
      sentToConnectionId = _p.ConnectionId;
      apiClientCommand = _p;
    }),
  };
});

describe("Start Transaction Service Tests", () => {
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

  it("updates with new transactionId, status, meterStart, requestContext", async () => {
    await app.handler(getEvent());

    const ocppMessage = JSON.parse(getEvent().body);

    expect(updateParams.ExpressionAttributeValues).toEqual({
      ":tid": { N: "0" },
      ":as": { S: ACCEPTED },
      ":m": { N: String(ocppMessage[3].meterStart) },
      ":rc": { M: marshall(getEvent().requestContext) },
    });

    expect(updateParams.UpdateExpression).toEqual(
      "set transactionId = :tid, authorizationStatus = :as, meter = :m, requestContext = :rc"
    );
  });

  it("sends accepted for all start transaction requests", async () => {
    await app.handler(getEvent());
    const body = JSON.parse(apiClientCommand.Data);

    expect(body[2].idTagInfo.status).toEqual(ACCEPTED);
  });

  it("always sends 0 for transaction id", async () => {
    await app.handler(getEvent());
    const body = JSON.parse(apiClientCommand.Data);

    expect(body[2].transactionId).toEqual(0);
  });

  it("returns with messageId from request", async () => {
    const ocppMessage = JSON.parse(getEvent().body);
    await app.handler(getEvent());
    const body = JSON.parse(apiClientCommand.Data);

    expect(body[1]).toEqual(ocppMessage[messageIdIndex]);
  });

  const getEvent = () => {
    return {
      body:
        "[\n" +
        " 2,\n" +
        ' "4",\n' +
        ' "StartTransaction",\n' +
        " {\n" +
        ' "connectorId": 1,\n' +
        ' "idTag": "<idTag>",\n' +
        ' "timestamp": "2022-05-12T04:25:15.675Z",\n' +
        ' "meterStart": 2100,\n' +
        ' "reservationId": null\n' +
        " }\n" +
        "]",
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
});
