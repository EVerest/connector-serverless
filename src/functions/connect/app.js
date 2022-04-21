const { DynamoDBClient, BatchExecuteStatementCommand } = require('aws-sdk/client-dynamodb');

const client = new DynamoDBClient({region: "us-west-2"});
const lowerCaseProtocolHeader = 'sec-websocket-protocol';
const protocol = 'ocpp1.6';
export async function handler(event) {
  if (!protocolCheck(event.headers)) { return { statusCode: 400 }; }

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      chargeBoxId                 : event.queryStringParameters.chargeBoxId,
      connectionId                : event.requestContext.connectionId,
      webSocketConnectionStatus   : 'connected'
    }
  }; 
  const command = new BatchExecuteStatementCommand(params);

  try {
    const data = await client.send(command);
    console.log('data: ', data);
  } catch (error) {
    console.log('error: ', error)
  } finally {
    console.log("Whatever");
  }

  return { statusCode: 200, headers: { "Sec-WebSocket-Protocol" : protocol }}; 
}

const protocolCheck = (headersToCheck) => {
  if (headersToCheck != undefined) {
    const headers = toLowerCaseProperties(headersToCheck);
    
    if (headers[lowerCaseProtocolHeader] != undefined) {
        const subprotocolHeader = headers[lowerCaseProtocolHeader];
        const subprotocols = subprotocolHeader.split(',');
        
        if (subprotocols.indexOf(protocol) >= 0) {
          return true;
        }
    }
  }   
  return false;
}

const toLowerCaseProperties = (props) => {
  var lowerCaseProps = {};
  for (var key in props) {
      lowerCaseProps[key.toLowerCase()] = props[key];
  }
  return lowerCaseProps;
}    