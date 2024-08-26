---
translated: true
---

यह टेम्पलेट AWS Bedrock सर्विस से कनेक्ट करने के लिए डिज़ाइन किया गया है, जो एक प्रबंधित सर्वर है जो फाउंडेशन मॉडल्स का एक सेट प्रदान करता है।

यह मुख्य रूप से `Anthropic Claude` को पाठ उत्पादन के लिए और `Amazon Titan` को पाठ एम्बेडिंग के लिए उपयोग करता है, और FAISS को वेक्टर स्टोर के रूप में उपयोग करता है।

RAG पाइपलाइन पर अतिरिक्त संदर्भ के लिए, [इस नोटबुक](https://github.com/aws-samples/amazon-bedrock-workshop/blob/main/03_QuestionAnswering/01_qa_w_rag_claude.ipynb) का संदर्भ लें।

## वातावरण सेटअप

इस पैकेज का उपयोग करने से पहले, यह सुनिश्चित करें कि आपने अपने AWS खाते के साथ `boto3` को कॉन्फ़िगर किया है।

`boto3` को सेट अप और कॉन्फ़िगर करने के बारे में विस्तृत जानकारी के लिए, [इस पृष्ठ](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration) पर जाएं।

इसके अलावा, FAISS वेक्टर स्टोर के साथ काम करने के लिए आपको `faiss-cpu` पैकेज इंस्टॉल करना होगा:

```bash
pip install faiss-cpu
```

आप निम्नलिखित पर्यावरण चर भी सेट करना चाहेंगे जो आपके AWS प्रोफ़ाइल और क्षेत्र को दर्शाते हैं (अगर आप `default` AWS प्रोफ़ाइल और `us-east-1` क्षेत्र का उपयोग नहीं कर रहे हैं):

* `AWS_DEFAULT_REGION`
* `AWS_PROFILE`

## उपयोग

पहले, LangChain CLI इंस्टॉल करें:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में इंस्टॉल करने के लिए:

```shell
langchain app new my-app --package rag-aws-bedrock
```

किसी मौजूदा प्रोजेक्ट में इस पैकेज को जोड़ने के लिए:

```shell
langchain app add rag-aws-bedrock
```

फिर अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_aws_bedrock import chain as rag_aws_bedrock_chain

add_routes(app, rag_aws_bedrock_chain, path="/rag-aws-bedrock")
```

(वैकल्पिक) यदि आपके पास LangSmith तक पहुंच है, तो आप इसे LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने के लिए कॉन्फ़िगर कर सकते हैं। यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से एक सर्वर चलाते हुए FastAPI ऐप शुरू करेगा।

आप [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं और [http://127.0.0.1:8000/rag-aws-bedrock/playground](http://127.0.0.1:8000/rag-aws-bedrock/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

आप कोड से टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-aws-bedrock")
```
