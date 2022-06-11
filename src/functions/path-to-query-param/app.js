exports.handler = async event => {
  let response = event.Records[0].cf.request;
  // /dev/chargeBoxId
  const chargeBoxId = response.uri.substring(response.uri.lastIndexOf('/') + 1);
  response.querystring = 'chargeBoxId=' + chargeBoxId;
  return response;
};