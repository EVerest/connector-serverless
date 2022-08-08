```gfm
# insert project logo - replace the below logo location with the location of your logo
![](https://github.com/lf-energy/artwork/blob/master/projects/PROJECT NAME/PROJECT NAME-color.svg)
```

```gfm
# Add badges that point to your LICENSE, CII status, and build environment (if it exists). Check out other badges to add at https://shields.io/
![GitHub](https://img.shields.io/github/license/lfenergy/PROJECT NAME)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/CII ID/badge)](https://bestpractices.coreinfrastructure.org/projects/CII ID)
```

# OCPP Serverless Cloud Connector

The OCPP Cloud Connector is a cloud based implementation of the Open Charge Point Protocol, the de-facto standard for electric vehicle supply equipment (EVSE). The connector will supply a web socket connection in accordance with the specification and transform OCPP protocol specific messaging into a generic set of messages and events, allowing a developer or company to easily integrate EVSE control into new or existing infrastructure.

## Run Tests

The project is split into two section, infrustructure and functions.  Infrustructure is the AWS CDK constructs and infrustructure as code.  Functions are the functions that make up the individual services that are invoked when a specific OCPP event is consumed.  Both infrustructure and functions have unit tests.  

### Infrustrucure Tests

../src/infrustructure 
$yarn run test

This command runs jest test with the --watchAll flag

### Function Tests

../src/functions
$ yar run test

This command runs jest test with the --watchAll flag

## Deploy and Run

In order to deploy and run, you must first have an AWS account with admin privelidges.  
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
