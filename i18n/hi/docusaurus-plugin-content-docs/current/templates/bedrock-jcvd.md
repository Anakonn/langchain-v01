---
translated: true
---

# बेड्रॉक JCVD 🕺🥋

## अवलोकन

LangChain टेम्पलेट जो [एंथ्रोपिक के क्लॉड पर अमेज़न बेड्रॉक](https://aws.amazon.com/bedrock/claude/) का उपयोग करके JCVD की तरह व्यवहार करता है।

> मैं चैटबॉट्स का फ्रेड एस्टेयर हूं! 🕺

## वातावरण सेटअप

### AWS क्रेडेंशियल्स

यह टेम्पलेट [बोटो3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html), पायथन के लिए AWS SDK, का उपयोग करता है [अमेज़न बेड्रॉक](https://aws.amazon.com/bedrock/) को कॉल करने के लिए। आप **जरूर** AWS क्रेडेंशियल्स *और* एक AWS क्षेत्र कॉन्फ़िगर करें ताकि अनुरोध किए जा सकें।

> इस बारे में जानकारी के लिए, [AWS बोटो3 दस्तावेज़ीकरण](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html) (डेवलपर गाइड > क्रेडेंशियल्स) देखें।

### फाउंडेशन मॉडल्स

डिफ़ॉल्ट रूप से, यह टेम्पलेट [एंथ्रोपिक के क्लॉड v2](https://aws.amazon.com/about-aws/whats-new/2023/08/claude-2-foundation-model-anthropic-amazon-bedrock/) (`anthropic.claude-v2`) का उपयोग करता है।

> किसी विशिष्ट मॉडल तक पहुंच मांगने के लिए, [अमेज़न बेड्रॉक यूज़र गाइड](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) (मॉडल एक्सेस) देखें।

किसी अन्य मॉडल का उपयोग करने के लिए, `BEDROCK_JCVD_MODEL_ID` पर्यावरण चर सेट करें। [अमेज़न बेड्रॉक यूज़र गाइड](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids-arns.html) (API का उपयोग करें > API ऑपरेशन > रन इन्फरेंस > बेस मॉडल आईडी) में आधार मॉडलों की एक सूची उपलब्ध है।

> उपलब्ध मॉडलों (आधार और [कस्टम मॉडल](https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html)) सहित) की पूरी सूची [अमेज़न बेड्रॉक कंसोल](https://docs.aws.amazon.com/bedrock/latest/userguide/using-console.html) में **फाउंडेशन मॉडल्स** के तहत या [`aws bedrock list-foundation-models`](https://docs.aws.amazon.com/cli/latest/reference/bedrock/list-foundation-models.html) कॉल करके उपलब्ध है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package bedrock-jcvd
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add bedrock-jcvd
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from bedrock_jcvd import chain as bedrock_jcvd_chain

add_routes(app, bedrock_jcvd_chain, path="/bedrock-jcvd")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
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

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।

हम [http://127.0.0.1:8000/bedrock-jcvd/playground](http://127.0.0.1:8000/bedrock-jcvd/playground) पर खेल भी देख सकते हैं।
