---
translated: true
---

# हिप्पो

>[Transwarp हिप्पो](https://www.transwarp.cn/en/subproduct/hippo) एक उद्यम-स्तरीय क्लाउड-नेटिव वितरित वेक्टर डेटाबेस है जो विशाल वेक्टर-आधारित डेटासेट के भंडारण, पुनर्प्राप्ति और प्रबंधन का समर्थन करता है। यह वेक्टर समानता खोज और उच्च घनत्व वेक्टर क्लस्टरिंग जैसी समस्याओं को कुशलतापूर्वक हल करता है। `हिप्पो` उच्च उपलब्धता, उच्च प्रदर्शन और आसान स्केलेबिलिटी की विशेषताएं प्रदर्शित करता है। इसमें कई कार्यक्षमताएं हैं, जैसे कि कई वेक्टर खोज इंडेक्स, डेटा पार्टीशनिंग और शार्डिंग, डेटा स्थिरता, इनक्रीमेंटल डेटा इंजेस्टन, वेक्टर स्कैलर फ़ील्ड फ़िल्टरिंग और मिश्रित क्वेरी। यह उच्च वास्तविक-समय खोज मांग को प्रभावी ढंग से पूरा कर सकता है।

## शुरू करना

यहां एकमात्र पूर्व-आवश्यकता OpenAI वेबसाइट से एक API कुंजी है। सुनिश्चित करें कि आप पहले से ही एक हिप्पो इंस्टेंस शुरू कर चुके हैं।

## निर्भरताएं स्थापित करना

प्रारंभ में, हमें कुछ निर्भरताओं जैसे OpenAI, Langchain और Hippo-API का स्थापना करना आवश्यक है। कृपया ध्यान दें कि आपको अपने वातावरण के अनुकूल उचित संस्करण स्थापित करना चाहिए।

```python
%pip install --upgrade --quiet  langchain tiktoken langchain-openai
%pip install --upgrade --quiet  hippo-api==1.1.0.rc3
```

```output
Requirement already satisfied: hippo-api==1.1.0.rc3 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (1.1.0rc3)
Requirement already satisfied: pyyaml>=6.0 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (from hippo-api==1.1.0.rc3) (6.0.1)
```

नोट: Python संस्करण >=3.8 होना चाहिए।

## सर्वोत्तम प्रथाएं

### निर्भरता पैकेज आयात करना

```python
import os

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.hippo import Hippo
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### ज्ञान दस्तावेजों को लोड करना

```python
os.environ["OPENAI_API_KEY"] = "YOUR OPENAI KEY"
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

### ज्ञान दस्तावेज़ का विभाजन

यहां, हम Langchain के CharacterTextSplitter का उपयोग करते हैं। विराम चिह्न एक पूर्णविराम है। विभाजन के बाद, पाठ खंड 1000 वर्णों से अधिक नहीं होता है और दोहराए गए वर्णों की संख्या 0 है।

```python
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### एम्बेडिंग मॉडल घोषित करना

नीचे, हम Langchain के OpenAIEmbeddings विधि का उपयोग करके OpenAI या Azure एम्बेडिंग मॉडल बनाते हैं।

```python
# openai
embeddings = OpenAIEmbeddings()
# azure
# embeddings = OpenAIEmbeddings(
#     openai_api_type="azure",
#     openai_api_base="x x x",
#     openai_api_version="x x x",
#     model="x x x",
#     deployment="x x x",
#     openai_api_key="x x x"
# )
```

### हिप्पो क्लाइंट घोषित करना

```python
HIPPO_CONNECTION = {"host": "IP", "port": "PORT"}
```

### दस्तावेज़ को संग्रहीत करना

```python
print("input...")
# insert docs
vector_store = Hippo.from_documents(
    docs,
    embedding=embeddings,
    table_name="langchain_test",
    connection_args=HIPPO_CONNECTION,
)
print("success")
```

```output
input...
success
```

### ज्ञान-आधारित प्रश्न और उत्तर करना

#### बड़े भाषा प्रश्न-उत्तर मॉडल का निर्माण

नीचे, हम क्रमशः AzureChatOpenAI और ChatOpenAI विधियों का उपयोग करके OpenAI या Azure बड़े भाषा प्रश्न-उत्तर मॉडल बनाते हैं।

```python
# llm = AzureChatOpenAI(
#     openai_api_base="x x x",
#     openai_api_version="xxx",
#     deployment_name="xxx",
#     openai_api_key="xxx",
#     openai_api_type="azure"
# )

llm = ChatOpenAI(openai_api_key="YOUR OPENAI KEY", model_name="gpt-3.5-turbo-16k")
```

### प्रश्न के आधार पर संबंधित ज्ञान प्राप्त करना:

```python
query = "Please introduce COVID-19"
# query = "Please introduce Hippo Core Architecture"
# query = "What operations does the Hippo Vector Database support for vector data?"
# query = "Does Hippo use hardware acceleration technology? Briefly introduce hardware acceleration technology."


# Retrieve similar content from the knowledge base,fetch the top two most similar texts.
res = vector_store.similarity_search(query, 2)
content_list = [item.page_content for item in res]
text = "".join(content_list)
```

### एक प्रोम्प्ट टेम्प्लेट का निर्माण

```python
prompt = f"""
Please use the content of the following [Article] to answer my question. If you don't know, please say you don't know, and the answer should be concise."
[Article]:{text}
Please answer this question in conjunction with the above article:{query}
"""
```

### बड़े भाषा मॉडल को उत्तर उत्पन्न करने के लिए प्रतीक्षा करना

```python
response_with_hippo = llm.predict(prompt)
print(f"response_with_hippo:{response_with_hippo}")
response = llm.predict(query)
print("==========================================")
print(f"response_without_hippo:{response}")
```

```output
response_with_hippo:COVID-19 is a virus that has impacted every aspect of our lives for over two years. It is a highly contagious and mutates easily, requiring us to remain vigilant in combating its spread. However, due to progress made and the resilience of individuals, we are now able to move forward safely and return to more normal routines.
==========================================
response_without_hippo:COVID-19 is a contagious respiratory illness caused by the novel coronavirus SARS-CoV-2. It was first identified in December 2019 in Wuhan, China and has since spread globally, leading to a pandemic. The virus primarily spreads through respiratory droplets when an infected person coughs, sneezes, talks, or breathes, and can also spread by touching contaminated surfaces and then touching the face. COVID-19 symptoms include fever, cough, shortness of breath, fatigue, muscle or body aches, sore throat, loss of taste or smell, headache, and in severe cases, pneumonia and organ failure. While most people experience mild to moderate symptoms, it can lead to severe illness and even death, particularly among older adults and those with underlying health conditions. To combat the spread of the virus, various preventive measures have been implemented globally, including social distancing, wearing face masks, practicing good hand hygiene, and vaccination efforts.
```
