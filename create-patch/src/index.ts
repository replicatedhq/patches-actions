import * as AWS from 'aws-sdk';
import * as core from '@actions/core'; // Import this only if you are inside a GitHub Action

function parsebranchPendingPatch(input: string): { appSlug: string, channelSlug: string } {
    const parts = input.split('/');

    // Check if the string is in the expected format
    if (parts.length !== 4 || parts[0] !== 'app' || parts[2] !== 'channel') {
        throw new Error('Input string is not in the expected format.');
    }

    const appSlug = parts[1];
    const channelSlug = parts[3];

    return { appSlug, channelSlug };
}

async function run() {
  const awsRegion = core.getInput('aws-region')
  const queueUrl = core.getInput('sqs-queue-url')
  const awsAccessKeyID = core.getInput('aws-access-key-id')
  const awsSecretAccessKey = core.getInput('aws-secret-access-key')

  const { appSlug, channelSlug } = parsebranchPendingPatch(core.getInput('branch-pending-patch'));

  const message = {
    appSlug: appSlug,
    channelSlug: channelSlug,
    patchDescription: core.getInput('patch-description')
  };

  AWS.config.update({
    region: awsRegion,
    accessKeyId: awsAccessKeyID,
    secretAccessKey: awsSecretAccessKey
  });

  const sqs = new AWS.SQS();

  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message) // Send your message as a JSON string
  };

  try {
    console.log(`App Slug: ${appSlug}, Channel Slug: ${channelSlug}, Patch Description: ${message.patchDescription}`);
    const data = await sqs.sendMessage(params).promise();
    console.log('Message sent successfully for', data.MessageId);
  } catch (error) {
    console.error('Error sending message', error);
  }
}

run();
