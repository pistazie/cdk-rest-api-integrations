import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as cdk from '@aws-cdk/core';
import {GenericRestApiAwsIntegration, GenericRestApiAwsIntegrationProps} from "./generic-rest-api-aws-integration"

/**
 * Integrates a Step Function with ApiGateway(RestApi) by starting an Execution on http request
 */
export interface StepFunctionsRestApiIntegrationProps extends GenericRestApiAwsIntegrationProps {
    /**
     * The target Step Functions StateMachine which will be executed by the RestApi Integration
     */
    stateMachine: sfn.StateMachine;

    /**
     *  Integration request mapping templates
     *
     *  reference: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
     *
     *  @default {"application/json": "Action=Publish&TopicArn=$util.urlEncode('" + props.stateMachine.topicArn + "')&Message=$util.urlEncode($input.body)"}
     */
    requestTemplates?: { [contentType: string]: string; };

}

export class StepFunctionsRestApiIntegration extends GenericRestApiAwsIntegration {

    constructor(scope: cdk.Construct, id: string, props: StepFunctionsRestApiIntegrationProps) {
        super(scope, id, props);
    }

    init(id: string, props: StepFunctionsRestApiIntegrationProps) : void {
        this.requestTemplates = props.requestTemplates ||  { "application/json": "{\"stateMachineArn\":\""+ props.stateMachine.stateMachineArn +"\",\"input\":\"$util.escapeJavaScript($input.body)\"}"}
        this.successResponseTemplates["application/json"] = "{\"status\":\"execution started\", \"executionId\": $input.json('$.executionArn').split(':')[7]}"
        this.failureResponseTemplates["application/json"] = "{\"status\":\"failed to start the execution\")}"
        this.integrationPath=undefined
        this.integrationAction = "StartExecution"
        this.awsService = "states"
    }

    configureAwsService(id: string, props: StepFunctionsRestApiIntegrationProps): void {
        props.stateMachine.grantStartExecution(this.integrationRole)
    }
}
