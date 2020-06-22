import * as sns from '@aws-cdk/aws-sns';
import * as cdk from '@aws-cdk/core';
import {GenericRestApiAwsIntegration, GenericRestApiAwsIntegrationProps} from "./generic-rest-api-aws-integration"

/**
 * Integrates an SNS Topic with ApiGateway(RestApi) by publishing Topic messages on http request
 */
export interface SnsRestApiIntegrationProps extends GenericRestApiAwsIntegrationProps {
    /**
     * The target SNS Topic to which messages will be published by the RestApi Integration
     */
    topic: sns.Topic;

    /**
     *  Integration request mapping templates
     *
     *  reference: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
     *
     *  @default {"application/json": "Action=Publish&TopicArn=$util.urlEncode('" + props.topic.topicArn + "')&Message=$util.urlEncode($input.body)"}
     */
    requestTemplates?: { [contentType: string]: string; };

}

export class SnsRestApiIntegration extends GenericRestApiAwsIntegration {

    constructor(scope: cdk.Construct, id: string, props: SnsRestApiIntegrationProps) {
        super(scope, id, props);
    }

    init(id: string, props: SnsRestApiIntegrationProps) : void {
        this.requestTemplates = props.requestTemplates
            || {"application/json": "Action=Publish&TopicArn=$util.urlEncode('" + props.topic.topicArn + "')&Message=$util.urlEncode($input.body)"}
        this.successResponseTemplates["application/json"] = "{\"status\":\"message received\", \"messageId\": $input.json('PublishResponse.PublishResult.MessageId')}"
        this.failureResponseTemplates["application/json"] = "{\"status\":\"failed to process message\")}"
        this.integrationPath="/"
        this.awsService = "sns"
    }

    configureAwsService(id: string, props: SnsRestApiIntegrationProps): void {
        props.topic.grantPublish(this.integrationRole)
    }
}
