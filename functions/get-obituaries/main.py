# add your get-obituaries function here

import json
import boto3

# create a dynamodb resource
dynamodb_resource = boto3.resource("dynamodb")
# create a dynamodb table object
table = dynamodb_resource.Table("last-show-30134905")

def lambda_handler(event, context):
    response = table.scan()
    items = response['Items']
    try:
        return {
            'statusCode': 200,
            'body': json.dumps(items),
            'headers': {
                'Content-Type': 'application/json',
            }
        }
    except Exception as e:
        print(f"exception:{e}")
        return {
            "statusCode" : 500,
            "message": "Error retrieving",
        }