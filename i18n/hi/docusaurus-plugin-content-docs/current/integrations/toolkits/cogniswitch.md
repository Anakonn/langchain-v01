---
translated: true
---

## कोग्निस्विच टूल्स

**कोग्निस्विच का उपयोग करके उत्पादन-तैयार एप्लिकेशन बनाएं जो ज्ञान को बेखलल उपभोग, संगठित और पुनर्प्राप्त कर सकते हैं। आपके द्वारा चुने गए फ्रेमवर्क का उपयोग करते हुए, इस मामले में Langchain, कोग्निस्विच आपको भंडारण और पुनर्प्राप्ति प्रारूपों को चुनने के संबंध में निर्णय लेने की तनाव को कम करने में मदद करता है। यह प्रतिक्रियाओं में विश्वसनीयता समस्याओं और भ्रमों को भी समाप्त करता है। केवल दो सरल चरणों में अपने ज्ञान के साथ बातचीत करके शुरू करें।**

[https://www.cogniswitch.ai/developer पर पंजीकरण करें](https://www.cogniswitch.ai/developer?utm_source=langchain&utm_medium=langchainbuild&utm_id=dev)।

**पंजीकरण:**

- अपने ईमेल के साथ साइन अप करें और अपना पंजीकरण सत्यापित करें

- आप सेवाओं का उपयोग करने के लिए प्लेटफॉर्म टोकन और OAuth टोकन के साथ एक मेल प्राप्त करेंगे।

**चरण 1: टूलकिट को इंस्टैंशिएट करें और उपकरण प्राप्त करें:**

- कोग्निस्विच टोकन, OpenAI API कुंजी और OAuth टोकन के साथ कोग्निस्विच टूलकिट को इंस्टैंशिएट करें और उपकरण प्राप्त करें।

**चरण 2: एजेंट को उपकरणों और एलएलएम के साथ इंस्टैंशिएट करें:**
- एजेंट कार्यकर्ता में कोग्निस्विच उपकरणों और एलएलएम की सूची के साथ एजेंट को इंस्टैंशिएट करें।

**चरण 3: कोग्निस्विच स्टोर टूल:**

***कोग्निस्विच ज्ञान स्रोत फ़ाइल टूल***
- फ़ाइल पथ देकर फ़ाइल अपलोड करने के लिए एजेंट का उपयोग करें। (वर्तमान में समर्थित प्रारूप .pdf, .docx, .doc, .txt, .html हैं)
- फ़ाइल की सामग्री को कोग्निस्विच द्वारा प्रोसेस किया जाएगा और आपके ज्ञान स्टोर में संग्रहीत किया जाएगा।

***कोग्निस्विच ज्ञान स्रोत यूआरएल टूल***
- यूआरएल अपलोड करने के लिए एजेंट का उपयोग करें।
- यूआरएल की सामग्री को कोग्निस्विच द्वारा प्रोसेस किया जाएगा और आपके ज्ञान स्टोर में संग्रहीत किया जाएगा।

**चरण 4: कोग्निस्विच स्टेटस टूल:**
- किसी दस्तावेज़ के नाम देकर उसकी स्थिति जानने के लिए एजेंट का उपयोग करें।
- आप कोग्निस्विच कंसोल में दस्तावेज़ प्रोसेसिंग की स्थिति भी देख सकते हैं।

**चरण 5: कोग्निस्विच उत्तर टूल:**
- अपना प्रश्न पूछने के लिए एजेंट का उपयोग करें।
- आप अपने ज्ञान से प्राप्त उत्तर को प्रतिक्रिया के रूप में प्राप्त करेंगे।

### आवश्यक लाइब्रेरी आयात करें

```python
import warnings

warnings.filterwarnings("ignore")

import os

from langchain.agents.agent_toolkits import create_conversational_retrieval_agent
from langchain_community.agent_toolkits import CogniswitchToolkit
from langchain_openai import ChatOpenAI
```

### कोग्निस्विच प्लेटफॉर्म टोकन, OAuth टोकन और OpenAI API कुंजी

```python
cs_token = "Your CogniSwitch token"
OAI_token = "Your OpenAI API token"
oauth_token = "Your CogniSwitch authentication token"

os.environ["OPENAI_API_KEY"] = OAI_token
```

### क्रेडेंशियल के साथ कोग्निस्विच टूलकिट को इंस्टैंशिएट करें

```python
cogniswitch_toolkit = CogniswitchToolkit(
    cs_token=cs_token, OAI_token=OAI_token, apiKey=oauth_token
)
```

### कोग्निस्विच उपकरणों की सूची प्राप्त करें

```python
tool_lst = cogniswitch_toolkit.get_tools()
```

### एलएलएम को इंस्टैंशिएट करें

```python
llm = ChatOpenAI(
    temperature=0,
    openai_api_key=OAI_token,
    max_tokens=1500,
    model_name="gpt-3.5-turbo-0613",
)
```

### एक एजेंट कार्यकर्ता बनाएं

```python
agent_executor = create_conversational_retrieval_agent(llm, tool_lst, verbose=False)
```

### यूआरएल अपलोड करने के लिए एजेंट को कॉल करें

```python
response = agent_executor.invoke("upload this url https://cogniswitch.ai/developer")

print(response["output"])
```

```output
The URL https://cogniswitch.ai/developer has been uploaded successfully. The status of the document is currently being processed. You will receive an email notification once the processing is complete.
```

### फ़ाइल अपलोड करने के लिए एजेंट को कॉल करें

```python
response = agent_executor.invoke("upload this file example_file.txt")

print(response["output"])
```

```output
The file example_file.txt has been uploaded successfully. The status of the document is currently being processed. You will receive an email notification once the processing is complete.
```

### किसी दस्तावेज़ की स्थिति प्राप्त करने के लिए एजेंट को कॉल करें

```python
response = agent_executor.invoke("Tell me the status of this document example_file.txt")

print(response["output"])
```

```output
The status of the document example_file.txt is as follows:

- Created On: 2024-01-22T19:07:42.000+00:00
- Modified On: 2024-01-22T19:07:42.000+00:00
- Document Entry ID: 153
- Status: 0 (Processing)
- Original File Name: example_file.txt
- Saved File Name: 1705950460069example_file29393011.txt

The document is currently being processed.
```

### प्रश्न के साथ एजेंट को कॉल करें और उत्तर प्राप्त करें

```python
response = agent_executor.invoke("How can cogniswitch help develop GenAI applications?")

print(response["output"])
```

```output
CogniSwitch can help develop GenAI applications in several ways:

1. Knowledge Extraction: CogniSwitch can extract knowledge from various sources such as documents, websites, and databases. It can analyze and store data from these sources, making it easier to access and utilize the information for GenAI applications.

2. Natural Language Processing: CogniSwitch has advanced natural language processing capabilities. It can understand and interpret human language, allowing GenAI applications to interact with users in a more conversational and intuitive manner.

3. Sentiment Analysis: CogniSwitch can analyze the sentiment of text data, such as customer reviews or social media posts. This can be useful in developing GenAI applications that can understand and respond to the emotions and opinions of users.

4. Knowledge Base Integration: CogniSwitch can integrate with existing knowledge bases or create new ones. This allows GenAI applications to access a vast amount of information and provide accurate and relevant responses to user queries.

5. Document Analysis: CogniSwitch can analyze documents and extract key information such as entities, relationships, and concepts. This can be valuable in developing GenAI applications that can understand and process large amounts of textual data.

Overall, CogniSwitch provides a range of AI-powered capabilities that can enhance the development of GenAI applications by enabling knowledge extraction, natural language processing, sentiment analysis, knowledge base integration, and document analysis.
```
