import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as sns from '@aws-cdk/aws-sns';

import {SynthUtils} from '@aws-cdk/assert';
import {SnsRestApiIntegration} from "../lib/sns"

test('snapshot test: SNS integration as expected', () => {

    const {stack, topic, restApiResource} = givenStackRestApiResourceAndTopic()

    new SnsRestApiIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource,
        topic: topic
    })

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

function givenStackRestApiResourceAndTopic() {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const restApi = new apigateway.RestApi(stack, 'testRestApi')
    const restApiResource = restApi.root.addResource("testResource")
    const topic = new sns.Topic(stack,'testTopic')
    return {stack, topic, restApiResource}
}
