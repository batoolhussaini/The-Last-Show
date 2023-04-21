# add your create-obituary function here

import json
import boto3

# create a dynamodb resource
dynamodb_resource = boto3.resource("dynamodb")
# create a dynamodb table object
table = dynamodb_resource.Table("lastshow-30134905")

def lambda_handler(event, context):
    print(event)
    body = json.loads(event["body"])
    try:
        table.put_item(Item=body)
        return {
            "statusCode": 200,
                "body": json.dumps({
                    "message": "Success! Obituary added."
            })
        }
    except Exception as e:
        print(f"exception: {e}")
        return {
            "statusCode": 500,
                "body": json.dumps({
                    "message": str(e)
            })
        }