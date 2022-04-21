exports.handler = async event => {
  console.log("Request Transformer Event: " + JSON.stringify(event));

  let response = event.Records[0].cf.request;
  response.querystring = 'chargeBoxId=' + response.uri.replace('/', '')
  response.uri = '/dev';

  return response;
};