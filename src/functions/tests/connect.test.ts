/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import * as app from '../connect';

jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((_command: PutItemCommand) => { return {} }),
      }
    }),
    PutItemCommand: jest.fn().mockImplementation(() => { return {} }),
  }
});

describe('Connect Service Tests', () => {

  it('requires sec-websocket-protocol header', async () => {
    const response = app.handler(getEventEmptyProtocolHeader());
    expect((await response).statusCode).toEqual(400);
  });

  it('denies sec-websocket-protocol header other than ocpp1.6', async () => {
    const response = app.handler(getEventWithWrongProtocol());
    expect((await response).statusCode).toEqual(400);
  });

  it('accepts sec-websocket-protocol header when ocpp1.6', async () => {
    const response = app.handler(getEventWithCorrectProtocol());
    expect((await response).statusCode).toEqual(200);
  });

  it('rejects when no chargeBoxId', async () => {
    const response = app.handler(getEventNoChargeBoxId());
    expect((await response).statusCode).toEqual(400);
  });

  it('rejects when no connectionId', async () => {
    const response = app.handler(getEventNoConnectionId());
    expect((await response).statusCode).toEqual(400);
  });

  it('calls ddb', async () => {
    process.env.TABLE_NAME = 'table-name';
    await app.handler(getEventWithCorrectProtocol());
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
  });

  const getEventNoConnectionId = () => {
    let event = {
      headers: {},
      queryStringParameters: {},
      requestContext: {}
    } as any;

    event.headers['sec-websocket-protocol'] = 'ocpp1.6';
    event.queryStringParameters['chargeBoxId'] = 'cbid';

    return event;
  }

  const getEventNoChargeBoxId = () => {
    let event = {
      headers: {},
      queryStringParameters: {},
      requestContext: {}
    } as any;

    event.headers['sec-websocket-protocol'] = 'ocpp1.6';
    event.requestContext['connectionId'] = 'a-connection-id';

    return event;
  }

  const getEventWithCorrectProtocol = () => {
    let event = {
      headers: {},
      queryStringParameters: {},
      requestContext: {}
    } as any;

    event.headers['sec-websocket-protocol'] = 'ocpp1.6';
    event.queryStringParameters['chargeBoxId'] = 'cbid';
    event.requestContext['connectionId'] = 'a-connection-id';

    return event;
  }

  const getEventEmptyProtocolHeader = () => {
    var event = { headers: {} } as any;
    event.headers['sec-websocket-protocol'] = '';

    return event;
  }

  const getEventWithWrongProtocol = () => {
    var event = { headers: {} } as any;
    event.headers['sec-websocket-protocol'] = 'incorrect-protocol';

    return event;
  };

});

