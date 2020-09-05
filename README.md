![Test](https://github.com/pistazie/cdk-rest-api-integrations/workflows/Test/badge.svg)
[![npm version](https://badge.fury.io/js/cdk-rest-api-integrations.svg)](https://badge.fury.io/js/cdk-rest-api-integrations)

# Aws CDK RestApi 👉🏽 Aws Service integration constructs

This CDK constructs library integrates AWS RestApi (a.k.a ApiGateway) with other AWS Services directly (without the need for a lambda function or any other application).

By integrating a service in this way we can easily, reliably and securely (using RestApi features) expose an AWS Service functionality via HTTP.

A common use case is integrating SNS to receive messages via HTTP.

## Supported integrations
* SNS (PublishMessage)
* SQS (SendMessage)
* more coming soon, [add an issue](https://github.com/pistazie/cdk-rest-api-integrations/issues) to ask for one you need.

## Install
```bash
    $ npm install cdk-rest-api-integrations --save
``` 

## How to use - SNS

Add an SNS Topic and a RestApi to your stack, integrate them using a **SnsRestApiIntegration** construct:
```javascript
    // add the RestApi and Topic to be integrated with each other
    const restApi = new apigateway.RestApi(this, 'myRestApi')
    const myResource = restApi.root.addResource('myResource');
    const topic = new sns.Topic(this, "myTopic")

    // add the integration
    new SnsRestApiIntegration(this, 'mySnsIntegration', {
            topic: topic,
            restApiResource: myResource
    })
```

After deploying your CDK stack you can publish messages to the SNS Topic via HTTP:
```bash
    $ curl -X POST https://xxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod/myResource \
        --header 'Content-Type: application/json' \
        --data-raw '{"cdk":"rocks"}'
```

## How to use - SQS

Add an SQS Queue and a RestApi to your stack, integrate them using a **SqsRestApiIntegration** construct:

```javascript
    // add the RestApi and Queue to be integrated with each other
    const restApi = new apigateway.RestApi(this, 'myRestApi')
    const myResource = restApi.root.addResource('myResource');
    const queue = new sqs.Queue(this, "myQueue")

    // add the integration
    new SqsRestApiIntegration(this, 'mySqsIntegration', {
            queue: queue,
            restApiResource: myResource
    })
```

After deploying your CDK stack you can publish messages to the SQS Queue via HTTP:
```bash
    $ curl -X POST https://xxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod/myResource \
        --header 'Content-Type: application/json' \
        --data-raw '{"cdk":"rocks"}'
```

## How to use - Kinesis Stream

Add a Kinesis Stream and a RestApi to your stack, integrate them using a **KinesisRestApiIntegration** construct:

```javascript
    // add the RestApi and Queue to be integrated with each other
    const restApi = new apigateway.RestApi(this, 'myRestApi')
    const myResource = restApi.root.addResource('myResource')
    const stream = new kinesis.Stream(this, "myStream");

    // add the integration
    new SqsRestApiIntegration(this, 'mySqsIntegration', {
            stream: stream,
            restApiResource: myResource
    })
```

After deploying your CDK stack you can publish messages to the SQS Queue via HTTP:
```bash
    $ curl -X POST https://xxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod/myResource \
        --header 'Content-Type: application/json' \
        --data-raw '{"cdk":"rocks"}'
```

## How to use - Step Functions State Machine

Add a Step Functions StateMachine and a RestApi to your stack, integrate them using a **StepFunctionsRestApiIntegration** construct:

```javascript
    // add the RestApi 
    const restApi = new apigateway.RestApi(this, 'myRestApi')
    const myResource = restApi.root.addResource('myResource')

    // add a Step Functions StateMachine
    const stateMachine = new sfn.StateMachine(this, 'StateMachine', {
          definition: new sfn.Wait(this, 'Wait X Seconds', {
            time: sfn.WaitTime.secondsPath('$.waitSeconds'),
          }),
          timeout: Duration.minutes(5)
    })

    //add the integration
    new StepFunctionsRestApiIntegration(this, 'myStepFunctionsIntegration', {
           stateMachine : stateMachine,
           restApiResource: myResource
    })
```

After deploying your CDK stack you can start an execution via HTTP:
```bash
    $ curl -X POST https://xxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod/myResource \
        --header 'Content-Type: application/json' \
        --data-raw '{"waitSeconds": 4}'
```

 