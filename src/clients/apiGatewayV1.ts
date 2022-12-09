import {
  APIGatewayClient,
  GetResourcesCommand,
  GetResourcesCommandOutput,
  GetRestApisCommand,
  Method,
} from "@aws-sdk/client-api-gateway";
import { Options } from "../types";

const isAuthenticated = (method: Method) => {
  const isApiKeyRequired = method.apiKeyRequired === true;
  const hasAuthorizerId = method.authorizerId !== undefined;
  const hasAuthorizationType = method.authorizationType !== undefined;

  return isApiKeyRequired || hasAuthorizerId || hasAuthorizationType;
};

const formatRoutes = (apiRoutes: GetResourcesCommandOutput) => {
  return apiRoutes.items?.map((route) => ({
    path: route.path,
    methods: route.resourceMethods
      ? Object.keys(route.resourceMethods).map((method) => ({
          method,
          authenticated: isAuthenticated(route.resourceMethods?.[method] as Method),
        }))
      : [],
  }));
};

const audit = async (options: Options) => {
  const apiGatewayClient = new APIGatewayClient({ region: "eu-west-1" });
  const getRestApisCommand = new GetRestApisCommand({});
  const restApis = await apiGatewayClient.send(getRestApisCommand);

  if (restApis.items) {
    const resources = await Promise.all(
      restApis.items.map(async (api) => {
        const getRoutesCommand = new GetResourcesCommand({ restApiId: api.id });
        const apiRoutes = await apiGatewayClient.send(getRoutesCommand);

        const formattedRoutes = formatRoutes(apiRoutes);

        return {
          resourceName: api.name,
          routes: formattedRoutes,
        };
      })
    );

    return {
      service: "APIGatewayV1",
      resources,
    };
  }
};

export default audit;
