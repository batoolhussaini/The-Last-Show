# create-obituary function here

import requests
from requests_toolbelt.multipart import decoder

# import datetime
import hashlib
import base64
import boto3
import time
import json
import os

# create a dynamodb resource
dynamodb_resource = boto3.resource("dynamodb")
# create a dynamodb table object
table = dynamodb_resource.Table("last-show-30134905")



## PARAMETER STORE ##
client = boto3.client('ssm')

response = client.get_parameters_by_path(
    Path='/the-last-show/',
    Recursive=True,
    WithDecryption=True,
)
response = {key["Name"]: key["Value"] for key in response["Parameters"]}

def get_keys(key_path):
    return response[key_path]

CLOUDINARY_CLOUD_NAME = "dmxefn6nx"
CLOUDINARY_API_KEY = "871837533266741"
CLOUDINARY_API_SECRET = get_keys("/the-last-show/cloudinary-key")
GPT_API_SECRET = get_keys("/the-last-show/gpt-key")



## CLOUDINARY ##
def upload_to_cloudinary(filename, resource_type="image"):
    api_key = CLOUDINARY_API_KEY
    cloud_name = CLOUDINARY_CLOUD_NAME
    # read from parameter store with get_keys() function
    api_secret = CLOUDINARY_API_SECRET
    timestamp = int(time.time())

    body = {
        "timestamp": timestamp,
        "api_key": api_key,
        "eager": "e_art:zorro"
    }

    files = {
        "file": open(filename, "rb")
    }

    timestamp = int(time.time())
    body["timestamp"] = timestamp
    body["signature"] = create_signature(body, api_secret)

    url = f"http://api.cloudinary.com/v1_1/{cloud_name}/{resource_type}/upload"
    res = requests.post(url, files = files, data = body)

    return res.json()

def create_signature(body, api_secret):
    exclude = ["api_key", "resource_type", "cloud_name"]
    sorted_body = sort_dictionary(body, exclude)
    query_string = create_query_string(sorted_body)
    query_string_appended = f"{query_string}{api_secret}"
    hashed = hashlib.sha1(query_string_appended.encode())
    signature = hashed.hexdigest()
    return signature

def sort_dictionary(dictionary, exclude): 
    return {k: v for k, v in sorted(dictionary.items(), key = lambda item: item[0]) if k not in exclude}

def create_query_string(body):
    query_string = ""
    for idx, (k, v) in enumerate(body.items()):
        query_string = f"{k}={v}" if idx == 0 else f"{query_string}&{k}={v}"
    return query_string



## CHAT-GPT ##
def ask_gpt(prompt):
    url = "https://api.openai.com/v1/completions"
    # read from parameter store with get_keys() function
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GPT_API_SECRET}"
    }

    body = {
        "model": "text-davinci-003", 
        "prompt": prompt,   # you can write directly here too
        "max_tokens": 200, 
        "temperature": 0.2 
    }

    res = requests.post(url, headers=headers, json=body)
    # if (res.status_code == 200):        # TESTING
    #     print(res.json())               # TESTING
    # else:                               # TESTING
    #     print("oh no!!!")               # TESTING
    #     print(res.status_code)          # TESTING
    return res.json()["choices"][0]["text"] 

# comment out for TESTING
# ask_gpt("hi babe")



## POLLY ##
def read_this(text):
    client = boto3.client('polly')
    response = client.synthesize_speech(
        Engine ='standard',
        LanguageCode = 'en-US',
        OutputFormat = 'mp3',
        Text = text,
        TextType = 'text',
        VoiceId = 'Joanna'
    )

    file_name = os.path.join("/tmp", "polly.mp3")
    # file_name = "polly.mp3"
    with open(file_name, "wb") as f:
        f.write(response["AudioStream"].read())

    return file_name



## MAIN LAMBDA ##
def lambda_handler(event, context):
    body = event["body"]
    if event["isBase64Encoded"]:
        body = base64.b64decode(body)

    # decode body of request
    content_type = event["headers"]["content-type"]
    data = decoder.MultipartDecoder(body, content_type)

    picture = data.parts[0].content
    name = data.parts[1].text
    born = data.parts[2].text
    died = data.parts[3].text
    id = data.parts[4].text

    # we must ask chat-gpt for description
    prompt = f"write an obituary about a fictional character named {name} who was born on {born} and died on {died}"

    # we must store binary in new file for cloudinary
    # you only have access to the /tmp folder in lambda
    file_name = os.path.join("/tmp", "obituary.jpg")
    with open(file_name, "wb") as f:
        f.write(picture)

    try:
        description = ask_gpt(prompt)               
        read_description = read_this(description)

        # testing polly without chat-gpt: WORKS!
        # born_format = datetime.datetime.strptime(data.parts[2].text, "%Y-%m-%dT%H:%M").strftime("%B %d, %Y")
        # died_format = datetime.datetime.strptime(data.parts[3].text, "%Y-%m-%dT%H:%M").strftime("%B %d, %Y")
        # description = f"{name} born on {born_format}, and dying on {died_format}, was a talented artist and musician "  
        # description += "who enjoyed spending time with friends and family. Rest in peace."                              
        # read_description = read_this(description)                                                                       

        # upload to cloudinary:
            #1-audio of description
            #2-image of deceased
        response1 = upload_to_cloudinary(read_description, resource_type="raw")
        response2 = upload_to_cloudinary(file_name)["eager"][0]
        polly_url = response1["secure_url"]
        image_url = response2["secure_url"]

        item = {
            "id": id,
            "name": name,
            "born": born,
            "died": died,
            "description": description,         
            "image_url": image_url,
            "polly_url": polly_url
        }
        table.put_item(Item=item)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Success! Obituary added.",
                "item": item
            }),
        }
    except Exception as e:
        print(f"exception: {e}")
        return {
            "statusCode": 500,
                "body": json.dumps({
                    "message": str(e)
            })
        }