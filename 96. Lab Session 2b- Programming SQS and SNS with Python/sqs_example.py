# Load the AWS SDK for Python
import boto3
import time

# Load the exceptions for error handling
from botocore.exceptions import ClientError, ParamValidationError

# Create AWS service client and set region
sqs = boto3.client('sqs', region_name='us-east-1')

# Create an SQS queue
def create_sqs_queue(sqs_queue_name):
    try:
        data = sqs.create_queue(
            QueueName = sqs_queue_name,
            Attributes = {
                'ReceiveMessageWaitTimeSeconds': '20',
                'VisibilityTimeout': '60'
            }
        )
        return data['QueueUrl']
    # An error occurred
    except ParamValidationError as e:
        print("Parameter validation error: %s" % e)
    except ClientError as e:
        print("Client error: %s" % e)

# Create an SNS message
sns = boto3.client('sns', region_name='us-east-1') # Make a boto client for sns service

def create_messages():
    try:
        data = sns.publish( # Fill out only the required parameters of publish dictionary
            TargetArn = "arn:aws:sns:us-east-1:288761774390:backspace-lab",
            Subject = "SNS Message",
            Message = "This a message from Amazon SNS!"
        )
        return data['MessageId']
    # An error occurred
    except ParamValidationError as e:
        print("Parameter validation error: %s" % e)
    except ClientError as e:
        print("Client error: %s" % e)

## Create Receive Messages Function in order to Process them
def receive_messages(queue_url):
    print('Reading messages')
    while True: # Loops through Continuously // If no ==> time.sleep(60)
        try:
            data = sqs.receive_message( # Dictionary defined in the AWS API Documentation
                QueueUrl = queue_url,
                MaxNumberOfMessages = 10,
                VisibilityTimeout = 60,
                WaitTimeSeconds = 20
            )
        # An error occurred
        except ParamValidationError as e:
            print("Parameter validation error: %s" % e)
        except ClientError as e:
            print("Client error: %s" % e)
        else:
            # Check if empty receive
            try:
                data['Messages']
            except KeyError:
                data = None
            if data is None:
                print('Queue empty waiting 60s')
                # Wait for 60 seconds
                time.sleep(60)
            else:
                for message in data['Messages']:
                    print(message)
                    sqs.delete_message(
                        QueueUrl=queue_url,
                        ReceiptHandle=message['ReceiptHandle']
                    )
                    print('Deleted message')
                    # Wait for 1 second
                    # time.sleep(1)
            # Do not forget to add this call to the main program
            # Gotta process them and delete from the queue now
 
# Main program
def main():
    sqs_queue_url = create_sqs_queue('backspace-lab')
    print('Successfully created SQS queue URL '+ sqs_queue_url )
    create_messages()
    print("Successfully sent 50 messages to the SQS queue")
    receive_messages(sqs_queue_url)

if __name__ == '__main__':
    main()
    
