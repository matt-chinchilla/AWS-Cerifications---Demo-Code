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
        ReceiveMessageWaitTimeSeconds: '20',
        VisibilityTimeout: '60'
    }
};
sqs.createQueue(params, function(err, data) { //createQueue function takes two parameters: params and a callback function
    if (err)
        console.log(err, err.stack);
    else{
        console.log('Successfully created SQS queue URL ' + data.QueueUrl); // successful response
        createMessages(data.QueueUrl);
    }
});

// Making the createMessages function
async function createMessages(queueUrl) {
    var messages = [];
    for (var a=0; a<50; a++){ 
        messages[a] = 'This is the content for message ' + a + '.';
    }
    // Asynchronously send messages to the SQS queue
    for(const message of messages){ // for of loop
        // console.log(message) // Prints each message
        var params;
        console.log('Sending message ' + message)
        params = {
            MessageBody: message, /*required*/
            QueueUrl: queueUrl
        };
        await sqs.sendMessage(params, function(err, data) { // Wait until callback
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
        });
    }
}