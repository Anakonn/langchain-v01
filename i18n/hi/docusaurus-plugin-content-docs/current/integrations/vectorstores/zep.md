---
translated: true
---

# जेप

> चैट इतिहास को याद करें, समझें और उससे डेटा निकालें। व्यक्तिगत AI अनुभव को सशक्त बनाएं।

> [जेप](https://www.getzep.com) एक दीर्घकालिक मेमोरी सेवा है AI सहायक ऐप्स के लिए।
> जेप के साथ, आप AI सहायकों को पिछली वार्तालापों को याद करने की क्षमता प्रदान कर सकते हैं, भले ही वे कितने दूर हों,
> साथ ही हैल्यूसिनेशन, लेटेंसी और लागत को भी कम कर सकते हैं।

> जेप क्लाउड में रुचि हैं? देखें [जेप क्लाउड इंस्टॉलेशन गाइड](https://help.getzep.com/sdks) और [जेप क्लाउड वेक्टर स्टोर उदाहरण](https://help.getzep.com/langchain/examples/vectorstore-example)

## ओपन सोर्स इंस्टॉलेशन और सेटअप

> जेप ओपन सोर्स प्रोजेक्ट: [https://github.com/getzep/zep](https://github.com/getzep/zep)
>
> जेप ओपन सोर्स डॉक्स: [https://docs.getzep.com/](https://docs.getzep.com/)

## उपयोग

नीचे दिए गए उदाहरणों में, हम जेप के ऑटो-एम्बेडिंग फीचर का उपयोग कर रहे हैं जो जेप सर्वर पर दस्तावेजों को कम लेटेंसी एम्बेडिंग मॉडल का उपयोग करके स्वचालित रूप से एम्बेड करता है।

## नोट

- ये उदाहरण जेप के एसिंक्रोनस इंटरफ़ेस का उपयोग करते हैं। सिंक्रोनस इंटरफ़ेस को कॉल करने के लिए, मेथड नामों से 'a' प्रिफ़िक्स को हटा दें।
- यदि आप एक `Embeddings` इंस्टेंस पास करते हैं, तो जेप इसका उपयोग करके दस्तावेजों को एम्बेड करेगा, न कि स्वचालित रूप से एम्बेड करेगा।
आपको अपने दस्तावेज संग्रह को `isAutoEmbedded === false` पर भी सेट करना होगा।
- यदि आप अपने संग्रह को `isAutoEmbedded === false` पर सेट करते हैं, तो आपको एक `Embeddings` इंस्टेंस पास करना होगा।

## संग्रह से दस्तावेज लोड करें या बनाएं

```python
from uuid import uuid4

from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import ZepVectorStore
from langchain_community.vectorstores.zep import CollectionConfig
from langchain_text_splitters import RecursiveCharacterTextSplitter

ZEP_API_URL = "http://localhost:8000"  # this is the API url of your Zep instance
ZEP_API_KEY = "<optional_key>"  # optional API Key for your Zep instance
collection_name = f"babbage{uuid4().hex}"  # a unique collection name. alphanum only

# Collection config is needed if we're creating a new Zep Collection
config = CollectionConfig(
    name=collection_name,
    description="<optional description>",
    metadata={"optional_metadata": "associated with the collection"},
    is_auto_embedded=True,  # we'll have Zep embed our documents using its low-latency embedder
    embedding_dimensions=1536,  # this should match the model you've configured Zep to use.
)

# load the document
article_url = "https://www.gutenberg.org/cache/epub/71292/pg71292.txt"
loader = WebBaseLoader(article_url)
documents = loader.load()

# split it into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# Instantiate the VectorStore. Since the collection does not already exist in Zep,
# it will be created and populated with the documents we pass in.
vs = ZepVectorStore.from_documents(
    docs,
    collection_name=collection_name,
    config=config,
    api_url=ZEP_API_URL,
    api_key=ZEP_API_KEY,
    embedding=None,  # we'll have Zep embed our documents using its low-latency embedder
)
```

```python
# wait for the collection embedding to complete


async def wait_for_ready(collection_name: str) -> None:
    import time

    from zep_python import ZepClient

    client = ZepClient(ZEP_API_URL, ZEP_API_KEY)

    while True:
        c = await client.document.aget_collection(collection_name)
        print(
            "Embedding status: "
            f"{c.document_embedded_count}/{c.document_count} documents embedded"
        )
        time.sleep(1)
        if c.status == "ready":
            break


await wait_for_ready(collection_name)
```

```output
Embedding status: 0/401 documents embedded
Embedding status: 0/401 documents embedded
Embedding status: 0/401 documents embedded
Embedding status: 0/401 documents embedded
Embedding status: 0/401 documents embedded
Embedding status: 0/401 documents embedded
Embedding status: 401/401 documents embedded
```

## संग्रह पर समानता खोज क्वेरी

```python
# query it
query = "what is the structure of our solar system?"
docs_scores = await vs.asimilarity_search_with_relevance_scores(query, k=3)

# print results
for d, s in docs_scores:
    print(d.page_content, " -> ", s, "\n====\n")
```

```output
the positions of the two principal planets, (and these the most
necessary for the navigator,) Jupiter and Saturn, require each not less
than one hundred and sixteen tables. Yet it is not only necessary to
predict the position of these bodies, but it is likewise expedient to
tabulate the motions of the four satellites of Jupiter, to predict the
exact times at which they enter his shadow, and at which their shadows
cross his disc, as well as the times at which they are interposed  ->  0.9003241539387915
====

furnish more than a small fraction of that aid to navigation (in the
large sense of that term), which, with greater facility, expedition, and
economy in the calculation and printing of tables, it might be made to
supply.

Tables necessary to determine the places of the planets are not less
necessary than those for the sun, moon, and stars. Some notion of the
number and complexity of these tables may be formed, when we state that  ->  0.8911165633479508
====

the scheme of notation thus applied, immediately suggested the
advantages which must attend it as an instrument for expressing the
structure, operation, and circulation of the animal system; and we
entertain no doubt of its adequacy for that purpose. Not only the
mechanical connexion of the solid members of the bodies of men and
animals, but likewise the structure and operation of the softer parts,
including the muscles, integuments, membranes, &c. the nature, motion,  ->  0.8899750214770481
====
```

## MMR द्वारा पुनः रैंक किए गए संग्रह पर खोज करें

जेप नेटिव, हार्डवेयर-त्वरित MMR पुनः रैंकिंग के साथ खोज परिणामों की पेशकश करता है।

```python
query = "what is the structure of our solar system?"
docs = await vs.asearch(query, search_type="mmr", k=3)

for d in docs:
    print(d.page_content, "\n====\n")
```

```output
the positions of the two principal planets, (and these the most
necessary for the navigator,) Jupiter and Saturn, require each not less
than one hundred and sixteen tables. Yet it is not only necessary to
predict the position of these bodies, but it is likewise expedient to
tabulate the motions of the four satellites of Jupiter, to predict the
exact times at which they enter his shadow, and at which their shadows
cross his disc, as well as the times at which they are interposed
====

the scheme of notation thus applied, immediately suggested the
advantages which must attend it as an instrument for expressing the
structure, operation, and circulation of the animal system; and we
entertain no doubt of its adequacy for that purpose. Not only the
mechanical connexion of the solid members of the bodies of men and
animals, but likewise the structure and operation of the softer parts,
including the muscles, integuments, membranes, &c. the nature, motion,
====

resistance, economizing time, harmonizing the mechanism, and giving to
the whole mechanical action the utmost practical perfection.

The system of mechanical contrivances by which the results, here
attempted to be described, are attained, form only one order of
expedients adopted in this machinery;--although such is the perfection
of their action, that in any ordinary case they would be regarded as
having attained the ends in view with an almost superfluous degree of
====
```

# मेटाडेटा द्वारा फ़िल्टर करें

परिणामों को सीमित करने के लिए एक मेटाडेटा फ़िल्टर का उपयोग करें। पहले, एक और पुस्तक लोड करें: "शेरलॉक होम्स की साहसिक कहानियाँ"

```python
# Let's add more content to the existing Collection
article_url = "https://www.gutenberg.org/files/48320/48320-0.txt"
loader = WebBaseLoader(article_url)
documents = loader.load()

# split it into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

await vs.aadd_documents(docs)

await wait_for_ready(collection_name)
```

```output
Embedding status: 401/1691 documents embedded
Embedding status: 401/1691 documents embedded
Embedding status: 401/1691 documents embedded
Embedding status: 401/1691 documents embedded
Embedding status: 401/1691 documents embedded
Embedding status: 401/1691 documents embedded
Embedding status: 901/1691 documents embedded
Embedding status: 901/1691 documents embedded
Embedding status: 901/1691 documents embedded
Embedding status: 901/1691 documents embedded
Embedding status: 901/1691 documents embedded
Embedding status: 901/1691 documents embedded
Embedding status: 1401/1691 documents embedded
Embedding status: 1401/1691 documents embedded
Embedding status: 1401/1691 documents embedded
Embedding status: 1401/1691 documents embedded
Embedding status: 1691/1691 documents embedded
```

हम दोनों पुस्तकों के परिणाम देखते हैं। `source` मेटाडेटा पर ध्यान दें

```python
query = "Was he interested in astronomy?"
docs = await vs.asearch(query, search_type="similarity", k=3)

for d in docs:
    print(d.page_content, " -> ", d.metadata, "\n====\n")
```

```output
or remotely, for this purpose. But in addition to these, a great number
of tables, exclusively astronomical, are likewise indispensable. The
predictions of the astronomer, with respect to the positions and motions
of the bodies of the firmament, are the means, and the only means, which
enable the mariner to prosecute his art. By these he is enabled to
discover the distance of his ship from the Line, and the extent of his  ->  {'source': 'https://www.gutenberg.org/cache/epub/71292/pg71292.txt'}
====

possess all knowledge which is likely to be useful to him in his work,
and this I have endeavored in my case to do. If I remember rightly, you
on one occasion, in the early days of our friendship, defined my limits
in a very precise fashion.”

“Yes,” I answered, laughing. “It was a singular document. Philosophy,
astronomy, and politics were marked at zero, I remember. Botany
variable, geology profound as regards the mud-stains from any region  ->  {'source': 'https://www.gutenberg.org/files/48320/48320-0.txt'}
====

of astronomy, and its kindred sciences, with the various arts dependent
on them. In none are computations more operose than those which
astronomy in particular requires;--in none are preparatory facilities
more needful;--in none is error more detrimental. The practical
astronomer is interrupted in his pursuit, and diverted from his task of
observation by the irksome labours of computation, or his diligence in
observing becomes ineffectual for want of yet greater industry of  ->  {'source': 'https://www.gutenberg.org/cache/epub/71292/pg71292.txt'}
====
```

अब, हम एक फ़िल्टर सेट करते हैं

```python
filter = {
    "where": {
        "jsonpath": (
            "$[*] ? (@.source == 'https://www.gutenberg.org/files/48320/48320-0.txt')"
        )
    },
}

docs = await vs.asearch(query, search_type="similarity", metadata=filter, k=3)

for d in docs:
    print(d.page_content, " -> ", d.metadata, "\n====\n")
```

```output
possess all knowledge which is likely to be useful to him in his work,
and this I have endeavored in my case to do. If I remember rightly, you
on one occasion, in the early days of our friendship, defined my limits
in a very precise fashion.”

“Yes,” I answered, laughing. “It was a singular document. Philosophy,
astronomy, and politics were marked at zero, I remember. Botany
variable, geology profound as regards the mud-stains from any region  ->  {'source': 'https://www.gutenberg.org/files/48320/48320-0.txt'}
====

the light shining upon his strong-set aquiline features. So he sat as I
dropped off to sleep, and so he sat when a sudden ejaculation caused me
to wake up, and I found the summer sun shining into the apartment. The
pipe was still between his lips, the smoke still curled upward, and the
room was full of a dense tobacco haze, but nothing remained of the heap
of shag which I had seen upon the previous night.

“Awake, Watson?” he asked.

“Yes.”

“Game for a morning drive?”  ->  {'source': 'https://www.gutenberg.org/files/48320/48320-0.txt'}
====

“I glanced at the books upon the table, and in spite of my ignorance
of German I could see that two of them were treatises on science, the
others being volumes of poetry. Then I walked across to the window,
hoping that I might catch some glimpse of the country-side, but an oak
shutter, heavily barred, was folded across it. It was a wonderfully
silent house. There was an old clock ticking loudly somewhere in the
passage, but otherwise everything was deadly still. A vague feeling of  ->  {'source': 'https://www.gutenberg.org/files/48320/48320-0.txt'}
====
```
