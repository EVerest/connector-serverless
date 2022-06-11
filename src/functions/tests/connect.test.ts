/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import * as app from "../connect";

let updateParams: string;
let queryReturn: any;
let throwError = false;

beforeEach(() => {
  queryReturn = {
    Items: [{ chargeBoxId: { S: "a-charge-box-id" } }],
  };
  throwError = false;
});

jest.mock("@aws-sdk/client-dynamodb", () => {
  return {
    DynamoDBClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((_command?: any) => {
          if (throwError) {
            throw new Error();
          }
          return queryReturn;
        }),
      };
    }),
    UpdateItemCommand: jest.fn().mockImplementation((p: any) => {
      updateParams = p;
    }),
  };
});

describe("Connect Service Tests", () => {
  it("requires sec-websocket-protocol header", async () => {
    const response = app.handler(getEventEmptyProtocolHeader());
    expect((await response).statusCode).toEqual(400);
  });

  it("denies sec-websocket-protocol header other than ocpp1.6", async () => {
    const response = app.handler(getEventWithWrongProtocol());
    expect((await response).statusCode).toEqual(400);
  });

  it("denies if db client error", async () => {
    throwError = true;
    const response = app.handler(getEventWithCorrectProtocol());
    expect((await response).statusCode).toEqual(400);
  });

  it("accepts sec-websocket-protocol header when ocpp1.6", async () => {
    const response = app.handler(getEventWithCorrectProtocol());
    expect((await response).statusCode).toEqual(200);
  });

  it("rejects when no chargeBoxId", async () => {
    const response = app.handler(getEventNoChargeBoxId());
    expect((await response).statusCode).toEqual(400);
  });

  it("calls ddb", async () => {
    process.env.TABLE_NAME = "table-name";
    await app.handler(getEventWithCorrectProtocol());
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
  });

  it("saves as connected when connected", async () => {
    process.env.TABLE_NAME = "table-name";
    await app.handler(getEventWithCorrectProtocol());

    expect(updateParams).toHaveProperty(
      "UpdateExpression",
      "set requestContext = :w, connectionId = :c"
    );
    expect(updateParams).toHaveProperty("Key", {
      chargeBoxConnectorId: { S: "cbid##0" },
    });
  });

  const getEventNoChargeBoxId = () => {
    let event = {
      headers: {},
      requestContext: {},
    } as any;

    event.headers["sec-websocket-protocol"] = "ocpp1.6";
    event.requestContext["connectionId"] = "a-connection-id";

    return event;
  };

  const getEventWithCorrectProtocol = () => {
    let event = {
      headers: {},
      queryStringParameters: {},
      requestContext: {},
    } as any;

    event.headers["sec-websocket-protocol"] = "ocpp1.6";
    event.queryStringParameters["chargeBoxId"] = "cbid";
    event.requestContext["connectionId"] = "a-connection-id";

    return event;
  };

  const getEventEmptyProtocolHeader = () => {
    var event = { headers: {} } as any;
    event.headers["sec-websocket-protocol"] = "";

    return event;
  };

  const getEventWithWrongProtocol = () => {
    var event = { headers: {} } as any;
    event.headers["sec-websocket-protocol"] = "incorrect-protocol";

    return event;
  };
});

/**connect untypedEvent:  {
  headers: {
    'Cache-Control': 'no-cache',
    Host: 'ottk3t1xll.execute-api.us-west-2.amazonaws.com',
    Origin: 'null',
    Pragma: 'no-cache',
    'Sec-WebSocket-Key': '7RQ6yx/YxAUcGQVCupOWcg==',
    'Sec-WebSocket-Protocol': 'ocpp1.6',
    'Sec-WebSocket-Version': '13',
    'User-Agent': 'Amazon CloudFront',
    Via: '1.1 17753d816fe7a4cad7bdc58f607b1510.cloudfront.net (CloudFront)',
    'X-Amz-Cf-Id': '38cwZc5OvSk8UOi4hP196nvm0BsRgJgFn213tW8MWM_CIN63SEsjRg==',
    'X-Amzn-Trace-Id': 'Root=1-626cb813-121a057a3c54417755fbcb41',
    'X-Forwarded-For': '107.184.187.122, 64.252.123.253',
    'X-Forwarded-Port': '443',
    'X-Forwarded-Proto': 'https'
  },
  multiValueHeaders: {
    'Cache-Control': [ 'no-cache' ],
    Host: [ 'ottk3t1xll.execute-api.us-west-2.amazonaws.com' ],
    Origin: [ 'null' ],
    Pragma: [ 'no-cache' ],
    'Sec-WebSocket-Key': [ '7RQ6yx/YxAUcGQVCupOWcg==' ],
    'Sec-WebSocket-Protocol': [ 'ocpp1.6' ],
    'Sec-WebSocket-Version': [ '13' ],
    'User-Agent': [ 'Amazon CloudFront' ],
    Via: [
      '1.1 17753d816fe7a4cad7bdc58f607b1510.cloudfront.net (CloudFront)'
    ],
    'X-Amz-Cf-Id': [ '38cwZc5OvSk8UOi4hP196nvm0BsRgJgFn213tW8MWM_CIN63SEsjRg==' ],
    'X-Amzn-Trace-Id': [ 'Root=1-626cb813-121a057a3c54417755fbcb41' ],
    'X-Forwarded-For': [ '107.184.187.122, 64.252.123.253' ],
    'X-Forwarded-Port': [ '443' ],
    'X-Forwarded-Proto': [ 'https' ]
  },
  queryStringParameters: { chargeBoxId: 'two' },
  multiValueQueryStringParameters: { chargeBoxId: [ 'two' ] },
  requestContext: {
    routeKey: '$connect',
    eventType: 'CONNECT',
    extendedRequestId: 'RYGzEEl-vHcFoxg=',
    requestTime: '30/Apr/2022:04:16:19 +0000',
    messageDirection: 'IN',
    stage: 'dev',
    connectedAt: 1651292179479,
    requestTimeEpoch: 1651292179480,
    identity: { userAgent: 'Amazon CloudFront', sourceIp: '64.252.123.253' },
    requestId: 'RYGzEEl-vHcFoxg=',
    domainName: 'ottk3t1xll.execute-api.us-west-2.amazonaws.com',
    connectionId: 'RYGzEcSNvHcCH8A=',
    apiId: 'ottk3t1xll'
  },
  isBase64Encoded: false
} */
