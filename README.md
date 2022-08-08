# OCPP Serverless Cloud Connector

The OCPP Serverless Cloud Connector is a serverless and event driven implementation of the Open Charge Point Protocol, the de-facto standard for electric vehicle supply equipment (EVSE). The connector will supply a web socket connection in accordance with the specification and transform OCPP protocol specific messaging into a generic set of messages and events, allowing a developer or company to easily integrate EVSE control into new or existing infrastructure.

This project attempts to implement a [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) and [Event Driven](https://martinfowler.com/articles/201701-event-driven.html) model.  This means that OCPP message confirmations are treated as [Ack / Nack](https://en.wikipedia.org/wiki/Acknowledgement_(data_networks)), confirming that the system received the message, not confirming any action.  It is the implementors responsibility to confirm or deny access, authorization, or any other application logic decisions that are expected to be sent to the EVSE.

## Testing

The project is split into two sections, infrustructure and functions.  Infrustructure is the AWS CDK constructs and IAC (Infrustructure as Code).  Functions are the functions that make up the individual services that are invoked when a specific OCPP event is consumed.  Both infrustructure and functions have unit tests.  

### Infrustrucure Tests

../src/infrustructure 
$yarn run test

This command runs jest test with the --watchAll flag

### Function Tests

../src/functions
$ yar run test

This command runs jest test with the --watchAll flag

## Deploy and Run

In order to deploy and run, you must first have an AWS account with admin privileges.  
Always stay up to date with cdk versions
npm install -g aws-cdk

Must bootstrap region us-east-1 for this to deploy properly
cdk bootstrap aws://{your-aws-account-number}/us-east-1

To properly deploy, run in this order
1. cdk deploy ocpp-services
2. cdk deploy ocpp-cloudfront

To properly remove all resources, run in this order
1. cdk destroy ocpp-cloudfront
2. cdk destroy ocpp-services

We used an experimental Edge Lambda to move the path parameter (charge box id) to a query parameter in order to be able to use Websocket API.  When destrying the cloudfront distribution, AWS times out on the call and fails the destroy.  If you really need to remove the edge lambda, wait a few hours and delete the stack again and it will remove the lambda.  In most cases, there is no reason to remove the edge lambda, the console will allow you to retain the resource, then you can redeploy the stack or delete the resource later a few hours later.

## Discussion

You can connect with the community in a variety of ways...

- Slack Channel
- Something else

## Contributing
Anyone can contribute to the OCPP Cloud Connector project - learn more at [CONTRIBUTING.md](CONTRIBUTING.md)

## Governance
OCPP Cloud Connector is a project hosted by the [LF Energy Foundation](https://lfenergy.org). This project's techincal charter is located in [CHARTER.md](tsc/CHARTER.md) and has established it's own processes for managing day-to-day processes in the project at [GOVERNANCE.md](GOVERNANCE.md).

## Reporting Issues
To report a problem, you can open an [issue](https://github.com/ChargeNet-Stations/ocpp-cloud-connector/issues) in repository against a specific workflow.
