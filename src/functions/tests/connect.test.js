/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
//  import {mockClient} from 'aws-sdk-client-mock';
//  const AWS = require('aws-sdk-mock');
 const app = require('../connect/app');

 describe('Connect Service Tests', () => {

    afterEach(() => {
        delete process.env.TABLE_NAME;
        AWS.restore();
    });

    it('requires request headers', () => {
        const response = app.handler(getEventNoHeaders());
        expect(response.statusCode).toEqual(400);
    });

    it('requires sec-websocket-protocol header', () => {
        const response = app.handler(getEventNoProtocolHeader());
        expect(response.statusCode).toEqual(400);
    });

    it('denies sec-websocket-protocol header other than ocpp1.6', () => {
        const response = app.handler(getEventWithWrongProtocol());
        expect(response.statusCode).toEqual(400);
    });

    it('accepts sec-websocket-protocol header when ocpp1.6', () => {
        const response = app.handler(getEvent());
        expect(response.statusCode).toEqual(200);
    });

    // it('calls ddb client.put with required chargeBoxId and connectionId and connected Items', () => {
    //     process.env.TABLE_NAME = 'table-name';
    //     let putParams;
    //     AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
    //         putParams = params;
    //         callback(null,  {pk: 'foo', sk: 'bar' });
    //     });
    //     app.handler(getEvent());

    //     expect(putParams.Item.chargeBoxId)
    //         .toEqual(getEvent().queryStringParameters.chargeBoxId);
        
    //     expect(putParams.Item.connectionId)
    //         .toEqual(getEvent().requestContext.connectionId);

    //     expect(putParams.Item.webSocketConnectionStatus)
    //         .toEqual('connected');
    // });

    // it('calls sns publish with connect event', () => {
    //     process.env.TOPIC_ARN = 'a-topic-arn';
        
    // });

 });

 const getEventWithCorrectProtocol = () => {
    return {
        headers: {
          'Cache-Control': 'no-cache',
          Host: 'hgpxqrgly6.execute-api.us-west-2.amazonaws.com',
          Origin: 'null',
          Pragma: 'no-cache',
          'Sec-Websocket-Protocol' : 'ocpp1.6',
          'Sec-WebSocket-Key': '6bCFIs+lNJ525LyVIC+jJg==',
          'Sec-WebSocket-Version': '13',
          'User-Agent': 'Amazon CloudFront',
          Via: '1.1 6a61a95fc72bace4f0e3a262ec56c15e.cloudfront.net (CloudFront)',
          'X-Amz-Cf-Id': 'KDNnOOAKucg5Gv5XLg2T9URHeEJ2eY3yWoLbapMHT1DADFk1JELn6Q==',
          'X-Amzn-Trace-Id': 'Root=1-6259c8f3-2b279caf08777dbe0908e956',
          'X-Forwarded-For': '107.184.187.122, 64.252.73.37',
          'X-Forwarded-Port': '443',
          'X-Forwarded-Proto': 'https'
        }
    }  
 }

 const getEventWithWrongProtocol = () => {
    return {
        headers: {
          'Cache-Control': 'no-cache',
          Host: 'hgpxqrgly6.execute-api.us-west-2.amazonaws.com',
          Origin: 'null',
          Pragma: 'no-cache',
          'Sec-Websocket-Protocol' : 'wrong-protocol',
          'Sec-WebSocket-Key': '6bCFIs+lNJ525LyVIC+jJg==',
          'Sec-WebSocket-Version': '13',
          'User-Agent': 'Amazon CloudFront',
          Via: '1.1 6a61a95fc72bace4f0e3a262ec56c15e.cloudfront.net (CloudFront)',
          'X-Amz-Cf-Id': 'KDNnOOAKucg5Gv5XLg2T9URHeEJ2eY3yWoLbapMHT1DADFk1JELn6Q==',
          'X-Amzn-Trace-Id': 'Root=1-6259c8f3-2b279caf08777dbe0908e956',
          'X-Forwarded-For': '107.184.187.122, 64.252.73.37',
          'X-Forwarded-Port': '443',
          'X-Forwarded-Proto': 'https'
        }
    }  
 }

 const getEventNoProtocolHeader = () => {
    return {
        headers: {
          'Cache-Control': 'no-cache',
          Host: 'hgpxqrgly6.execute-api.us-west-2.amazonaws.com',
          Origin: 'null',
          Pragma: 'no-cache',
          'Sec-WebSocket-Key': '6bCFIs+lNJ525LyVIC+jJg==',
          'Sec-WebSocket-Version': '13',
          'User-Agent': 'Amazon CloudFront',
          Via: '1.1 6a61a95fc72bace4f0e3a262ec56c15e.cloudfront.net (CloudFront)',
          'X-Amz-Cf-Id': 'KDNnOOAKucg5Gv5XLg2T9URHeEJ2eY3yWoLbapMHT1DADFk1JELn6Q==',
          'X-Amzn-Trace-Id': 'Root=1-6259c8f3-2b279caf08777dbe0908e956',
          'X-Forwarded-For': '107.184.187.122, 64.252.73.37',
          'X-Forwarded-Port': '443',
          'X-Forwarded-Proto': 'https'
        }
    }  
 }

 const getEventNoHeaders = () => {
    return {
        multiValueHeaders: {
            'Cache-Control': [ 'no-cache' ],
            Host: [ 'hgpxqrgly6.execute-api.us-west-2.amazonaws.com' ],
            Origin: [ 'null' ],
            Pragma: [ 'no-cache' ],
            'Sec-WebSocket-Key': [ '6bCFIs+lNJ525LyVIC+jJg==' ],
            'Sec-WebSocket-Version': [ '13' ],
            'User-Agent': [ 'Amazon CloudFront' ],
            Via: [
            '1.1 6a61a95fc72bace4f0e3a262ec56c15e.cloudfront.net (CloudFront)'
            ],
            'X-Amz-Cf-Id': [ 'KDNnOOAKucg5Gv5XLg2T9URHeEJ2eY3yWoLbapMHT1DADFk1JELn6Q==' ],
            'X-Amzn-Trace-Id': [ 'Root=1-6259c8f3-2b279caf08777dbe0908e956' ],
            'X-Forwarded-For': [ '107.184.187.122, 64.252.73.37' ],
            'X-Forwarded-Port': [ '443' ],
            'X-Forwarded-Proto': [ 'https' ]
        },
        queryStringParameters: { chargeBoxId: 'one' },
        multiValueQueryStringParameters: { chargeBoxId: [ 'one' ] },
        requestContext: {
            routeKey: '$connect',
            eventType: 'CONNECT',
            extendedRequestId: 'QoxWEFWuvHcF8Dg=',
            requestTime: '15/Apr/2022:19:35:15 +0000',
            messageDirection: 'IN',
            stage: 'dev',
            connectedAt: 1650051315410,
            requestTimeEpoch: 1650051315411,
            identity: { userAgent: 'Amazon CloudFront', sourceIp: '64.252.73.37' },
            requestId: 'QoxWEFWuvHcF8Dg=',
            domainName: 'hgpxqrgly6.execute-api.us-west-2.amazonaws.com',
            connectionId: 'QoxWEdnmPHcCJkw=',
            apiId: 'hgpxqrgly6'
        },
        isBase64Encoded: false
    };       
 };

 const getEvent = () => {
    return {
        headers: {
          'Cache-Control': 'no-cache',
          Host: 'hgpxqrgly6.execute-api.us-west-2.amazonaws.com',
          Origin: 'null',
          Pragma: 'no-cache',
          'Sec-Websocket-Protocol' : 'ocpp1.6',
          'Sec-WebSocket-Key': '6bCFIs+lNJ525LyVIC+jJg==',
          'Sec-WebSocket-Version': '13',
          'User-Agent': 'Amazon CloudFront',
          Via: '1.1 6a61a95fc72bace4f0e3a262ec56c15e.cloudfront.net (CloudFront)',
          'X-Amz-Cf-Id': 'KDNnOOAKucg5Gv5XLg2T9URHeEJ2eY3yWoLbapMHT1DADFk1JELn6Q==',
          'X-Amzn-Trace-Id': 'Root=1-6259c8f3-2b279caf08777dbe0908e956',
          'X-Forwarded-For': '107.184.187.122, 64.252.73.37',
          'X-Forwarded-Port': '443',
          'X-Forwarded-Proto': 'https'
        },
        multiValueHeaders: {
          'Cache-Control': [ 'no-cache' ],
          Host: [ 'hgpxqrgly6.execute-api.us-west-2.amazonaws.com' ],
          Origin: [ 'null' ],
          Pragma: [ 'no-cache' ],
          'Sec-WebSocket-Key': [ '6bCFIs+lNJ525LyVIC+jJg==' ],
          'Sec-WebSocket-Version': [ '13' ],
          'User-Agent': [ 'Amazon CloudFront' ],
          Via: [
            '1.1 6a61a95fc72bace4f0e3a262ec56c15e.cloudfront.net (CloudFront)'
          ],
          'X-Amz-Cf-Id': [ 'KDNnOOAKucg5Gv5XLg2T9URHeEJ2eY3yWoLbapMHT1DADFk1JELn6Q==' ],
          'X-Amzn-Trace-Id': [ 'Root=1-6259c8f3-2b279caf08777dbe0908e956' ],
          'X-Forwarded-For': [ '107.184.187.122, 64.252.73.37' ],
          'X-Forwarded-Port': [ '443' ],
          'X-Forwarded-Proto': [ 'https' ]
        },
        queryStringParameters: { chargeBoxId: 'one' },
        multiValueQueryStringParameters: { chargeBoxId: [ 'one' ] },
        requestContext: {
          routeKey: '$connect',
          eventType: 'CONNECT',
          extendedRequestId: 'QoxWEFWuvHcF8Dg=',
          requestTime: '15/Apr/2022:19:35:15 +0000',
          messageDirection: 'IN',
          stage: 'dev',
          connectedAt: 1650051315410,
          requestTimeEpoch: 1650051315411,
          identity: { userAgent: 'Amazon CloudFront', sourceIp: '64.252.73.37' },
          requestId: 'QoxWEFWuvHcF8Dg=',
          domainName: 'hgpxqrgly6.execute-api.us-west-2.amazonaws.com',
          connectionId: 'QoxWEdnmPHcCJkw=',
          apiId: 'hgpxqrgly6'
        },
        isBase64Encoded: false
      };
 };