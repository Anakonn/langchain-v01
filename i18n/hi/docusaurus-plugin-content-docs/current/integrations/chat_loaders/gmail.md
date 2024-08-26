---
translated: true
---

यह लोडर जीमेल से डेटा लोड करने के बारे में बताता है। जीमेल से डेटा लोड करने के कई तरीके हो सकते हैं। यह लोडर वर्तमान में इसे करने का एक काफी अभिमुख तरीका है। यह जो करता है वह यह है कि पहले वह उन सभी संदेशों को देखता है जो आपने भेजे हैं। फिर वह उन संदेशों को देखता है जहां आप किसी पिछले ईमेल का जवाब दे रहे हैं। फिर वह उस पिछले ईमेल को प्राप्त करता है, और उस ईमेल का एक प्रशिक्षण उदाहरण बनाता है, जिसके बाद आपका ईमेल आता है।

यहां स्पष्ट सीमाएं हैं। उदाहरण के लिए, सभी बनाए गए उदाहरण केवल संदर्भ के लिए पिछले ईमेल को देखते हैं।

इसका उपयोग करने के लिए:

- एक Google डेवलपर खाता सेट करें: Google डेवलपर कंसोल पर जाएं, एक प्रोजेक्ट बनाएं, और उस प्रोजेक्ट के लिए Gmail API को सक्षम करें। इससे आपको एक credentials.json फ़ाइल मिलेगी जिसकी आपको बाद में जरूरत पड़ेगी।

- Google क्लाइंट लाइब्रेरी इंस्टॉल करें: निम्नलिखित कमांड चलाकर Google क्लाइंट लाइब्रेरी इंस्टॉल करें:

```python
%pip install --upgrade --quiet  google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

```python
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


creds = None
# The file token.json stores the user's access and refresh tokens, and is
# created automatically when the authorization flow completes for the first
# time.
if os.path.exists("email_token.json"):
    creds = Credentials.from_authorized_user_file("email_token.json", SCOPES)
# If there are no (valid) credentials available, let the user log in.
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            # your creds file here. Please create json file as here https://cloud.google.com/docs/authentication/getting-started
            "creds.json",
            SCOPES,
        )
        creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("email_token.json", "w") as token:
        token.write(creds.to_json())
```

```python
from langchain_community.chat_loaders.gmail import GMailLoader
```

```python
loader = GMailLoader(creds=creds, n=3)
```

```python
data = loader.load()
```

```python
# Sometimes there can be errors which we silently ignore
len(data)
```

```output
2
```

```python
from langchain_community.chat_loaders.utils import (
    map_ai_messages,
)
```

```python
# This makes messages sent by hchase@langchain.com the AI Messages
# This means you will train an LLM to predict as if it's responding as hchase
training_data = list(
    map_ai_messages(data, sender="Harrison Chase <hchase@langchain.com>")
)
```
