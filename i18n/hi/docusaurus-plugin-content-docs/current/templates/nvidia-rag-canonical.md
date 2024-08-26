---
translated: true
---

# nvidia-rag-canonical

यह टेम्पलेट Milvus Vector Store और NVIDIA मॉडल्स (एम्बेडिंग और चैट) का उपयोग करके RAG करता है।

## वातावरण सेटअप

आपको अपना NVIDIA API कुंजी को एक पर्यावरण चर के रूप में निर्यात करना चाहिए।
यदि आपके पास NVIDIA API कुंजी नहीं है, तो आप इन चरणों का पालन करके एक बना सकते हैं:
1. [NVIDIA GPU Cloud](https://catalog.ngc.nvidia.com/) सेवा के साथ एक मुफ्त खाता बनाएं, जो AI समाधान कैटलॉग, कंटेनर, मॉडल आदि की मेजबानी करता है।
2. `Catalog > AI Foundation Models > (Model with API endpoint)` पर नेविगेट करें।
3. `API` विकल्प का चयन करें और `Generate Key` पर क्लिक करें।
4. उत्पन्न कुंजी को `NVIDIA_API_KEY` के रूप में सहेजें। वहां से, आपको एंडपॉइंट तक पहुंच होनी चाहिए।

```shell
export NVIDIA_API_KEY=...
```

Milvus Vector Store होस्ट करने के लिए निर्देशों के लिए, नीचे दिए गए खंड देखें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

NVIDIA मॉडल्स का उपयोग करने के लिए, Langchain NVIDIA AI Endpoints पैकेज स्थापित करें:

```shell
pip install -U langchain_nvidia_aiplay
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package nvidia-rag-canonical
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add nvidia-rag-canonical
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from nvidia_rag_canonical import chain as nvidia_rag_canonical_chain

add_routes(app, nvidia_rag_canonical_chain, path="/nvidia-rag-canonical")
```

यदि आप एक इंजेक्शन पाइपलाइन सेट अप करना चाहते हैं, तो आप अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ सकते हैं:

```python
from nvidia_rag_canonical import ingest as nvidia_rag_ingest

add_routes(app, nvidia_rag_ingest, path="/nvidia-rag-ingest")
```

ध्यान रखें कि इंजेक्शन एपीआई द्वारा इंजेक्ट की गई फ़ाइलों के लिए, नवीनतम इंजेक्ट की गई फ़ाइलों तक पहुंच प्राप्त करने के लिए सर्वर को पुनः प्रारंभ करना होगा।

(वैकल्पिक) अब आइए LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आपके पास कोई Milvus Vector Store नहीं है जिससे आप कनेक्ट करना चाहते हैं, तो कृपया आगे बढ़ने से पहले `Milvus Setup` खंड देखें।

यदि आपके पास एक Milvus Vector Store है जिससे आप कनेक्ट करना चाहते हैं, तो `nvidia_rag_canonical/chain.py` में कनेक्शन विवरण संपादित करें।

यदि आप इस निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस स्पिन अप कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/nvidia-rag-canonical/playground](http://127.0.0.1:8000/nvidia-rag-canonical/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/nvidia-rag-canonical")
```

## Milvus सेटअप

इस चरण का उपयोग करें यदि आपको एक Milvus Vector Store बनाने और डेटा इंजेक्ट करने की आवश्यकता है।
हम पहले मानक Milvus सेटअप निर्देशों का पालन करेंगे [यहां](https://milvus.io/docs/install_standalone-docker.md)।

1. Docker Compose YAML फ़ाइल डाउनलोड करें।
    ```shell
    wget https://github.com/milvus-io/milvus/releases/download/v2.3.3/milvus-standalone-docker-compose.yml -O docker-compose.yml
    ```
2. Milvus Vector Store कंटेनर शुरू करें
    ```shell
    sudo docker compose up -d
    ```
3. Milvus कंटेनर के साथ बातचीत करने के लिए PyMilvus पैकेज स्थापित करें।
    ```shell
    pip install pymilvus
    ```
4. अब कुछ डेटा इंजेक्ट करते हैं! हम इस निर्देशिका में जाकर और `ingest.py` में कोड चलाकर ऐसा कर सकते हैं, उदाहरण के लिए:

    ```shell
    python ingest.py
    ```

    ध्यान रखें कि आप इसे अपने पसंद के डेटा को इंजेक्ट करने के लिए बदल सकते हैं (और बदलने चाहिए!)।
