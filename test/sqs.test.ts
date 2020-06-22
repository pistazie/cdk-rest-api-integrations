import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as sqs from '@aws-cdk/aws-sqs';

import {haveResourceLike, SynthUtils} from '@aws-cdk/assert';
import {SqsRestApiIntegration} from "../lib/sqs"
import {expect as expectCDK} from "@aws-cdk/assert/lib/expect"

test('snapshot test: SQS integration as expected', () => {

    const {stack, queue, restApiResource} = givenStackRestApiResourceAndQueue()

    new SqsRestApiIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource,
        queue: queue
    })

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('sqs  it respects custom request templates properties', () => {

    const {stack, queue, restApiResource} = givenStackRestApiResourceAndQueue()

    new SqsRestApiIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource,
        queue: queue,
        requestTemplates: {
            "application/leet": "Message=$util.urlEncode($input.body)"
        }
    })

    expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Method", {
        "Integration": {"RequestTemplates": { "application/leet": "Message=$util.urlEncode($input.body)"}}
    }))
});

function givenStackRestApiResourceAndQueue() {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const restApi = new apigateway.RestApi(stack, 'testRestApi')
    const restApiResource = restApi.root.addResource("testResource")
    const queue = new sqs.Queue(stack,'testQueue')
    return {stack, restApi, queue, restApiResource}
}
