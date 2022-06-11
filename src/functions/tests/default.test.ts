/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import * as app from "../default-lambda";

let snsCommand = "";
let throwError = false;
let updateParams: string;
let queryParams: string;

jest.mock("@aws-sdk/client-sns", () => {
  return {
    SNSClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((_command: PublishCommand) => {
          return {};
        }),
      };
    }),
    PublishCommand: jest.fn().mockImplementation((p: any) => {
      snsCommand = p;
      return {};
    }),
  };
});

jest.mock("@aws-sdk/client-dynamodb", () => {
  return {
    DynamoDBClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation((_command?: any) => {
          if (throwError) {
            throw new Error();
          }
          return {
            Items: [{ chargeBoxId: { S: "a-charge-box-id" } }],
          };
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

describe("Default Service Tests", () => {
  beforeEach(() => {
    throwError = false;
  });

  it("sends unknown but correctly formatted message", () => {
    app.handler(getEvent());
    expect(SNSClient).toHaveBeenCalledTimes(1);
  });

  it.skip("denies if db client error", async () => {
    throwError = true;
    const response = app.handler(getEvent());
    expect((await response).statusCode).toEqual(400);
  });
});

const getEvent = () => {
  var event = { body: [] } as any;
  event.body[0] = 2;
  event.body[1] = "1";
  event.body[2] = "an-unknown-action";
  event.body[3] = {
    chargePointVendor: "EV-BOX",
    chargePointModel: "Test Model",
    firmwareVersion: "1.0",
  };
  return event;
};
