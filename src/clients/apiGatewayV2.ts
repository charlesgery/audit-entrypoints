import {
  ApiGatewayV2Client,
  GetApisCommand,
  GetRoutesCommand,
  GetRoutesCommandOutput,
  Route,
} from "@aws-sdk/client-apigatewayv2";

import { Options } from "../types";

const isAuthenticated = (route: Route) => {
  const isApiKeyRequired = route.ApiKeyRequired === true;
  const hasAuthorizerId = route.AuthorizerId !== undefined;
  const hasAuthorizationType = route.AuthorizationType !== undefined;

  return isApiKeyRequired || hasAuthorizerId || hasAuthorizationType;
};

const formatRoutes = (apiRoutes: GetRoutesCommandOutput) => {
  return apiRoutes.Items?.map((route) => ({
    path: route.RouteKey,
    authenticated: isAuthenticated(route),
  }));
};

const audit = async (options: Options) => {
  const apiGatewayClientv2 = new ApiGatewayV2Client({});

  const getApisCommand = new GetApisCommand({});
  const apis = await apiGatewayClientv2.send(getApisCommand);

  if (apis.Items) {
    const resources = await Promise.all(
      apis.Items.map(async (api) => {
        const getRoutesCommand = new GetRoutesCommand({ ApiId: api.ApiId });
        const apiRoutes = await apiGatewayClientv2.send(getRoutesCommand);

        const formattedRoutes = formatRoutes(apiRoutes);

        return {
          resourceName: api.Name,
          routes: formattedRoutes,
        };
      })
    );

    return {
      service: "APIGatewayV2",
      resources,
    };
  }
};

export default audit;
