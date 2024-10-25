// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// If I was using Cloud9, I would have t make an IAM role for my EC2 instance
// Sounds like a skill issue :/

// Set region
AWS.config.region = 'us-east-1';

// Create an SQS service object
var sqs = new AWS.SQS();

// Create an SQS queue
var queueUrl;
var params = {
    QueueName: 'chirichella-lab',
    Attributes: {
        RecieveMessageWaitTimeSeconds: '20',
        VisbilityTimeout: '60'
    }
};
sqs.createQueue(params, function(err, data) { //createQueue function takes two parameters: params and a callback function
    if (err)
        console.log(err, err.stack);
    else{
        console.log('Successfully created SQS queue URL ' + data.QueueUrl); // successful response
    }
});