import { runApiGatewayV1Audit, runApiGatewayV2Audit } from "./clients";
import { Options } from "./types";

export const runAudits = async (options: Options): Promise<{ success: boolean }> => {
  console.log("Starting audits");

  const apiGatewayV1Audit = await runApiGatewayV1Audit(options);
  const apiGatewayV2Audit = await runApiGatewayV2Audit(options);

  console.log(JSON.stringify(apiGatewayV1Audit, null, 2));
  console.log(JSON.stringify(apiGatewayV2Audit, null, 2));

  return Promise.resolve({ success: true });
};
