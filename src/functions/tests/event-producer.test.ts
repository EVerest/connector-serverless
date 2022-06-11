/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { PublishBatchCommand } from "@aws-sdk/client-sns";
import { DynamoDBStreamEvent } from "aws-lambda";
import * as app from "../event-producer";

let params: string;
let constructorReturn: any;

jest.mock("@aws-sdk/client-sns", () => {
  return {
    SNSClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((_command?: any) => {
          return constructorReturn;
        }),
      };
    }),
    PublishBatchCommand: jest.fn().mockImplementation((p: any) => {
      params = p;
      return {};
    }),
  };
});

jest.mock("crypto", () => {
  return {
    randomUUID: jest.fn(() => "a-random-uuid"),
  };
});

describe("Database Change Event Producer Tests", () => {
  process.env.TOPIC_ARN = "a-topic-arn";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sends one message, get right params", async () => {
    app.handler(getEvent());

    expect(params).toEqual(getParams());
  });

  it("accepts an undefined record image and throws an error", async () => {
    const event = getUndefinedImageEvent();

    await expect(app.handler(event)).rejects.toThrow();
  });

  it("accepts two record sets", async () => {
    const events = get2RecordsEvents();
    app.handler(events);

    expect(PublishBatchCommand).toBeCalledTimes(1);
  });
});

const get2RecordsEvents = () => {
  return {
    Records: [
      {
        eventID: "33dd90df4706f196627f962d8c8d820b",
        eventName: "MODIFY",
        eventVersion: "1.1",
        eventSource: "aws:dynamodb",
        awsRegion: "us-west-2",
        dynamodb: {
          ApproximateCreationDateTime: 1651616487,
          Keys: {
            chargeBoxId: {
              S: "dog",
            },
          },
          NewImage: {
            connectionId: {
              S: "RkekBev0PHcCGrA=",
            },
            evse: {
              M: {
                isBase64Encoded: {
                  BOOL: false,
                },
                requestContext: {
                  M: {
                    routeKey: {
                      S: "BootNotification",
                    },
                    messageId: {
                      S: "RkZ5fd5RvHcCGWA=",
                    },
                    eventType: {
                      S: "MESSAGE",
                    },
                    extendedRequestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    requestTime: {
                      S: "03/May/2022:21:49:35 +0000",
                    },
                    messageDirection: {
                      S: "IN",
                    },
                    stage: {
                      S: "dev",
                    },
                    connectedAt: {
                      N: "1651614552677",
                    },
                    requestTimeEpoch: {
                      N: "1651614575739",
                    },
                    identity: {
                      M: {
                        sourceIp: {
                          S: "64.252.72.208",
                        },
                        userAgent: {
                          S: "Amazon CloudFront",
                        },
                      },
                    },
                    requestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    domainName: {
                      S: "tdxd1qivqd.execute-api.us-west-2.amazonaws.com",
                    },
                    connectionId: {
                      S: "RkZ14dZOvHcCGWA=",
                    },
                    apiId: {
                      S: "tdxd1qivqd",
                    },
                  },
                },
                requestId: {
                  S: "4",
                },
                action: {
                  S: "BootNotification",
                },
                body: {
                  M: {
                    chargePointModel: {
                      S: "Test Model",
                    },
                    chargePointVendor: {
                      S: "EV-BOX",
                    },
                    firmwareVersion: {
                      S: "1.0",
                    },
                  },
                },
                callType: {
                  N: "2",
                },
              },
            },
            webSocketConnectionStatus: {
              S: "connected",
            },
            chargeBoxId: {
              S: "dog",
            },
          },
          OldImage: {
            connectionId: {
              S: "RkZ14dZOvHcCGWA=",
            },
            evse: {
              M: {
                isBase64Encoded: {
                  BOOL: false,
                },
                requestContext: {
                  M: {
                    routeKey: {
                      S: "BootNotification",
                    },
                    messageId: {
                      S: "RkZ5fd5RvHcCGWA=",
                    },
                    eventType: {
                      S: "MESSAGE",
                    },
                    extendedRequestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    requestTime: {
                      S: "03/May/2022:21:49:35 +0000",
                    },
                    messageDirection: {
                      S: "IN",
                    },
                    stage: {
                      S: "dev",
                    },
                    connectedAt: {
                      N: "1651614552677",
                    },
                    requestTimeEpoch: {
                      N: "1651614575739",
                    },
                    identity: {
                      M: {
                        sourceIp: {
                          S: "64.252.72.208",
                        },
                        userAgent: {
                          S: "Amazon CloudFront",
                        },
                      },
                    },
                    requestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    domainName: {
                      S: "tdxd1qivqd.execute-api.us-west-2.amazonaws.com",
                    },
                    connectionId: {
                      S: "RkZ14dZOvHcCGWA=",
                    },
                    apiId: {
                      S: "tdxd1qivqd",
                    },
                  },
                },
                requestId: {
                  S: "4",
                },
                action: {
                  S: "BootNotification",
                },
                body: {
                  M: {
                    chargePointModel: {
                      S: "Test Model",
                    },
                    chargePointVendor: {
                      S: "EV-BOX",
                    },
                    firmwareVersion: {
                      S: "1.0",
                    },
                  },
                },
                callType: {
                  N: "2",
                },
              },
            },
            webSocketConnectionStatus: {
              S: "disconnected",
            },
            chargeBoxId: {
              S: "dog",
            },
          },
          SequenceNumber: "4822800000000003074885967",
          SizeBytes: 1303,
          StreamViewType: "NEW_AND_OLD_IMAGES",
        },
        eventSourceARN:
          "arn:aws:dynamodb:us-west-2:835324381490:table/evse-table/stream/2022-05-03T21:39:01.687",
      },
      {
        eventID: "33dd90df4706f196627f962d8c8d820b",
        eventName: "MODIFY",
        eventVersion: "1.1",
        eventSource: "aws:dynamodb",
        awsRegion: "us-west-2",
        dynamodb: {
          ApproximateCreationDateTime: 1651616487,
          Keys: {
            chargeBoxId: {
              S: "dog",
            },
          },
          NewImage: {
            connectionId: {
              S: "RkekBev0PHcCGrA=",
            },
            evse: {
              M: {
                isBase64Encoded: {
                  BOOL: false,
                },
                requestContext: {
                  M: {
                    routeKey: {
                      S: "BootNotification",
                    },
                    messageId: {
                      S: "RkZ5fd5RvHcCGWA=",
                    },
                    eventType: {
                      S: "MESSAGE",
                    },
                    extendedRequestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    requestTime: {
                      S: "03/May/2022:21:49:35 +0000",
                    },
                    messageDirection: {
                      S: "IN",
                    },
                    stage: {
                      S: "dev",
                    },
                    connectedAt: {
                      N: "1651614552677",
                    },
                    requestTimeEpoch: {
                      N: "1651614575739",
                    },
                    identity: {
                      M: {
                        sourceIp: {
                          S: "64.252.72.208",
                        },
                        userAgent: {
                          S: "Amazon CloudFront",
                        },
                      },
                    },
                    requestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    domainName: {
                      S: "tdxd1qivqd.execute-api.us-west-2.amazonaws.com",
                    },
                    connectionId: {
                      S: "RkZ14dZOvHcCGWA=",
                    },
                    apiId: {
                      S: "tdxd1qivqd",
                    },
                  },
                },
                requestId: {
                  S: "4",
                },
                action: {
                  S: "BootNotification",
                },
                body: {
                  M: {
                    chargePointModel: {
                      S: "Test Model",
                    },
                    chargePointVendor: {
                      S: "EV-BOX",
                    },
                    firmwareVersion: {
                      S: "1.0",
                    },
                  },
                },
                callType: {
                  N: "2",
                },
              },
            },
            webSocketConnectionStatus: {
              S: "connected",
            },
            chargeBoxId: {
              S: "dog",
            },
          },
          OldImage: {
            connectionId: {
              S: "RkZ14dZOvHcCGWA=",
            },
            evse: {
              M: {
                isBase64Encoded: {
                  BOOL: false,
                },
                requestContext: {
                  M: {
                    routeKey: {
                      S: "BootNotification",
                    },
                    messageId: {
                      S: "RkZ5fd5RvHcCGWA=",
                    },
                    eventType: {
                      S: "MESSAGE",
                    },
                    extendedRequestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    requestTime: {
                      S: "03/May/2022:21:49:35 +0000",
                    },
                    messageDirection: {
                      S: "IN",
                    },
                    stage: {
                      S: "dev",
                    },
                    connectedAt: {
                      N: "1651614552677",
                    },
                    requestTimeEpoch: {
                      N: "1651614575739",
                    },
                    identity: {
                      M: {
                        sourceIp: {
                          S: "64.252.72.208",
                        },
                        userAgent: {
                          S: "Amazon CloudFront",
                        },
                      },
                    },
                    requestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    domainName: {
                      S: "tdxd1qivqd.execute-api.us-west-2.amazonaws.com",
                    },
                    connectionId: {
                      S: "RkZ14dZOvHcCGWA=",
                    },
                    apiId: {
                      S: "tdxd1qivqd",
                    },
                  },
                },
                requestId: {
                  S: "4",
                },
                action: {
                  S: "BootNotification",
                },
                body: {
                  M: {
                    chargePointModel: {
                      S: "Test Model",
                    },
                    chargePointVendor: {
                      S: "EV-BOX",
                    },
                    firmwareVersion: {
                      S: "1.0",
                    },
                  },
                },
                callType: {
                  N: "2",
                },
              },
            },
            webSocketConnectionStatus: {
              S: "disconnected",
            },
            chargeBoxId: {
              S: "dog",
            },
          },
          SequenceNumber: "4822800000000003074885967",
          SizeBytes: 1303,
          StreamViewType: "NEW_AND_OLD_IMAGES",
        },
        eventSourceARN:
          "arn:aws:dynamodb:us-west-2:835324381490:table/evse-table/stream/2022-05-03T21:39:01.687",
      },
    ],
  } as DynamoDBStreamEvent;
};

const getEvent = () => {
  return {
    Records: [
      {
        eventID: "33dd90df4706f196627f962d8c8d820b",
        eventName: "MODIFY",
        eventVersion: "1.1",
        eventSource: "aws:dynamodb",
        awsRegion: "us-west-2",
        dynamodb: {
          ApproximateCreationDateTime: 1651616487,
          Keys: {
            chargeBoxId: {
              S: "dog",
            },
          },
          NewImage: {
            connectionId: {
              S: "RkekBev0PHcCGrA=",
            },
            evse: {
              M: {
                isBase64Encoded: {
                  BOOL: false,
                },
                requestContext: {
                  M: {
                    routeKey: {
                      S: "BootNotification",
                    },
                    messageId: {
                      S: "RkZ5fd5RvHcCGWA=",
                    },
                    eventType: {
                      S: "MESSAGE",
                    },
                    extendedRequestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    requestTime: {
                      S: "03/May/2022:21:49:35 +0000",
                    },
                    messageDirection: {
                      S: "IN",
                    },
                    stage: {
                      S: "dev",
                    },
                    connectedAt: {
                      N: "1651614552677",
                    },
                    requestTimeEpoch: {
                      N: "1651614575739",
                    },
                    identity: {
                      M: {
                        sourceIp: {
                          S: "64.252.72.208",
                        },
                        userAgent: {
                          S: "Amazon CloudFront",
                        },
                      },
                    },
                    requestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    domainName: {
                      S: "tdxd1qivqd.execute-api.us-west-2.amazonaws.com",
                    },
                    connectionId: {
                      S: "RkZ14dZOvHcCGWA=",
                    },
                    apiId: {
                      S: "tdxd1qivqd",
                    },
                  },
                },
                requestId: {
                  S: "4",
                },
                action: {
                  S: "BootNotification",
                },
                body: {
                  M: {
                    chargePointModel: {
                      S: "Test Model",
                    },
                    chargePointVendor: {
                      S: "EV-BOX",
                    },
                    firmwareVersion: {
                      S: "1.0",
                    },
                  },
                },
                callType: {
                  N: "2",
                },
              },
            },
            webSocketConnectionStatus: {
              S: "connected",
            },
            chargeBoxId: {
              S: "dog",
            },
          },
          OldImage: {
            connectionId: {
              S: "RkZ14dZOvHcCGWA=",
            },
            evse: {
              M: {
                isBase64Encoded: {
                  BOOL: false,
                },
                requestContext: {
                  M: {
                    routeKey: {
                      S: "BootNotification",
                    },
                    messageId: {
                      S: "RkZ5fd5RvHcCGWA=",
                    },
                    eventType: {
                      S: "MESSAGE",
                    },
                    extendedRequestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    requestTime: {
                      S: "03/May/2022:21:49:35 +0000",
                    },
                    messageDirection: {
                      S: "IN",
                    },
                    stage: {
                      S: "dev",
                    },
                    connectedAt: {
                      N: "1651614552677",
                    },
                    requestTimeEpoch: {
                      N: "1651614575739",
                    },
                    identity: {
                      M: {
                        sourceIp: {
                          S: "64.252.72.208",
                        },
                        userAgent: {
                          S: "Amazon CloudFront",
                        },
                      },
                    },
                    requestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    domainName: {
                      S: "tdxd1qivqd.execute-api.us-west-2.amazonaws.com",
                    },
                    connectionId: {
                      S: "RkZ14dZOvHcCGWA=",
                    },
                    apiId: {
                      S: "tdxd1qivqd",
                    },
                  },
                },
                requestId: {
                  S: "4",
                },
                action: {
                  S: "BootNotification",
                },
                body: {
                  M: {
                    chargePointModel: {
                      S: "Test Model",
                    },
                    chargePointVendor: {
                      S: "EV-BOX",
                    },
                    firmwareVersion: {
                      S: "1.0",
                    },
                  },
                },
                callType: {
                  N: "2",
                },
              },
            },
            webSocketConnectionStatus: {
              S: "disconnected",
            },
            chargeBoxId: {
              S: "dog",
            },
          },
          SequenceNumber: "4822800000000003074885967",
          SizeBytes: 1303,
          StreamViewType: "NEW_AND_OLD_IMAGES",
        },
        eventSourceARN:
          "arn:aws:dynamodb:us-west-2:835324381490:table/evse-table/stream/2022-05-03T21:39:01.687",
      },
    ],
  } as DynamoDBStreamEvent;
};

const getUndefinedImageEvent = () => {
  return {
    Records: [
      {
        eventID: "33dd90df4706f196627f962d8c8d820b",
        eventName: "MODIFY",
        eventVersion: "1.1",
        eventSource: "aws:dynamodb",
        awsRegion: "us-west-2",
        dynamodb: {
          ApproximateCreationDateTime: 1651616487,
          Keys: {
            chargeBoxId: {
              S: "dog",
            },
          },
          OldImage: {
            connectionId: {
              S: "RkZ14dZOvHcCGWA=",
            },
            evse: {
              M: {
                isBase64Encoded: {
                  BOOL: false,
                },
                requestContext: {
                  M: {
                    routeKey: {
                      S: "BootNotification",
                    },
                    messageId: {
                      S: "RkZ5fd5RvHcCGWA=",
                    },
                    eventType: {
                      S: "MESSAGE",
                    },
                    extendedRequestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    requestTime: {
                      S: "03/May/2022:21:49:35 +0000",
                    },
                    messageDirection: {
                      S: "IN",
                    },
                    stage: {
                      S: "dev",
                    },
                    connectedAt: {
                      N: "1651614552677",
                    },
                    requestTimeEpoch: {
                      N: "1651614575739",
                    },
                    identity: {
                      M: {
                        sourceIp: {
                          S: "64.252.72.208",
                        },
                        userAgent: {
                          S: "Amazon CloudFront",
                        },
                      },
                    },
                    requestId: {
                      S: "RkZ5fESRvHcFhGg=",
                    },
                    domainName: {
                      S: "tdxd1qivqd.execute-api.us-west-2.amazonaws.com",
                    },
                    connectionId: {
                      S: "RkZ14dZOvHcCGWA=",
                    },
                    apiId: {
                      S: "tdxd1qivqd",
                    },
                  },
                },
                requestId: {
                  S: "4",
                },
                action: {
                  S: "BootNotification",
                },
                body: {
                  M: {
                    chargePointModel: {
                      S: "Test Model",
                    },
                    chargePointVendor: {
                      S: "EV-BOX",
                    },
                    firmwareVersion: {
                      S: "1.0",
                    },
                  },
                },
                callType: {
                  N: "2",
                },
              },
            },
            webSocketConnectionStatus: {
              S: "disconnected",
            },
            chargeBoxId: {
              S: "dog",
            },
          },
          SequenceNumber: "4822800000000003074885967",
          SizeBytes: 1303,
          StreamViewType: "NEW_AND_OLD_IMAGES",
        },
        eventSourceARN:
          "arn:aws:dynamodb:us-west-2:835324381490:table/evse-table/stream/2022-05-03T21:39:01.687",
      },
    ],
  } as DynamoDBStreamEvent;
};

const getParams = () => {
  return {
    TopicArn: "a-topic-arn",
    PublishBatchRequestEntries: [
      {
        Id: "a-random-uuid",
        Message:
          '{"connectionId":"RkekBev0PHcCGrA=","evse":{"isBase64Encoded":false,"requestContext":{"routeKey":"BootNotification","messageId":"RkZ5fd5RvHcCGWA=","eventType":"MESSAGE","extendedRequestId":"RkZ5fESRvHcFhGg=","requestTime":"03/May/2022:21:49:35 +0000","messageDirection":"IN","stage":"dev","connectedAt":1651614552677,"requestTimeEpoch":1651614575739,"identity":{"sourceIp":"64.252.72.208","userAgent":"Amazon CloudFront"},"requestId":"RkZ5fESRvHcFhGg=","domainName":"tdxd1qivqd.execute-api.us-west-2.amazonaws.com","connectionId":"RkZ14dZOvHcCGWA=","apiId":"tdxd1qivqd"},"requestId":"4","action":"BootNotification","body":{"chargePointModel":"Test Model","chargePointVendor":"EV-BOX","firmwareVersion":"1.0"},"callType":2},"webSocketConnectionStatus":"connected","chargeBoxId":"dog"}',
      },
    ],
  };
};
