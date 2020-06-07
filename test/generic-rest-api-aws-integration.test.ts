import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';

import {GenericRestApiAwsIntegration, GenericRestApiAwsIntegrationProps} from "../lib/generic-rest-api-aws-integration"

import {expect as expectCDK, haveResourceLike, ResourcePart} from '@aws-cdk/assert';

test('test integration creates a proper AWS::ApiGateway::Method resource', () => {

    const {stack, restApi, restApiResource} = givenStackRestApiAndResource()

    const testIntegration = new TestIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource
    })

    expectIntegrationMethod(stack, restApi, testIntegration)
});

test('test integration creates proper AWS::IAM::Role and AWS::IAM::Policy resources to facilitate the integration', () => {

    const {stack, restApiResource} = givenStackRestApiAndResource()

    new TestIntegration(stack, 'testIntegration', {
        restApiResource: restApiResource
    })

    expectIntegrationRole(stack)
    expectIntegrationPolicy(stack)
});

function expectIntegrationMethod(stack: cdk.Stack, restApi: apigateway.RestApi, testIntegration: TestIntegration) {

    expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Method", {
        "HttpMethod": "POST",
        "RestApiId": {
            "Ref": stack.getLogicalId(restApi.node.findChild('Resource') as cdk.CfnElement)
        },
        "AuthorizationType": "NONE",
        "Integration": {
            "Credentials": {
                "Fn::GetAtt": [
                    stack.getLogicalId(testIntegration.integrationRole.node.findChild('Resource') as cdk.CfnElement),
                    "Arn"
                ]
            },
            "IntegrationHttpMethod": "POST",
            "IntegrationResponses": [
                {
                    "ResponseTemplates": {
                        "application/json": "{\"status\":\"failed to process message\")}"
                    },
                    "SelectionPattern": "",
                    "StatusCode": "503"
                },
                {
                    "ResponseTemplates": {
                        "application/json": "{\"status\":\"message received\", \"messageId\": $input.json('$')}"
                    },
                    "SelectionPattern": "200",
                    "StatusCode": "200"
                }
            ],
            "PassthroughBehavior": "NEVER",
            "RequestParameters": {
                "integration.request.header.Content-Type": "'application/x-www-form-urlencoded'"
            },
            "RequestTemplates": {
                "application/json": "Action=doIt"
            },
            "Type": "AWS",
            "Uri": {
                "Fn::Join": [
                    "",
                    [
                        "arn:",
                        {
                            "Ref": "AWS::Partition"
                        },
                        ":apigateway:",
                        {
                            "Ref": "AWS::Region"
                        },
                        ":test:path//"
                    ]
                ]
            },

        },
        "MethodResponses": [
            {
                "ResponseModels": {
                    "application/json": "Empty"
                },
                "StatusCode": "503"
            },
            {
                "ResponseModels": {
                    "application/json": "Empty"
                },
                "StatusCode": "200"
            }
        ]
    }, ResourcePart.Properties));
}

function expectIntegrationRole(stack: cdk.Stack) {

    expectCDK(stack).to(haveResourceLike("AWS::IAM::Role", {
        "AssumeRolePolicyDocument": {
            "Statement": [
                {
                    "Action": "sts:AssumeRole",
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "apigateway.amazonaws.com"
                    }
                }
            ]
        }
    }, ResourcePart.Properties))

}

function expectIntegrationPolicy(stack: cdk.Stack) {

    expectCDK(stack).to(haveResourceLike("AWS::IAM::Policy", {
        "PolicyDocument": {
            "Statement": [
                {
                    "Action": "testService:testActionNr1",
                    "Effect": "Allow"
                }
            ]
        },
    }, ResourcePart.Properties))
}

function givenStackRestApiAndResource() {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");
    const restApi = new apigateway.RestApi(stack, 'testRestApi')
    const restApiResource = restApi.root.addResource("testResource")
    return {stack, restApi, restApiResource}
}

class TestIntegration extends GenericRestApiAwsIntegration{

    protected configureAwsService(id: string, props: GenericRestApiAwsIntegrationProps): void {
        this.integrationRole.addToPrincipalPolicy( new iam.PolicyStatement({
                    actions: ["testService:testActionNr1"]
        }))
    }

    protected init(id: string, props: GenericRestApiAwsIntegrationProps): void {
        this.requestTemplates["application/json"] = "Action=doIt"
        this.successResponseTemplates["application/json"] = "{\"status\":\"message received\", \"messageId\": $input.json('$')}"
        this.failureResponseTemplates["application/json"] = "{\"status\":\"failed to process message\")}"
        this.integrationPath="/"
        this.awsService = "test"
    }

    constructor(scope: cdk.Construct, id: string, props: GenericRestApiAwsIntegrationProps) {
        super(scope, id, props)
    }
}