exports.handler = async (event) => {
  let response = event.Records[0].cf.request;
  response.querystring = "chargeBoxId=" + response.uri.replace("/", "");
  response.uri = "/dev";
  return response;
};
