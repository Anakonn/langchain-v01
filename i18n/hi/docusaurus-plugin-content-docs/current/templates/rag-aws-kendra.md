---
translated: true
---

# rag-aws-kendra

यह टेम्पलेट एक ऐप्लिकेशन है जो Amazon Kendra, एक मशीन लर्निंग-संचालित खोज सेवा, और Anthropic Claude के लिए पाठ उत्पादन का उपयोग करता है। ऐप्लिकेशन अपने दस्तावेजों से प्रश्नों का उत्तर देने के लिए एक पुनर्प्राप्ति श्रृंखला का उपयोग करके दस्तावेज़ प्राप्त करता है।

यह `boto3` लाइब्रेरी का उपयोग करके Bedrock सेवा से कनेक्ट करता है।

Amazon Kendra के साथ RAG ऐप्लिकेशन बनाने पर अधिक संदर्भ के लिए, [यह पृष्ठ](https://aws.amazon.com/blogs/machine-learning/quickly-build-high-accuracy-generative-ai-applications-on-enterprise-data-using-amazon-kendra-langchain-and-large-language-models/) देखें।

## वातावरण सेटअप

कृपया `boto3` को अपने AWS खाते के साथ सेट अप और कॉन्फ़िगर करना सुनिश्चित करें।

आप [यहाँ](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration) दिए गए मार्गदर्शिका का पालन कर सकते हैं।

आपको इस टेम्पलेट का उपयोग करने से पहले एक Kendra इंडेक्स भी सेट अप करना चाहिए।

आप [यह क्लाउडफॉर्मेशन टेम्पलेट](https://github.com/aws-samples/amazon-kendra-langchain-extensions/blob/main/kendra_retriever_samples/kendra-docs-index.yaml) का उपयोग करके एक नमूना इंडेक्स बना सकते हैं।

इसमें Amazon Kendra, Amazon Lex और Amazon SageMaker के लिए AWS ऑनलाइन दस्तावेज़ों का नमूना डेटा शामिल है। वैकल्पिक रूप से, यदि आपने अपना स्वयं का डेटासेट इंडेक्स किया है, तो आप अपना स्वयं का Amazon Kendra इंडेक्स भी उपयोग कर सकते हैं।

निम्नलिखित पर्यावरण चर सेट किए जाने चाहिए:

* `AWS_DEFAULT_REGION` - यह सही AWS क्षेत्र को दर्शाना चाहिए। डिफ़ॉल्ट है `us-east-1`।
* `AWS_PROFILE` - यह आपके AWS प्रोफ़ाइल को दर्शाना चाहिए। डिफ़ॉल्ट है `default`।
* `KENDRA_INDEX_ID` - इसमें Kendra इंडेक्स का इंडेक्स ID होना चाहिए। ध्यान दें कि इंडेक्स ID एक 36 वर्णों का अल्फ़ान्यूमेरिक मान है जिसे इंडेक्स विवरण पृष्ठ में पाया जा सकता है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-aws-kendra
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add rag-aws-kendra
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_aws_kendra.chain import chain as rag_aws_kendra_chain

add_routes(app, rag_aws_kendra_chain, path="/rag-aws-kendra")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से एक सर्वर चलाते हुए FastAPI ऐप शुरू करेगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-aws-kendra/playground](http://127.0.0.1:8000/rag-aws-kendra/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-aws-kendra")
```
