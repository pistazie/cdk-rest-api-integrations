import * as kinesis from '@aws-cdk/aws-kinesis';
import * as cdk from '@aws-cdk/core';
import {GenericRestApiAwsIntegration, GenericRestApiAwsIntegrationProps} from "./generic-rest-api-aws-integration"

/**
 * Integrates a Kinesis Stream with ApiGateway (RestApi) by publishing Queue messages on http request
 */
export interface KinesisRestApiIntegrationProps extends GenericRestApiAwsIntegrationProps {
    /**
     * The target kinesis Queue to which messages will be sent by the RestApi Integration
     */
    stream: kinesis.Stream;
}

export class KinesisRestApiIntegration extends GenericRestApiAwsIntegration {

    constructor(scope: cdk.Construct, id: string, props: KinesisRestApiIntegrationProps) {
        super(scope, id, props);
    }

    init(id: string, props: KinesisRestApiIntegrationProps) : void {

        this.requestTemplates["application/json"] = "{\"StreamName\":\""+ props.stream.streamName +"\",\"Data\":\"$util.base64Encode($input.body)\",\"PartitionKey\":\"$context.requestId\"}"
        this.successResponseTemplates["application/json"] = "{\"status\":\"message received\", \"messageId\": $input.json('SequenceNumber')}"
        this.failureResponseTemplates["application/json"] = "{\"status\":\"failed to process message\")}"
        this.integrationPath = undefined
        this.integrationAction = "PutRecord"
        this.awsService = "kinesis"
    }

    configureAwsService(id: string, props: KinesisRestApiIntegrationProps) : void {
        props.stream.grantWrite(this.integrationRole)
    }
}
