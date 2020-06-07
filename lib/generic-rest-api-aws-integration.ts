import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as apigateway from '@aws-cdk/aws-apigateway';

export interface GenericRestApiAwsIntegrationProps {
  /**
   * The RestApi resource to which a method will be added and integrated with the AWS service
   */
  restApiResource: apigateway.Resource;

  /**
   * The status code returned by RestApi on a successful request
   *
   * @default "200"
   */
  successResponseStatusCode?: string;

  /**
   * The status code returned by RestApi on a failing request
   *
   * @default "503"
   */
  failureResponseStatusCode?: string;

}

export abstract class GenericRestApiAwsIntegration extends cdk.Construct {
  /** @returns RestApi::Method to which the AwsIntegration was integrated to */
  protected readonly restApiMethod: apigateway.Method;

  protected abstract configureAwsService(id:string, props: GenericRestApiAwsIntegrationProps) : void;
  protected abstract init(id:string, props: GenericRestApiAwsIntegrationProps) : void;

  // configured in init method
  protected awsService: string
  protected integrationHttpVerb = 'POST'
  protected integrationPath = "/"
  protected requestTemplates: { [contentType: string]: string; } = {}
  protected successResponseTemplates: { [contentType: string]: string; } = {}
  protected failureResponseTemplates: { [contentType: string]: string; } = {}

  public readonly integrationRole: iam.IRole

  protected constructor(scope: cdk.Construct, id: string, props: GenericRestApiAwsIntegrationProps) {
    super(scope, id);

    this.init(id,props)
    this.integrationRole = this.addIntegrationRole(id)
    const awsIntegration = this.addIntegration(props)

    this.restApiMethod = props.restApiResource.addMethod(this.integrationHttpVerb, awsIntegration, {
      methodResponses: [{
        statusCode: props.failureResponseStatusCode || "503",
        responseModels: {
          "application/json": apigateway.Model.EMPTY_MODEL
        }
      }, {
        statusCode: props.successResponseStatusCode || "200",
        responseModels: {
          "application/json": apigateway.Model.EMPTY_MODEL
        }
      }
      ]
    })

    this.configureAwsService(id,props)
  }

  private addIntegration(props: GenericRestApiAwsIntegrationProps) {

    const awsIntegration = new apigateway.AwsIntegration({
      service: this.awsService,
      path: this.integrationPath,
      options: {
        credentialsRole: this.integrationRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestParameters: {
          "integration.request.header.Content-Type": "'application/x-www-form-urlencoded'"
        },
        // useful for working with these templates: http://mapping-template-checker.toqoz.net/
        // variable reference:  https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
        requestTemplates: this.requestTemplates,
        integrationResponses: [
          {
            statusCode: props.failureResponseStatusCode || "503",
            responseTemplates: this.failureResponseTemplates,
            // https://docs.aws.amazon.com/apigateway/api-reference/resource/integration-response/#selectionPattern
            selectionPattern: "" // --> this is the default response
          },
          {
            selectionPattern: "200",
            statusCode: props.successResponseStatusCode || "200",
            responseTemplates: this.successResponseTemplates
          }
        ]
      }
    })
    return awsIntegration
  }

  private addIntegrationRole(id: string) {
    return new iam.Role(this, `${id}-${this.awsService}-integration-role`, {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
    })
  }
}
