/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  PublishBatchCommand,
  PublishBatchCommandInput,
  PublishBatchRequestEntry,
  SNSClient,
} from "@aws-sdk/client-sns";
import { DynamoDBRecord, DynamoDBStreamEvent } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import * as crypto from "crypto";

const snsClient = new SNSClient({ region: process.env.REGION });

export const handler = async (event: DynamoDBStreamEvent) => {
  let entries: PublishBatchRequestEntry[] = [];
  event.Records.forEach((record: DynamoDBRecord) => {
    if (record.dynamodb?.NewImage == undefined) {
      throw Error("new image in db record undefined");
    }
    const entry = {
      Id: crypto.randomUUID(),
      Message: JSON.stringify(unmarshall(record.dynamodb?.NewImage as any)),
    } as PublishBatchRequestEntry;
    entries.push(entry);
  });

  let input = {
    TopicArn: process.env.TOPIC_ARN,
    PublishBatchRequestEntries: entries,
  } as PublishBatchCommandInput;

  try {
    await snsClient.send(new PublishBatchCommand(input));
  } catch (error) {
    console.log("error: ", error);
  }
};
