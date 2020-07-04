import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as kinesis from '@aws-cdk/aws-kinesis';

import {SynthUtils} from '@aws-cdk/assert';
import {KinesisRestApiIntegration} from "../lib"

test('snapshot test: Kinesis integration as expected', () => {

    const {stack, stream, restApiResource} = givenStackRestApiResourceAndQueue()

    new KinesisRestApiIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource,
        stream: stream
    })

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

function givenStackRestApiResourceAndQueue() {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const restApi = new apigateway.RestApi(stack, 'testRestApi')
    const restApiResource = restApi.root.addResource("testResource")
    const stream = new kinesis.Stream(stack, "testStream")
    return {stack, restApi, stream, restApiResource}
}
