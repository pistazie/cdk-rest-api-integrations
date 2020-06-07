import * as sns from '@aws-cdk/aws-sns';
import * as cdk from '@aws-cdk/core';
import {GenericRestApiAwsIntegration, GenericRestApiAwsIntegrationProps} from "./generic-rest-api-aws-integration"

/**
 * Integrates an SNS Topic with ApiGateway(RestApi) by publishing Topic messages on http request
 */
export interface SnsApiAwsIntegrationProps extends GenericRestApiAwsIntegrationProps {
    /**
     * The target SNS Topic to which messages will be published by the RestApi Integration
     */
    topic: sns.Topic;
}

export class SnsApiAwsIntegration extends GenericRestApiAwsIntegration {

    constructor(scope: cdk.Construct, id: string, props: SnsApiAwsIntegrationProps) {
        super(scope, id, props);
    }

    init(id: string, props: SnsApiAwsIntegrationProps) : void {
        this.requestTemplates["application/json"] = "Action=Publish&TopicArn=$util.urlEncode('" + props.topic.topicArn + "')&Message=$util.urlEncode($input.body)"
        this.successResponseTemplates["application/json"] = "{\"status\":\"message received\", \"messageId\": $input.json('PublishResponse.PublishResult.MessageId')}"
        this.failureResponseTemplates["application/json"] = "{\"status\":\"failed to process message\")}"
        this.integrationPath="/"
        this.awsService = "sns"
    }

    configureAwsService(id: string, props: SnsApiAwsIntegrationProps): void {
        props.topic.grantPublish(this.integrationRole)
    }
}
