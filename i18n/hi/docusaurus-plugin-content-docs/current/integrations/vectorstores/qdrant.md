---
translated: true
---

# क्यूड्रेंट

>[क्यूड्रेंट](https://qdrant.tech/documentation/) (पढ़ें: क्वाड्रेंट) एक वेक्टर समानता खोज इंजन है। यह एक उत्पादन-तैयार सेवा प्रदान करता है जिसमें बिंदुओं - वेक्टरों के साथ अतिरिक्त पेलोड को संग्रहीत, खोजने और प्रबंधित करने के लिए एक सुविधाजनक API है। `क्यूड्रेंट` विस्तृत फ़िल्टरिंग समर्थन के लिए अनुकूलित है। यह न्यूरल नेटवर्क या सेमांटिक-आधारित मैचिंग, फ़ेसेटेड खोज और अन्य अनुप्रयोगों के लिए उपयोगी बनाता है।

यह नोटबुक `क्यूड्रेंट` वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

`क्यूड्रेंट` को चलाने के विभिन्न तरीके हैं, और चुने गए तरीके पर कुछ सूक्ष्म अंतर होंगे। विकल्पों में शामिल हैं:
- स्थानीय मोड, सर्वर की आवश्यकता नहीं है
- ऑन-प्रिमाइज़ सर्वर तैनाती
- क्यूड्रेंट क्लाउड

[स्थापना निर्देशों](https://qdrant.tech/documentation/install/) देखें।

```python
%pip install --upgrade --quiet  qdrant-client
```

हमें `OpenAIEmbeddings` का उपयोग करना है, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Qdrant
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

## LangChain से क्यूड्रेंट से कनेक्ट करना

### स्थानीय मोड

पायथन क्लाइंट आपको क्यूड्रेंट सर्वर चलाए बिना स्थानीय मोड में ही वही कोड चलाने की अनुमति देता है। यह परीक्षण और डीबगिंग के लिए बहुत अच्छा है या यदि आप केवल थोड़े से वेक्टर संग्रहीत करने की योजना बना रहे हैं। एम्बेडिंग को पूरी तरह से मेमोरी में रखा जा सकता है या डिस्क पर संरक्षित किया जा सकता है।

#### मेमोरी में

कुछ परीक्षण परिदृश्यों और त्वरित प्रयोगों के लिए, आप सभी डेटा को केवल मेमोरी में रखना पसंद कर सकते हैं, इसलिए यह क्लाइंट को नष्ट होने पर खो जाता है - आमतौर पर आपके स्क्रिप्ट/नोटबुक के अंत में।

```python
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",  # Local mode with in-memory storage only
    collection_name="my_documents",
)
```

#### डिस्क पर संग्रहण

स्थानीय मोड, क्यूड्रेंट सर्वर का उपयोग किए बिना, आपके वेक्टरों को डिस्क पर भी संग्रहीत कर सकता है ताकि वे रनों के बीच बने रहें।

```python
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    path="/tmp/local_qdrant",
    collection_name="my_documents",
)
```

### ऑन-प्रिमाइज़ सर्वर तैनाती

चाहे आप [एक Docker कंटेनर](https://qdrant.tech/documentation/install/) के साथ स्थानीय रूप से क्यूड्रेंट लॉन्च करने का चुनाव करें, या [आधिकारिक Helm चार्ट](https://github.com/qdrant/qdrant-helm) के साथ Kubernetes तैनाती का चुनाव करें, ऐसे एक उदाहरण से कनेक्ट करने का तरीका समान होगा। आपको सेवा की ओर इशारा करने वाला URL प्रदान करना होगा।

```python
url = "<---qdrant url here --->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
)
```

### क्यूड्रेंट क्लाउड

यदि आप अवसंरचना प्रबंधन में खुद को व्यस्त नहीं रखना चाहते हैं, तो आप [क्यूड्रेंट क्लाउड](https://cloud.qdrant.io/) पर पूरी तरह से प्रबंधित क्यूड्रेंट क्लस्टर सेट अप करने का चुनाव कर सकते हैं। आजमाने के लिए एक मुफ़्त हमेशा 1GB क्लस्टर शामिल है। क्यूड्रेंट के प्रबंधित संस्करण का उपयोग करने का मुख्य अंतर यह है कि आपको अपने तैनाती को सार्वजनिक रूप से पहुंच से सुरक्षित करने के लिए एक API कुंजी प्रदान करनी होगी।

```python
url = "<---qdrant cloud cluster url here --->"
api_key = "<---api key here--->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    api_key=api_key,
    collection_name="my_documents",
)
```

## संग्रह को पुनः बनाना

`Qdrant.from_texts` और `Qdrant.from_documents` दोनों विधियां Langchain के साथ क्यूड्रेंट का उपयोग शुरू करने के लिए बहुत अच्छी हैं। पिछले संस्करणों में संग्रह को हर बार इनमें से किसी भी कॉल पर पुनर्निर्मित किया जाता था। यह व्यवहार बदल गया है। वर्तमान में, यदि संग्रह पहले से मौजूद है, तो उसका पुनः उपयोग किया जाएगा। `force_recreate` को `True` पर सेट करने से पुराने संग्रह को हटाया जा सकता है और शुरू से शुरू किया जा सकता है।

```python
url = "<---qdrant url here --->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
    force_recreate=True,
)
```

## समानता खोज

क्यूड्रेंट वेक्टर स्टोर का उपयोग करने का सबसे सरल पटकथा समानता खोज करना है। हमारे क्वेरी को `embedding_function` के साथ एनकोड किया जाएगा और क्यूड्रेंट संग्रह में समान दस्तावेज़ों को खोजने के लिए उपयोग किया जाएगा।

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search(query)
```

```python
print(found_docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## स्कोर के साथ समानता खोज

कभी-कभी हम खोज करना चाहते हैं, लेकिन प्रासंगिकता स्कोर भी प्राप्त करना चाहते हैं ताकि हम जान सकें कि कोई विशिष्ट परिणाम कितना अच्छा है।
लौटाया गया दूरी स्कोर कोसाइन दूरी है। इसलिए, एक कम स्कोर बेहतर है।

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search_with_score(query)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Score: 0.8153784913324512
```

### मेटाडेटा फ़िल्टरिंग

क्यूड्रेंट में [विस्तृत फ़िल्टरिंग प्रणाली](https://qdrant.tech/documentation/concepts/filtering/) है जिसमें समृद्ध प्रकार समर्थन है। Langchain में फ़िल्टर का उपयोग करना भी संभव है, `similarity_search_with_score` और `similarity_search` दोनों विधियों में अतिरिक्त पैरामीटर पास करके।

```python
from qdrant_client.http import models as rest

query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search_with_score(query, filter=rest.Filter(...))
```

## अधिकतम सीमांत प्रासंगिकता खोज (MMR)

यदि आप कुछ समान दस्तावेज़ों को देखना चाहते हैं, लेकिन आप विविध परिणाम भी प्राप्त करना चाहते हैं, तो MMR एक ऐसी विधि है जिसे आप विचार कर सकते हैं। अधिकतम सीमांत प्रासंगिकता क्वेरी के समानता और चयनित दस्तावेजों के बीच विविधता के लिए अनुकूलित करता है।

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

```python
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```

```output
1. Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

2. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
```

## एक पुनर्प्राप्तकर्ता के रूप में क्यूड्रेंट

क्यूड्रेंट, अन्य सभी वेक्टर स्टोर की तरह, कोसाइन समानता का उपयोग करके एक LangChain पुनर्प्राप्तकर्ता है।

```python
retriever = qdrant.as_retriever()
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.qdrant.Qdrant object at 0x7fc4e5720a00>, search_type='similarity', search_kwargs={})
```

इसे खोज रणनीति के रूप में समानता के बजाय MMR का उपयोग करने के लिए भी निर्दिष्ट किया जा सकता है।

```python
retriever = qdrant.as_retriever(search_type="mmr")
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.qdrant.Qdrant object at 0x7fc4e5720a00>, search_type='mmr', search_kwargs={})
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

## क्यूड्रेंट को अनुकूलित करना

अपने Langchain अनुप्रयोग में मौजूदा क्यूड्रेंट संग्रह का उपयोग करने के कुछ विकल्प हैं। ऐसे मामलों में, आपको Langchain `Document` में क्यूड्रेंट बिंदु को मैप करने का तरीका परिभाषित करने की आवश्यकता हो सकती है।

### नामित वेक्टर

क्यूड्रेंट [प्रति बिंदु एक से अधिक वेक्टर](https://qdrant.tech/documentation/concepts/collections/#collection-with-multiple-vectors) का समर्थन करता है नामित वेक्टरों द्वारा। Langchain को प्रत्येक दस्तावेज़ के लिए केवल एक एम्बेडिंग की आवश्यकता होती है और, डिफ़ॉल्ट रूप से, एक ही वेक्टर का उपयोग करता है। हालांकि, यदि आप बाहरी रूप से बनाए गए संग्रह के साथ काम कर रहे हैं या नामित वेक्टर का उपयोग करना चाहते हैं, तो आप इसे उसके नाम प्रदान करके कॉन्फ़िगर कर सकते हैं।

```python
Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    vector_name="custom_vector",
)
```

एक Langchain उपयोगकर्ता के रूप में, आप देखेंगे कि क्या आप नामित वेक्टर का उपयोग कर रहे हैं या नहीं। क्यूड्रेंट एकीकरण इसे पृष्ठभूमि में संभाल लेगा।

### मेटाडेटा

Qdrant आपके वेक्टर एम्बेडिंग्स को वैकल्पिक JSON-like पेलोड के साथ संग्रहीत करता है। पेलोड वैकल्पिक हैं, लेकिन चूंकि LangChain मानता है कि एम्बेडिंग्स दस्तावेजों से उत्पन्न होती हैं, इसलिए हम संदर्भ डेटा को बनाए रखते हैं, ताकि आप मूल पाठों को भी निकाल सकें।

डिफ़ॉल्ट रूप से, आपका दस्तावेज निम्नलिखित पेलोड संरचना में संग्रहीत किया जाएगा:

```json
{
    "page_content": "Lorem ipsum dolor sit amet",
    "metadata": {
        "foo": "bar"
    }
}
```

हालांकि, आप पृष्ठ सामग्री और मेटाडेटा के लिए अलग-अलग कुंजियों का उपयोग करने का फैसला कर सकते हैं। यह उपयोगी है यदि आप पहले से ही एक संग्रह है जिसका आप पुनः उपयोग करना चाहते हैं।

```python
Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    content_payload_key="my_page_content_key",
    metadata_payload_key="my_meta",
)
```

```output
<langchain_community.vectorstores.qdrant.Qdrant at 0x7fc4e2baa230>
```
