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
        // Save queue url
        queueUrl = data.QueueUrl;
        // waitingSQS to false
        waitingSQS = false;
        createMessages(data.QueueUrl); // Creates content for the message body
    }
});

// Make a timer that can poll the SQS queue every 60 seconds
var waitingSQS = true;
var queueCounter = 0;

setInterval(function(){
    if (!waitingSQS){ // Still busy with previous request
        if (queueCounter <= 0){
            receiveMessages();
        }
        else{
            --queueCounter; // Reduce the counter
        }
    }
}, 1000); // Every 1000ms or 1s

// Create 50 SQS messages
async function createMessages(queueUrl){
    var messages = [];
    for (var a=0; a<5; a++){
        messages[a] = [];
        for (var b=0; b<10; b++){
            messages[a][b] = 'This is the content for message '+ (a*10+b) + '.';
        }
    }
    // Asynchronously deliver messages to SQS queue
    for (const message of messages){
        console.log('Sending message: '+ message)
        params = {
            Entries: [],
            QueueUrl: queueUrl /* required */
        };
    for (var b=0; b<10; b++){
        params.Entries.push({
            MessageBody: message [b],
            Id: 'Message'+ (messages.indexOf(message)*10+b)
            });
        }
    await sqs.sendMessageBatch(params, function(err, data) { // Wait until callback
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
         });
     }
    }

// Make the receive messages function
function receiveMessages(){
    var params = {
        QueueUrl: queueUrl, /* required */
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 60,
        WaitTimeSeconds: 20 // Wait time (in seconds) for messages to arrive
    };
    waitingSQS = true;
    sqs.receiveMessage(params, function(err, data) {
        if (err) {
            waitingSQS = false;
            console.log(err, err.stack); // an error occurred, console.log it out
        }
        else{
            if((typeof data.Messages !== 'undefined') && (data.Messages.length !== 0)/* if messages Array is not equal to 0 */) {
                console.log('Received ' + data.Messages.length // Tells me # of messages received
                    + ' messages from SQS queue.');
                processMessages(data.Messages);
            }
            else{
                queueCounter = 60; // Wait a min to call function again
                console.log('SQS queue empty, waiting for ' + queueCounter + 's.');
            }
        }
    });
}

// Make the processMessages function to process & delete messages from the queue
async function processMessages(messagesSQS) {
    for (const item of messagesSQS) {
        await console.log('Processing message: ' + item.Body); // Do something with the message
        var params = {
            QueueUrl: queueUrl, /* required */
            ReceiptHandle: item.ReceiptHandle /* required */
        };
        await sqs.deleteMessage(params, function(err, data) { // Wait until callback
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                if (data && data.ResponseMetadata) {
                    console.log('Deleted message RequestId: ' + JSON.stringify(data.ResponseMetadata.RequestId)); // successful response
                } else {
                    console.log('Deleted message but no RequestId returned');
                }
            }
        });
    }
}

// // Making the createMessages function
// async function createMessages(queueUrl) {
//     var messages = [];
//     for (var a=0; a<50; a++){ 
//         messages[a] = 'This is the content for message ' + a + '.';
//     }
//     // Asynchronously send messages to the SQS queue
//     for(const message of messages){ // for-of loop
//         // console.log(message) // Prints each message
//         var params;
//         console.log('Sending message ' + message)
//         params = {
//             MessageBody: message, /*required*/
//             QueueUrl: queueUrl
//         };
//         await sqs.sendMessage(params, function(err, data) { // Wait until callback
//         if (err) console.log(err, err.stack); // an error occurred
//         else     console.log(data);           // successful response
//         });
//     }
// }