---
translated: true
---

यह नोटबुक [Azure OpenAI](https://aka.ms/azure-openai) के साथ Langchain का उपयोग करने के बारे में है।

Azure OpenAI API OpenAI API के अनुरूप है। `openai` Python पैकेज का उपयोग करके आप OpenAI और Azure OpenAI दोनों का आसानी से उपयोग कर सकते हैं। नीचे दिए गए अपवादों को छोड़कर, आप Azure OpenAI को OpenAI के समान तरीके से कॉल कर सकते हैं।

## API कॉन्फ़िगरेशन

आप पर्यावरण चर का उपयोग करके `openai` पैकेज को Azure OpenAI का उपयोग करने के लिए कॉन्फ़िगर कर सकते हैं। यह `bash` के लिए है:

```bash
# The API version you want to use: set this to `2023-12-01-preview` for the released version.
export OPENAI_API_VERSION=2023-12-01-preview
# The base URL for your Azure OpenAI resource.  You can find this in the Azure portal under your Azure OpenAI resource.
export AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
# The API key for your Azure OpenAI resource.  You can find this in the Azure portal under your Azure OpenAI resource.
export AZURE_OPENAI_API_KEY=<your Azure OpenAI API key>
```

वैकल्पिक रूप से, आप अपने चल रहे Python वातावरण में ही API को कॉन्फ़िगर कर सकते हैं:

```python
import os
os.environ["OPENAI_API_VERSION"] = "2023-12-01-preview"
```

## Azure Active Directory प्रमाणीकरण

Azure OpenAI के साथ प्रमाणीकरण करने के दो तरीके हैं:
- API कुंजी
- Azure Active Directory (AAD)

API कुंजी का उपयोग करना शुरू करने का सबसे आसान तरीका है। आप अपनी API कुंजी को Azure पोर्टल में अपने Azure OpenAI संसाधन के तहत पा सकते हैं।

हालांकि, यदि आपके पास जटिल सुरक्षा आवश्यकताएं हैं - तो आप Azure Active Directory का उपयोग करना चाह सकते हैं। Azure OpenAI के साथ AAD का उपयोग करने के बारे में अधिक जानकारी [यहां](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/managed-identity) पाई जा सकती है।

यदि आप स्थानीय रूप से विकास कर रहे हैं, तो आपको Azure CLI स्थापित करना और लॉग इन करना होगा। आप Azure CLI [यहां](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) से स्थापित कर सकते हैं। फिर, `az login` चलाकर लॉग इन करें।

अपने Azure OpenAI संसाधन पर `Cognitive Services OpenAI User` की एक भूमिका आवंटन जोड़ें। यह आपको AAD से एक टोकन प्राप्त करने में सक्षम बनाएगा जिसका उपयोग आप Azure OpenAI के साथ कर सकते हैं। आप इस भूमिका आवंटन को किसी उपयोगकर्ता, समूह, सेवा प्रधान या प्रबंधित पहचान के साथ प्रदान कर सकते हैं। Azure OpenAI RBAC भूमिकाओं के बारे में अधिक जानकारी के लिए [यहां](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/role-based-access-control) देखें।

LangChain के साथ AAD का उपयोग करने के लिए, `azure-identity` पैकेज स्थापित करें। फिर, `OPENAI_API_TYPE` को `azure_ad` पर सेट करें। अगला, `DefaultAzureCredential` क्लास का उपयोग करके AAD से एक टोकन प्राप्त करने के लिए `get_token` कॉल करें, जैसा कि नीचे दिखाया गया है। अंत में, `OPENAI_API_KEY` पर्यावरण चर को टोकन मान पर सेट करें।

```python
import os
from azure.identity import DefaultAzureCredential

# Get the Azure Credential
credential = DefaultAzureCredential()

# Set the API type to `azure_ad`
os.environ["OPENAI_API_TYPE"] = "azure_ad"
# Set the API_KEY to the token from the Azure credential
os.environ["OPENAI_API_KEY"] = credential.get_token("https://cognitiveservices.azure.com/.default").token
```

`DefaultAzureCredential` क्लास AAD प्रमाणीकरण शुरू करने का एक आसान तरीका है। आप यदि आवश्यक हो तो क्रेडेंशियल श्रृंखला को भी अनुकूलित कर सकते हैं। नीचे दिखाए गए उदाहरण में, हम पहले प्रबंधित पहचान का प्रयास करते हैं, और फिर Azure CLI पर वापस आते हैं। यह उपयोगी है यदि आप अपना कोड Azure में चला रहे हैं, लेकिन स्थानीय रूप से विकास करना चाहते हैं।

```python
from azure.identity import ChainedTokenCredential, ManagedIdentityCredential, AzureCliCredential

credential = ChainedTokenCredential(
    ManagedIdentityCredential(),
    AzureCliCredential()
)
```

## तैनातियाँ

Azure OpenAI के साथ, आप सामान्य GPT-3 और Codex मॉडलों की अपनी खुद की तैनातियां सेट करते हैं। API को कॉल करते समय, आपको उपयोग करने के लिए तैनाती का उल्लेख करना होगा।

_**नोट**: ये दस्तावेज़ Azure पाठ पूर्ण मॉडलों के लिए हैं। GPT-4 जैसे मॉडल चैट मॉडल हैं। उनका एक थोड़ा अलग इंटरफ़ेस है, और `AzureChatOpenAI` क्लास के माध्यम से उन्हें एक्सेस किया जा सकता है। Azure चैट पर दस्तावेज़ के लिए [Azure Chat OpenAI documentation](/docs/integrations/chat/azure_chat_openai) देखें।_

मान लीजिए कि आपकी तैनाती का नाम `gpt-35-turbo-instruct-prod` है। `openai` Python API में, आप `engine` पैरामीटर के साथ इस तैनाती का उल्लेख कर सकते हैं। उदाहरण के लिए:

```python
import openai

client = AzureOpenAI(
    api_version="2023-12-01-preview",
)

response = client.completions.create(
    model="gpt-35-turbo-instruct-prod",
    prompt="Test prompt"
)
```

```python
%pip install --upgrade --quiet  langchain-openai
```

```python
import os

os.environ["OPENAI_API_VERSION"] = "2023-12-01-preview"
os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
os.environ["AZURE_OPENAI_API_KEY"] = "..."
```

```python
# Import Azure OpenAI
from langchain_openai import AzureOpenAI
```

```python
# Create an instance of Azure OpenAI
# Replace the deployment name with your own
llm = AzureOpenAI(
    deployment_name="gpt-35-turbo-instruct-0914",
)
```

```python
# Run the LLM
llm.invoke("Tell me a joke")
```

```output
" Why couldn't the bicycle stand up by itself?\n\nBecause it was two-tired!"
```

हम LLM को भी प्रिंट कर सकते हैं और इसकी कस्टम प्रिंट देख सकते हैं।

```python
print(llm)
```

```output
[1mAzureOpenAI[0m
Params: {'deployment_name': 'gpt-35-turbo-instruct-0914', 'model_name': 'gpt-3.5-turbo-instruct', 'temperature': 0.7, 'top_p': 1, 'frequency_penalty': 0, 'presence_penalty': 0, 'n': 1, 'logit_bias': {}, 'max_tokens': 256}
```
