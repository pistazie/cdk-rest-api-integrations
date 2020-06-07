# Aws CDK RestApi ↔️ Aws Service integration constructs

This CDK constructs library integrates AWS RestApi (a.k.a ApiGateway) with other AWS Services directly without the need for a lambda function.

## Install
```bash
    npm install cdk-rest-api-integrations --save
``` 

## How to use - SNS

Add the integration to your stack:
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
    curl -X POST https://xxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod/myResource \
        --header 'Content-Type: application/json' \
        --data-raw '{"cdk":"rocks"}'
```

## How to use - SQS

Add the integration to your stack:
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
    curl -X POST https://xxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod/myResource \
        --header 'Content-Type: application/json' \
        --data-raw '{"cdk":"rocks"}'
```

 