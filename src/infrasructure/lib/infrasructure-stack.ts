import { Duration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AssetCode, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription, SqsSubscriptionProps } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { experimental } from 'aws-cdk-lib/aws-cloudfront';
// import { EdgeFunction } from 'aws-cdk-lib/aws-cloudfront/lib/experimental';
import { CachePolicy, Distribution, LambdaEdgeEventType, OriginRequestCookieBehavior, OriginRequestHeaderBehavior, OriginRequestPolicy, OriginRequestQueryStringBehavior } from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';

const NODE_RUNTIME_VERSION  = Runtime.NODEJS_14_X;
const HANDLER               = 'app.handler';

export class InfrasructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sqsSubscriptionProps: SqsSubscriptionProps = { rawMessageDelivery: true }
    const connectionQueue = new Queue(this, 'connection-queue', { queueName: 'connection-queue' });
    const connectionTopic = new Topic(this, 'connection-topic', { displayName: 'connection-topic' });
    const connectionSubscription: SqsSubscription = new SqsSubscription(connectionQueue, sqsSubscriptionProps);
    connectionTopic.addSubscription(connectionSubscription);

    const evseTableName = 'evse-table'
    const evseTable = new Table(this, evseTableName, {
      billingMode   : BillingMode.PAY_PER_REQUEST,
      tableName     : evseTableName,
      removalPolicy : RemovalPolicy.DESTROY,
      partitionKey  : { name: "chargeBoxId", type: AttributeType.STRING }
    });

    const connect = new Function(this, 'connect', {
      code        : new AssetCode('../functions/connect'),
      runtime     : NODE_RUNTIME_VERSION,
      handler     : HANDLER,
      description : 'connect',
      timeout     : Duration.seconds(5),
      memorySize  : 256,
      environment : { TABLE_NAME: evseTableName, TOPIC_ARN: connectionTopic.topicArn },
      logRetention : RetentionDays.ONE_DAY
    }); 
    Tags.of(connect).add('function-name', 'connect');

    const disconnect = new Function(this, 'disconnect', {
      code        : new AssetCode('../functions/disconnect'),
      runtime     : NODE_RUNTIME_VERSION,
      handler     : HANDLER,
      description : 'disconnect',
      timeout     : Duration.seconds(5),
      memorySize  : 256,
      environment : { TABLE_NAME: evseTableName, TOPIC_ARN: connectionTopic.topicArn },
      logRetention : RetentionDays.ONE_DAY
    })

    // const defaultHandler = new Function(this, 'default', {
    //   code        : new AssetCode('../functions/default'),
    //   runtime     : NODE_RUNTIME_VERSION,
    //   handler     : HANDLER,
    //   timeout     : Duration.seconds(5),
    //   memorySize  : 256,
    //   environment : { TABLE_NAME: evseTableName },
    //   description : 'default-handler',
    //   logRetention : RetentionDays.ONE_DAY
    // })

    const webSocketApi = new WebSocketApi(this, 'ocpp-websocket-gateway', {
      connectRouteOptions     : { integration: new WebSocketLambdaIntegration('ConnectIntegration', connect) },
      disconnectRouteOptions  : { integration: new WebSocketLambdaIntegration('DisconnectIntegration',disconnect) },
      // defaultRouteOptions     : { integration: new WebSocketLambdaIntegration('DefaultIntegration', defaultHandler) },
      routeSelectionExpression: '$request.body.[2]'
    });

    const stage = new WebSocketStage(this, 'dev-stage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true,
    });

    const ocppOriginRequestPolicy = new OriginRequestPolicy(this, 'ocppWebSocketPolicy', {
      originRequestPolicyName: 'ocppWebSocketPolicy',
      cookieBehavior: OriginRequestCookieBehavior.none(),
      headerBehavior: OriginRequestHeaderBehavior.allowList('Sec-WebSocket-Key', 'Sec-WebSocket-Version', 'Sec-WebSocket-Protocol', 'Sec-WebSocket-Accept'),
      queryStringBehavior: OriginRequestQueryStringBehavior.all(),
    });

    // Must bootstrap region us-east-1 for this to deploy properly
    // cdk bootstrap aws://aws-account-number/us-east-1
    const pathToQueryParam = new experimental.EdgeFunction(this, 'derp-path-to-query-param-edge-lambda-stack-us-east-1', {
      runtime: NODE_RUNTIME_VERSION,
      handler: HANDLER,
      code: new AssetCode('../functions/path-to-query-param'),
      stackId: 'derp-path-to-query-param-edge-lambda-stack-us-east-1',
      logRetention : RetentionDays.ONE_DAY,
    });

    const ocppCloudFrontDistribution = new Distribution(this, 'ocppCloudFrontDistribution', {
      defaultBehavior: { 
        origin: new HttpOrigin("n5p03xehv1.execute-api.us-west-2.amazonaws.com"),
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: ocppOriginRequestPolicy,
        edgeLambdas: [
          {
            functionVersion: pathToQueryParam.currentVersion,
            eventType: LambdaEdgeEventType.VIEWER_REQUEST,
            includeBody: true,
          }
        ] 
      },
    });
  }
}
