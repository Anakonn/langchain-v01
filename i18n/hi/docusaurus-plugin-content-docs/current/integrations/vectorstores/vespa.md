---
translated: true
---

# वेस्पा

>[वेस्पा](https://vespa.ai/) एक पूर्ण रूप से सुसज्जित खोज इंजन और वेक्टर डेटाबेस है। यह वेक्टर खोज (एएनएन), लेक्सिकल खोज और संरचित डेटा में खोज, सभी को एक ही क्वेरी में समर्थन करता है।

यह नोटबुक दिखाता है कि `Vespa.ai` को कैसे LangChain वेक्टर स्टोर के रूप में उपयोग किया जाए।

वेक्टर स्टोर बनाने के लिए, हम
[pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html) का उपयोग करते हैं
`Vespa` सेवा से कनेक्शन बनाने के लिए।

```python
%pip install --upgrade --quiet  pyvespa
```

`pyvespa` पैकेज का उपयोग करके, आप या तो
[Vespa क्लाउड इंस्टेंस](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)
या एक स्थानीय
[Docker इंस्टेंस](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html) से कनेक्ट कर सकते हैं।
यहां, हम एक नया Vespa एप्लिकेशन बनाएंगे और उसे Docker का उपयोग करके तैनात करेंगे।

#### Vespa एप्लिकेशन बनाना

पहले, हमें एक एप्लिकेशन पैकेज बनाना होगा:

```python
from vespa.package import ApplicationPackage, Field, RankProfile

app_package = ApplicationPackage(name="testapp")
app_package.schema.add_fields(
    Field(
        name="text", type="string", indexing=["index", "summary"], index="enable-bm25"
    ),
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary"],
        attribute=["distance-metric: angular"],
    ),
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="default",
        first_phase="closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

यह एक Vespa एप्लिकेशन सेट करता है जिसमें प्रत्येक दस्तावेज़ के लिए एक स्कीमा होती है जिसमें दो फ़ील्ड होते हैं: `text` दस्तावेज़ पाठ को रखने के लिए और `embedding` एम्बेडिंग वेक्टर को रखने के लिए। `text` फ़ील्ड को कुशल पाठ पुनर्प्राप्ति के लिए BM25 इंडेक्स का उपयोग करने के लिए सेट किया गया है, और हम थोड़ी देर बाद इसका और हाइब्रिड खोज का उपयोग करेंगे।

`embedding` फ़ील्ड को पाठ के एम्बेडिंग प्रतिनिधित्व को रखने के लिए 384 लंबाई का वेक्टर के साथ सेट किया गया है। Vespa के
[टेंसर गाइड](https://docs.vespa.ai/en/tensor-user-guide.html)
में और अधिक जानकारी देखें।

अंत में, हम एक [रैंक प्रोफ़ाइल](https://docs.vespa.ai/en/ranking.html) जोड़ते हैं
Vespa को दस्तावेज़ों को कैसे क्रमबद्ध करना है, इसे बताने के लिए। यहां हमने इसे
[नजदीकी पड़ोसी खोज](https://docs.vespa.ai/en/nearest-neighbor-search.html) के साथ सेट किया है।

अब हम इस एप्लिकेशन को स्थानीय रूप से तैनात कर सकते हैं:

```python
from vespa.deployment import VespaDocker

vespa_docker = VespaDocker()
vespa_app = vespa_docker.deploy(application_package=app_package)
```

यह एक `Vespa` सेवा को तैनात और कनेक्ट करता है। यदि आपके पास पहले से ही एक Vespa एप्लिकेशन चल रहा है, उदाहरण के लिए क्लाउड में, कृपया PyVespa एप्लिकेशन देखें कि कैसे कनेक्ट करें।

#### Vespa वेक्टर स्टोर बनाना

अब, आइए कुछ दस्तावेज़ लोड करें:

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)

embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
```

यहां, हमने स्थानीय वाक्य एम्बेडर भी सेट किया है जो पाठ को एम्बेडिंग वेक्टर में रूपांतरित करता है। एक OpenAI एम्बेडिंग का भी उपयोग किया जा सकता है, लेकिन वेक्टर लंबाई को `1536` पर अपडेट करना होगा ताकि उस बड़े आकार के एम्बेडिंग को प्रतिबिंबित किया जा सके।

इन्हें Vespa में भेजने के लिए, हमें कॉन्फ़िगर करना होगा कि वेक्टर स्टोर को Vespa एप्लिकेशन में फ़ील्ड्स से कैसे मैप करना है। फिर हम इन दस्तावेज़ों के सेट से सीधे वेक्टर स्टोर बनाते हैं:

```python
vespa_config = dict(
    page_content_field="text",
    embedding_field="embedding",
    input_field="query_embedding",
)

from langchain_community.vectorstores import VespaStore

db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

यह एक Vespa वेक्टर स्टोर बनाता है और उन दस्तावेज़ों का सेट को Vespa में डालता है।
वेक्टर स्टोर प्रत्येक दस्तावेज़ के लिए एम्बेडिंग फ़ंक्शन को कॉल करने और उन्हें डेटाबेस में डालने का ध्यान रखता है।

अब हम वेक्टर स्टोर को क्वेरी कर सकते हैं:

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)

print(results[0].page_content)
```

यह ऊपर दिए गए एम्बेडिंग फ़ंक्शन का उपयोग करके क्वेरी के लिए एक प्रतिनिधित्व बनाएगा और उसका उपयोग Vespa में खोजने के लिए करेगा। ध्यान दें कि यह `default` रैंकिंग फ़ंक्शन का उपयोग करेगा, जिसे हमने ऊपर एप्लिकेशन पैकेज में सेट किया था। आप `ranking` तर्क का उपयोग `similarity_search` में कर सकते हैं
उपयोग करने के लिए कौन सा रैंकिंग फ़ंक्शन।

अधिक जानकारी के लिए [pyvespa दस्तावेज़ीकरण](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query) देखें।

यह LangChain में Vespa स्टोर के मूलभूत उपयोग को कवर करता है।
अब आप परिणामों को वापस ला सकते हैं और LangChain में इनका उपयोग जारी रख सकते हैं।

#### दस्तावेज़ अपडेट करना

`from_documents` कॉल करने के एक वैकल्पिक तरीके के रूप में, आप सीधे वेक्टर
स्टोर बना सकते हैं और उससे `add_texts` कॉल कर सकते हैं। इसका उपयोग दस्तावेज़ अपडेट करने के लिए भी किया जा सकता है:

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)
result = results[0]

result.page_content = "UPDATED: " + result.page_content
db.add_texts([result.page_content], [result.metadata], result.metadata["id"])

results = db.similarity_search(query)
print(results[0].page_content)
```

हालांकि, `pyvespa` लाइब्रेरी में Vespa पर सामग्री को संशोधित करने के लिए विधियां हैं जिनका आप सीधे उपयोग कर सकते हैं।

#### दस्तावेज़ हटाना

आप `delete` फ़ंक्शन का उपयोग करके दस्तावेज़ हटा सकते हैं:

```python
result = db.similarity_search(query)
# docs[0].metadata["id"] == "id:testapp:testapp::32"

db.delete(["32"])
result = db.similarity_search(query)
# docs[0].metadata["id"] != "id:testapp:testapp::32"
```

फिर से, `pyvespa` कनेक्शन में दस्तावेज़ हटाने के लिए भी विधियां हैं।

### स्कोर के साथ वापस लौटना

`similarity_search` विधि केवल प्रासंगिकता के क्रम में दस्तावेज़ लौटाती है। वास्तविक स्कोर प्राप्त करने के लिए:

```python
results = db.similarity_search_with_score(query)
result = results[0]
# result[1] ~= 0.463
```

यह `"all-MiniLM-L6-v2"` एम्बेडिंग मॉडल का उपयोग करके कोसाइन दूरी फ़ंक्शन (जैसा कि एप्लिकेशन फ़ंक्शन में `angular` तर्क द्वारा दिया गया है) का परिणाम है।

अलग-अलग एम्बेडिंग फ़ंक्शन अलग-अलग दूरी फ़ंक्शन की आवश्यकता होती है, और Vespa को पता होना चाहिए कि दस्तावेज़ों को क्रमबद्ध करने के लिए कौन सा दूरी फ़ंक्शन उपयोग करना है।
अधिक जानकारी के लिए
[दूरी फ़ंक्शनों पर दस्तावेज़ीकरण](https://docs.vespa.ai/en/reference/schema-reference.html#distance-metric)
देखें।

### पुनर्प्राप्तकर्ता के रूप में

इस वेक्टर स्टोर को
[LangChain पुनर्प्राप्तकर्ता](/docs/modules/data_connection/retrievers/)
के रूप में उपयोग करने के लिए, बस `as_retriever` फ़ंक्शन को कॉल करें, जो एक मानक वेक्टर स्टोर विधि है:

```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
retriever = db.as_retriever()
query = "What did the president say about Ketanji Brown Jackson"
results = retriever.invoke(query)

# results[0].metadata["id"] == "id:testapp:testapp::32"
```

यह वेक्टर स्टोर से अधिक सामान्य, अव्यवस्थित, पुनर्प्राप्ति की अनुमति देता है।

### मेटाडेटा

अब तक के उदाहरण में, हमने केवल पाठ और उस पाठ के लिए एम्बेडिंग का उपयोग किया है। दस्तावेज़ में आमतौर पर अतिरिक्त जानकारी होती है, जिसे LangChain में मेटाडेटा कहा जाता है।

Vespa में एप्लिकेशन पैकेज में उन्हें जोड़कर कई प्रकार के फ़ील्ड हो सकते हैं:

```python
app_package.schema.add_fields(
    # ...
    Field(name="date", type="string", indexing=["attribute", "summary"]),
    Field(name="rating", type="int", indexing=["attribute", "summary"]),
    Field(name="author", type="string", indexing=["attribute", "summary"]),
    # ...
)
vespa_app = vespa_docker.deploy(application_package=app_package)
```

हम दस्तावेज़ों में कुछ मेटाडेटा फ़ील्ड जोड़ सकते हैं:

```python
# Add metadata
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"2023-{(i % 12)+1}-{(i % 28)+1}"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["Joe Biden", "Unknown"][min(i, 1)]
```

और Vespa वेक्टर स्टोर को इन फ़ील्ड्स के बारे में बताएं:

```python
vespa_config.update(dict(metadata_fields=["date", "rating", "author"]))
```

अब, इन दस्तावेज़ों को खोजते समय, ये फ़ील्ड वापस लौटाए जाएंगे।
इन फ़ील्ड्स पर फ़िल्टर भी किया जा सकता है:

```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, filter="rating > 3")
# results[0].metadata["id"] == "id:testapp:testapp::34"
# results[0].metadata["author"] == "Unknown"
```

### कस्टम क्वेरी

यदि समानता खोज का डिफ़ॉल्ट व्यवहार आपकी
आवश्यकताओं के अनुकूल नहीं है, तो आप हमेशा अपना खुद का क्वेरी प्रदान कर सकते हैं। इस प्रकार, आपको
वेक्टर स्टोर को सभी कॉन्फ़िगरेशन प्रदान करने की आवश्यकता नहीं है, बल्कि
केवल इसे स्वयं लिखें।

पहले, आइए अपने एप्लिकेशन में BM25 रैंकिंग फ़ंक्शन जोड़ें:

```python
from vespa.package import FieldSet

app_package.schema.add_field_set(FieldSet(name="default", fields=["text"]))
app_package.schema.add_rank_profile(RankProfile(name="bm25", first_phase="bm25(text)"))
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

फिर, BM25 के आधार पर एक सामान्य पाठ खोज करने के लिए:

```python
query = "What did the president say about Ketanji Brown Jackson"
custom_query = {
    "yql": "select * from sources * where userQuery()",
    "query": query,
    "type": "weakAnd",
    "ranking": "bm25",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"] == "id:testapp:testapp::32"
# results[0][1] ~= 14.384
```

वेस्पा की सभी शक्तिशाली खोज और क्वेरी क्षमताओं का उपयोग किया जा सकता है
कस्टम क्वेरी का उपयोग करके। कृपया [क्वेरी एपीआई](https://docs.vespa.ai/en/query-api.html) पर वेस्पा दस्तावेज़ देखें।

### हाइब्रिड खोज

हाइब्रिड खोज का मतलब है BM25 जैसी एक क्लासिक शब्द-आधारित खोज और
वेक्टर खोज का उपयोग करके परिणामों को संयुक्त करना। हमें वेस्पा पर हाइब्रिड खोज के लिए
एक नया रैंक प्रोफ़ाइल बनाना होगा:

```python
app_package.schema.add_rank_profile(
    RankProfile(
        name="hybrid",
        first_phase="log(bm25(text)) + 0.5 * closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

यहां, हम प्रत्येक दस्तावेज़ को इसके BM25 स्कोर और इसकी
दूरी स्कोर का संयोजन के रूप में स्कोर करते हैं। हम कस्टम क्वेरी का उपयोग करके क्वेरी कर सकते हैं:

```python
query = "What did the president say about Ketanji Brown Jackson"
query_embedding = embedding_function.embed_query(query)
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(embedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression} and userQuery()",
    "query": query,
    "type": "weakAnd",
    "input.query(query_embedding)": query_embedding,
    "ranking": "hybrid",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 2.897
```

### वेस्पा में नेटिव एम्बेडर

अब तक हमने पाठों के लिए एम्बेडिंग फ़ंक्शन का उपयोग पायथन में किया है। वेस्पा एम्बेडिंग फ़ंक्शन का समर्थन करता है, इसलिए
आप इस गणना को वेस्पा में स्थानांतरित कर सकते हैं। एक लाभ यह है कि आप यदि आपके पास बड़ा संग्रह है तो
दस्तावेजों को एम्बेड करने के लिए जीपीयू का उपयोग कर सकते हैं।

[वेस्पा एम्बेडिंग](https://docs.vespa.ai/en/embedding.html) पर अधिक जानकारी के लिए कृपया देखें।

पहले, हमें अपने एप्लिकेशन पैकेज को संशोधित करना होगा:

```python
from vespa.package import Component, Parameter

app_package.components = [
    Component(
        id="hf-embedder",
        type="hugging-face-embedder",
        parameters=[
            Parameter("transformer-model", {"path": "..."}),
            Parameter("tokenizer-model", {"url": "..."}),
        ],
    )
]
Field(
    name="hfembedding",
    type="tensor<float>(x[384])",
    is_document_field=False,
    indexing=["input text", "embed hf-embedder", "attribute", "summary"],
    attribute=["distance-metric: angular"],
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="hf_similarity",
        first_phase="closeness(field, hfembedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

एम्बेडर मॉडल और टोकनाइज़र को एप्लिकेशन में जोड़ने के बारे में एम्बेडिंग दस्तावेज़ देखें। ध्यान दें कि `hfembedding` फ़ील्ड
`hf-embedder` का उपयोग करके एम्बेडिंग के लिए निर्देश शामिल करता है।

अब हम कस्टम क्वेरी का उपयोग करके क्वेरी कर सकते हैं:

```python
query = "What did the president say about Ketanji Brown Jackson"
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(internalembedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression}",
    "input.query(query_embedding)": f'embed(hf-embedder, "{query}")',
    "ranking": "internal_similarity",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 0.630
```

ध्यान दें कि यहां क्वेरी में `embed` निर्देश शामिल है जो दस्तावेज़ों के लिए उपयोग किए गए मॉडल का उपयोग करके क्वेरी को एम्बेड करता है।

### लगभग नजदीकी पड़ोसी

उपरोक्त सभी उदाहरणों में, हमने सटीक नजदीकी पड़ोसी का उपयोग किया है
परिणाम प्राप्त करने के लिए।然而, बड़े संग्रह के दस्तावेजों के लिए यह
संभव नहीं है क्योंकि सर्वश्रेष्ठ मैच खोजने के लिए सभी दस्तावेजों को स्कैन करना होता है। इससे बचने के लिए, हम
[लगभग नजदीकी पड़ोसी](https://docs.vespa.ai/en/approximate-nn-hnsw.html) का उपयोग कर सकते हैं।

पहले, हम एम्बेडिंग फ़ील्ड को बदलकर HNSW इंडेक्स बना सकते हैं:

```python
from vespa.package import HNSW

app_package.schema.add_fields(
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary", "index"],
        ann=HNSW(
            distance_metric="angular",
            max_links_per_node=16,
            neighbors_to_explore_at_insert=200,
        ),
    )
)
```

यह एम्बेडिंग डेटा पर HNSW इंडेक्स बनाता है जो कुशल
खोज की अनुमति देता है। इसे सेट करने के साथ, हम `approximate` तर्क को `True` सेट करके आसानी से ANN का उपयोग करके खोज कर सकते हैं:

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, approximate=True)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
```

यह LangChain में वेस्पा वेक्टर स्टोर की अधिकांश क्षमताओं को कवर करता है।
