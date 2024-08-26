---
translated: true
---

# Google Drive

यह नोटबुक `Google Drive API` के साथ LangChain को कनेक्ट करने के बारे में बताता है।

## पूर्वापेक्षाएं

1. Google Cloud परियोजना बनाएं या मौजूदा परियोजना का उपयोग करें
1. [Google Drive API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com) सक्षम करें
1. [डेस्कटॉप ऐप के लिए क्रेडेंशियल्स को अधिकृत करें](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Google Docs डेटा प्राप्त करने के लिए निर्देश

डिफ़ॉल्ट रूप से, `GoogleDriveTools` और `GoogleDriveWrapper` को `~/.credentials/credentials.json` फ़ाइल की उम्मीद है, लेकिन यह `GOOGLE_ACCOUNT_FILE` पर्यावरण चर का उपयोग करके कॉन्फ़िगर किया जा सकता है।
`token.json` का स्थान उसी निर्देशिका का उपयोग करता है (या `token_path` पैरामीटर का उपयोग करता है)। ध्यान दें कि `token.json` पहली बार उपकरण का उपयोग करते समय स्वचालित रूप से बनाया जाएगा।

`GoogleDriveSearchTool` कुछ अनुरोधों के साथ फ़ाइलों का एक चयन पुनर्प्राप्त कर सकता है।

डिफ़ॉल्ट रूप से, यदि आप `folder_id` का उपयोग करते हैं, तो इस फ़ोल्डर के अंदर की सभी फ़ाइलें `Document` में पुनर्प्राप्त की जा सकती हैं, यदि नाम क्वेरी से मेल खाता है।

```python
%pip install --upgrade --quiet  google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

आप अपने फ़ोल्डर और दस्तावेज़ आईडी को URL से प्राप्त कर सकते हैं:

* फ़ोल्डर: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> फ़ोल्डर आईडी `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"` है
* दस्तावेज़: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> दस्तावेज़ आईडी `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"` है

विशेष मान `root` आपके व्यक्तिगत होम के लिए है।

```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```

डिफ़ॉल्ट रूप से, इन माइम प्रकार वाली सभी फ़ाइलें `Document` में रूपांतरित की जा सकती हैं।
- text/text
- text/plain
- text/html
- text/csv
- text/markdown
- image/png
- image/jpeg
- application/epub+zip
- application/pdf
- application/rtf
- application/vnd.google-apps.document (GDoc)
- application/vnd.google-apps.presentation (GSlide)
- application/vnd.google-apps.spreadsheet (GSheet)
- application/vnd.google.colaboratory (Notebook colab)
- application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)

यह अपडेट या अनुकूलित करना संभव है। `GoogleDriveAPIWrapper` के प्रलेखन देखें।

लेकिन, संबंधित पैकेज स्थापित किए जाने चाहिए।

```python
%pip install --upgrade --quiet  unstructured
```

```python
from langchain_googldrive.tools.google_drive.tool import GoogleDriveSearchTool
from langchain_googledrive.utilities.google_drive import GoogleDriveAPIWrapper

# By default, search only in the filename.
tool = GoogleDriveSearchTool(
    api_wrapper=GoogleDriveAPIWrapper(
        folder_id=folder_id,
        num_results=2,
        template="gdrive-query-in-folder",  # Search in the body of documents
    )
)
```

```python
import logging

logging.basicConfig(level=logging.INFO)
```

```python
tool.run("machine learning")
```

```python
tool.description
```

```python
from langchain.agents import load_tools

tools = load_tools(
    ["google-drive-search"],
    folder_id=folder_id,
    template="gdrive-query-in-folder",
)
```

## एजेंट के भीतर उपयोग

```python
from langchain.agents import AgentType, initialize_agent
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
)
```

```python
agent.run("Search in google drive, who is 'Yann LeCun' ?")
```
