---
translated: true
---

# PremAI

>[PremAI](https://app.premai.io) एक एकीकृत प्लेटफ़ॉर्म है जो आपको कम प्रयास से शक्तिशाली उत्पादन-तैयार GenAI संचालित अनुप्रयोगों को बनाने में मदद करता है, ताकि आप उपयोगकर्ता अनुभव और समग्र वृद्धि पर अधिक ध्यान दे सकें। इस खंड में हम `PremAIEmbeddings` का उपयोग करके विभिन्न एम्बेडिंग मॉडल तक पहुंचने के बारे में चर्चा करेंगे।

## स्थापना और सेटअप

हम langchain और premai-sdk को स्थापित करके शुरू करते हैं। आप निम्नलिखित कमांड टाइप करके इन्हें स्थापित कर सकते हैं:

```bash
pip install premai langchain
```

आगे बढ़ने से पहले, कृपया सुनिश्चित करें कि आपने Prem पर एक खाता बना लिया है और पहले से ही एक परियोजना शुरू कर दी है। यदि नहीं, तो यहां आप मुफ्त में शुरू कर सकते हैं:

1. [PremAI](https://app.premai.io/accounts/login/) पर साइन इन करें, यदि आप पहली बार आ रहे हैं और यहां [अपना API कुंजी](https://app.premai.io/api_keys/) बनाएं।

2. [app.premai.io](https://app.premai.io) पर जाएं और यह आपको परियोजना के डैशबोर्ड पर ले जाएगा।

3. एक परियोजना बनाएं और यह एक परियोजना-आईडी (ID के रूप में लिखा) जनरेट करेगा। यह आईडी आपके तैनात अनुप्रयोग के साथ बातचीत करने में मदद करेगी।

अपने पहले तैनात अनुप्रयोग को Prem पर बनाने पर बधाई 🎉 अब हम langchain का उपयोग करके अपने अनुप्रयोग के साथ बातचीत कर सकते हैं।

```python
# Let's start by doing some imports and define our embedding object

from langchain_community.embeddings import PremAIEmbeddings
```

एक बार जब हमने अपने आवश्यक मॉड्यूल आयात कर लिए, तो चलिए अपने क्लाइंट को सेट अप करें। अभी के लिए मान लें कि हमारा `project_id` 8 है। लेकिन सुनिश्चित करें कि आप अपना परियोजना-आईडी उपयोग करें, नहीं तो यह त्रुटि उत्पन्न करेगा।

```python
import getpass
import os

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
model = "text-embedding-3-large"
embedder = PremAIEmbeddings(project_id=8, model=model)
```

हमने अपने एम्बेडिंग मॉडल को परिभाषित किया है। हम कई एम्बेडिंग मॉडल का समर्थन करते हैं। यहां एक तालिका है जो समर्थित एम्बेडिंग मॉडल की संख्या दिखाती है।

| प्रदाता    | स्लग                                     | संदर्भ टोकन |
|-------------|------------------------------------------|----------------|
| cohere      | embed-english-v3.0                       | N/A            |
| openai      | text-embedding-3-small                   | 8191           |
| openai      | text-embedding-3-large                   | 8191           |
| openai      | text-embedding-ada-002                   | 8191           |
| replicate   | replicate/all-mpnet-base-v2              | N/A            |
| together    | togethercomputer/Llama-2-7B-32K-Instruct | N/A            |
| mistralai   | mistral-embed                            | 4096           |

मॉडल को बदलने के लिए, आपको बस `स्लग` कॉपी करना होगा और अपने एम्बेडिंग मॉडल तक पहुंच सकते हैं। अब आइए एक क्वेरी के साथ शुरू करें, जिसके बाद कई क्वेरी (जिसे दस्तावेज़ भी कहा जाता है) का उपयोग करें।

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

```output
[-0.02129288576543331, 0.0008162345038726926, -0.004556538071483374, 0.02918623760342598, -0.02547479420900345]
```

अंत में, आइए एक दस्तावेज़ को एम्बेड करें।

```python
documents = ["This is document1", "This is document2", "This is document3"]

doc_result = embedder.embed_documents(documents)

# Similar to previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```

```output
[-0.0030691148713231087, -0.045334383845329285, -0.0161729846149683, 0.04348714277148247, -0.0036920777056366205]
```
