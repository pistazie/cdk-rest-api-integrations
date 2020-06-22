import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as sns from '@aws-cdk/aws-sns';

import {haveResourceLike, SynthUtils} from '@aws-cdk/assert';
import {SnsRestApiIntegration} from "../lib/sns"
import {expect as expectCDK} from "@aws-cdk/assert/lib/expect"

test('snapshot test: SNS integration as expected', () => {

    const {stack, topic, restApiResource} = givenStackRestApiResourceAndTopic()

    new SnsRestApiIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource,
        topic: topic
    })

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('it respects custom request templates properties', () => {

    const {stack, topic, restApiResource} = givenStackRestApiResourceAndTopic()

    new SnsRestApiIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource,
        topic: topic,
        requestTemplates: {
            "application/leet": "Message=$util.urlEncode($input.body)"
        }
    })

    expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Method", {
        "Integration": {"RequestTemplates": { "application/leet": "Message=$util.urlEncode($input.body)"}}
    }))
});

function givenStackRestApiResourceAndTopic() {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const restApi = new apigateway.RestApi(stack, 'testRestApi')
    const restApiResource = restApi.root.addResource("testResource")
    const topic = new sns.Topic(stack,'testTopic')
    return {stack, topic, restApiResource}
}
