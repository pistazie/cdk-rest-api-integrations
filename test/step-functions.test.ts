import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as sfn from '@aws-cdk/aws-stepfunctions';

import {haveResourceLike, SynthUtils} from '@aws-cdk/assert';
import {expect as expectCDK} from "@aws-cdk/assert/lib/expect"
import {StepFunctionsRestApiIntegration} from "../lib"

test('snapshot test: Step Functions integration as expected', () => {

    const {stack, stateMachine, restApiResource} = givenStackRestApiResourceAndStaeteMachine()

    new StepFunctionsRestApiIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource,
        stateMachine: stateMachine
    })

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('it respects custom request templates properties', () => {

    const {stack, stateMachine, restApiResource} = givenStackRestApiResourceAndStaeteMachine()

    new StepFunctionsRestApiIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource,
        stateMachine: stateMachine,
        requestTemplates: {
             "application/json": "{\"stateMachineArn\":\"leet\",\"input\":\"$util.escapeJavaScript($input.body)\"}"
        }
    })

    expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Method", {
        "Integration": {"RequestTemplates": {  "application/json": "{\"stateMachineArn\":\"leet\",\"input\":\"$util.escapeJavaScript($input.body)\"}"}}
    }))
});

function givenStackRestApiResourceAndStaeteMachine() {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const restApi = new apigateway.RestApi(stack, 'testRestApi')
    const restApiResource = restApi.root.addResource("testResource")

    const waitX = new sfn.Wait(stack, 'Wait X Seconds', {
        time: sfn.WaitTime.secondsPath('$.waitSeconds'),
    });
    const stateMachine = new sfn.StateMachine(stack,'testStateMachine',{
        definition: waitX
    })
    return {stack, stateMachine, restApiResource}
}
