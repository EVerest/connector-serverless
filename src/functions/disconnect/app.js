const AWS = require('aws-sdk');
const { TOPIC_ARN } = process.env;
exports.handler = async event => {
  console.log("Event: ", event)
  const sns = new AWS.SNS();
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

  const deleteParams = {
    TableName: process.env.TABLE_NAME,
    Key: { connectionId: event.requestContext.connectionId },
    ReturnValues: 'ALL_OLD'
  };
  const result = await ddb.delete(deleteParams).promise();

  const disconnectedEvent = {
    connectionId : event.requestContext.connectionId,
    timestamp     : event.requestContext.requestTimeEpoch,
    chargeBoxId   : result.Attributes.connection.chargeBoxId,
    action        : 'disconnected'
  }

  const snsParams = {
    Message: JSON.stringify(disconnectedEvent),
    TopicArn: TOPIC_ARN
  };
  await sns.publish(snsParams).promise();

  return { statusCode: 200, body: 'Ok' };
};