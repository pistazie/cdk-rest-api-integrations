import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core';
import {GenericRestApiAwsIntegration, GenericRestApiAwsIntegrationProps} from "./generic-rest-api-aws-integration"

/**
 * Integrates an SQS Queue with ApiGateway (RestApi) by publishing Queue messages on http request
 */
export interface SqsRestApiIntegrationProps extends GenericRestApiAwsIntegrationProps {
    /**
     * The target SQS Queue to which messages will be sent by the RestApi Integration
     */
    queue: sqs.IQueue;

    /**
     *  Integration request mapping templates
     *
     *  reference: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
     *
     *  @default {"application/json": "Action=SendMessage&MessageBody=$util.urlEncode(\"$input.body\")"}
     */
    requestTemplates?: { [contentType: string]: string; };
}

export class SqsRestApiIntegration extends GenericRestApiAwsIntegration {

    constructor(scope: cdk.Construct, id: string, props: SqsRestApiIntegrationProps) {
        super(scope, id, props);
    }

    init(id: string, props: SqsRestApiIntegrationProps) : void {

        this.requestTemplates = props.requestTemplates
            || {"application/json": "Action=SendMessage&MessageBody=$util.urlEncode(\"$input.body\")"}
        this.successResponseTemplates["application/json"] = "{\"status\":\"message received\", \"messageId\": $input.json('SendMessageResponse.SendMessageResult.MessageId')}"
        this.failureResponseTemplates["application/json"] = "{\"status\":\"failed to process message\")}"
        this.integrationPath = cdk.Aws.ACCOUNT_ID + "/" + props.queue.queueName
        this.awsService = "sqs"
    }

    configureAwsService(id: string, props: SqsRestApiIntegrationProps) : void {
        props.queue.grantSendMessages(this.integrationRole)
    }
}
