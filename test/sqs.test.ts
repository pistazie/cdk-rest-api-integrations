import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as sqs from '@aws-cdk/aws-sqs';

import {SynthUtils} from '@aws-cdk/assert';
import {SqsRestApiIntegration} from "../lib/sqs"

test('snapshot test: SQS integration as expected', () => {

    const {stack, queue, restApiResource} = givenStackRestApiResourceAndQueue()

    new SqsRestApiIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource,
        queue: queue
    })

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

function givenStackRestApiResourceAndQueue() {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const restApi = new apigateway.RestApi(stack, 'testRestApi')
    const restApiResource = restApi.root.addResource("testResource")
    const queue = new sqs.Queue(stack,'testQueue')
    return {stack, restApi, queue, restApiResource}
}
