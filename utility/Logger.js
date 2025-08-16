// logger.js
import { CloudWatchLogsClient, CreateLogStreamCommand, PutLogEventsCommand, CreateLogGroupCommand } from "@aws-sdk/client-cloudwatch-logs";

const client = new CloudWatchLogsClient({ region: "us-east-1" }); // change region

const logGroupName = "/ec2/scraper";
const logStreamName = "docker-run-sh";

let sequenceToken;

async function init() {
  // Ensure Log Group exists
  try {
    await client.send(new CreateLogGroupCommand({ logGroupName }));
  } catch (err) {
    if (err.name !== "ResourceAlreadyExistsException") {
      console.error("Error creating log group:", err);
    }
  }

  // Ensure Log Stream exists
  try {
    await client.send(new CreateLogStreamCommand({ logGroupName, logStreamName }));
  } catch (err) {
    if (err.name !== "ResourceAlreadyExistsException") {
      console.error("Error creating log stream:", err);
    }
  }
}

export async function logToCloudWatch(message) {
  await init();

  const params = {
    logEvents: [
      {
        message,
        timestamp: Date.now(),
      },
    ],
    logGroupName,
    logStreamName,
    sequenceToken,
  };

  try {
    const response = await client.send(new PutLogEventsCommand(params));
    sequenceToken = response.nextSequenceToken;
  } catch (err) {
    console.error("Error sending logs:", err);
  }
}
