```gfm
# insert project logo - replace the below logo location with the location of your logo
![](https://github.com/lf-energy/artwork/blob/master/projects/PROJECT NAME/PROJECT NAME-color.svg)
```

```gfm
# Add badges that point to your LICENSE, CII status, and build environment (if it exists). Check out other badges to add at https://shields.io/
![GitHub](https://img.shields.io/github/license/lfenergy/PROJECT NAME)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/CII ID/badge)](https://bestpractices.coreinfrastructure.org/projects/CII ID)
```

# OCPP Cloud Connector

The OCPP Cloud Connector is a cloud based implementation of the Open Charge Point Protocol, the de-facto standard for electric vehicle supply equipment (EVSE). The connector will supply a web socket connection in accordance with the specification and transform OCPP protocol specific messaging into a generic set of messages and events, allowing a developer or company to easily integrate EVSE control into new or existing infrastructure.

## Run Tests

- git clone git@github.com:ocpp-cloud-connector/connector-serverless.git
- yarn test connector-serverless/src/functions
- yarn test connector-serverless/src/infrastructure

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
