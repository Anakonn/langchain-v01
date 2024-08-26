---
translated: true
---

# mongo-parent-document-retrieval

यह टेम्पलेट MongoDB और OpenAI का उपयोग करके RAG (Retrieval Augmented Generation) करता है।
यह RAG का एक उन्नत रूप है जिसे पेरेंट-डॉक्यूमेंट रिट्रीवल कहा जाता है।

इस रिट्रीवल के रूप में, एक बड़ा दस्तावेज़ पहले मध्यम आकार के टुकड़ों में विभाजित किया जाता है।
उसके बाद, इन मध्यम आकार के टुकड़ों को छोटे टुकड़ों में विभाजित किया जाता है।
छोटे टुकड़ों के लिए एम्बेडिंग बनाई जाती हैं।
जब कोई क्वेरी आती है, तो उस क्वेरी के लिए एक एम्बेडिंग बनाई जाती है और छोटे टुकड़ों से तुलना की जाती है।
लेकिन छोटे टुकड़ों को सीधे LLM के लिए पास नहीं किया जाता है, बल्कि उन छोटे टुकड़ों के मूल मध्यम आकार के टुकड़े पास किए जाते हैं।
यह अधिक सटीक खोज को सक्षम करता है, लेकिन फिर भी बड़े संदर्भ (जो जनरेशन के दौरान उपयोगी हो सकता है) को पास करता है।

## Environment Setup

आपको दो पर्यावरण चर निर्यात करने चाहिए, एक आपका MongoDB URI और दूसरा आपका OpenAI API KEY।
यदि आपके पास MongoDB URI नहीं है, तो नीचे दिए गए `Setup Mongo` सेक्शन में निर्देश देखें कि कैसे करें।

```shell
export MONGO_URI=...
export OPENAI_API_KEY=...
```

## Usage

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package mongo-parent-document-retrieval
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add mongo-parent-document-retrieval
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from mongo_parent_document_retrieval import chain as mongo_parent_document_retrieval_chain

add_routes(app, mongo_parent_document_retrieval_chain, path="/mongo-parent-document-retrieval")
```

(वैकल्पिक) अब आइए LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आपके पास पहले से कोई Mongo Search Index नहीं है जिससे आप कनेक्ट करना चाहते हैं, तो आगे बढ़ने से पहले `MongoDB Setup` खंड देखें।
ध्यान रखें कि क्योंकि पेरेंट डॉक्यूमेंट रिट्रीवल एक अलग इंडेक्सिंग रणनीति का उपयोग करता है, इसलिए आपको शायद इस नए सेटअप को चलाना होगा।

यदि आप पहले से किसी MongoDB Search index से कनेक्ट करना चाहते हैं, तो `mongo_parent_document_retrieval/chain.py` में कनेक्शन विवरण संपादित करें।

यदि आप इस निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम सभी टेम्पलेट को [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं।
हम [http://127.0.0.1:8000/mongo-parent-document-retrieval/playground](http://127.0.0.1:8000/mongo-parent-document-retrieval/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/mongo-parent-document-retrieval")
```

अधिक संदर्भ के लिए, कृपया [इस नोटबुक](https://colab.research.google.com/drive/1cr2HBAHyBmwKUerJq2if0JaNhy-hIq7I#scrollTo=TZp7_CBfxTOB) का संदर्भ लें।

## MongoDB Setup

यदि आपको अपने MongoDB खाते और डेटा को इंजेस्ट करने की आवश्यकता है, तो इस चरण का उपयोग करें।
हम पहले मानक MongoDB Atlas सेटअप निर्देशों का पालन करेंगे [यहाँ](https://www.mongodb.com/docs/atlas/getting-started/)।

1. एक खाता बनाएं (यदि पहले से नहीं किया गया है)
2. एक नया प्रोजेक्ट बनाएं (यदि पहले से नहीं किया गया है)
3. अपना MongoDB URI ढूंढें।

यह करने के लिए, तैनाती अवलोकन पृष्ठ पर जाएं और अपने डेटाबेस से कनेक्ट करें।

फिर हम उपलब्ध ड्राइवरों को देखते हैं।

इनमें से हम अपना URI सूचीबद्ध देखेंगे।

चलो फिर उसे स्थानीय रूप से एक पर्यावरण चर के रूप में सेट करते हैं:

```shell
export MONGO_URI=...
```

4. हम OpenAI के लिए भी एक पर्यावरण चर सेट करेंगे (जिसका हम एक LLM के रूप में उपयोग करेंगे)।

```shell
export OPENAI_API_KEY=...
```

5. अब कुछ डेटा इंजेक्ट करते हैं! हम इस निर्देशिका में जाकर और `ingest.py` में कोड चलाकर ऐसा कर सकते हैं, उदाहरण के लिए:

```shell
python ingest.py
```

ध्यान रखें कि आप इसे अपने पसंद के डेटा को इंजेक्ट करने के लिए बदल सकते (और बदलने चाहिए)।

6. अब हमें अपने डेटा पर एक वेक्टर इंडेक्स सेट करना है।

हम पहले उस क्लस्टर से कनेक्ट कर सकते हैं जहां हमारा डेटाबेस है।

फिर हम उन सभी संग्रहों की सूची में नेविगेट कर सकते हैं।

फिर हम उस संग्रह को ढूंढ सकते हैं जिसे हम चाहते हैं और उस संग्रह के लिए खोज इंडेक्स देख सकते हैं।

यह संभवतः खाली होगा, और हमें एक नया बनाना होगा:

हम JSON एडिटर का उपयोग करके इसे बनाएंगे।

और हम निम्नलिखित JSON को पेस्ट करेंगे:

```text
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "doc_level": [
        {
          "type": "token"
        }
      ],
      "embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}
```

वहां से, "Next" पर क्लिक करें और फिर "Create Search Index" पर। यह थोड़ा समय लेगा, लेकिन फिर आपके पास अपने डेटा पर एक इंडेक्स होना चाहिए!
