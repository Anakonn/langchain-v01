---
translated: true
---

# इंटेल का विज़ुअल डेटा मैनेजमेंट सिस्टम (VDMS)

>इंटेल का [VDMS](https://github.com/IntelLabs/vdms) बड़े "दृश्यात्मक" डेटा तक कुशलतापूर्वक पहुंचने के लिए एक स्टोरेज समाधान है, जो ग्राफ के रूप में संग्रहीत दृश्यात्मक मेटाडेटा के माध्यम से प्रासंगिक दृश्यात्मक डेटा की खोज करके क्लाउड स्केल प्राप्त करने और दृश्यात्मक डेटा के लिए तेज़ पहुंच के लिए मशीन-अनुकूल वर्धन सक्षम करने का लक्ष्य रखता है। VDMS MIT लाइसेंस के तहत लाइसेंस प्राप्त है।

VDMS समर्थन करता है:
* K निकटतम पड़ोसी खोज
* यूक्लिडियन दूरी (L2) और आंतरिक उत्पाद (IP)
* इंडेक्सिंग और दूरियों की गणना के लिए लाइब्रेरी: TileDBDense, TileDBSparse, FaissFlat (डिफ़ॉल्ट), FaissIVFFlat
* वेक्टर और मेटाडेटा खोज

VDMS में सर्वर और क्लाइंट घटक हैं। सर्वर को सेट करने के लिए, [स्थापना निर्देशों](https://github.com/IntelLabs/vdms/blob/master/INSTALL.md) देखें या [डॉकर छवि](https://hub.docker.com/r/intellabs/vdms) का उपयोग करें।

यह नोटबुक VDMS को डॉकर छवि का उपयोग करके एक वेक्टर स्टोर के रूप में कैसे उपयोग करें, दिखाता है।

शुरू करने के लिए, VDMS क्लाइंट और वाक्य रूपांतरकर्ता के लिए Python पैकेज इंस्टॉल करें:

```python
# Pip install necessary package
%pip install --upgrade --quiet pip sentence-transformers vdms "unstructured-inference==0.6.6";
```

```output
Note: you may need to restart the kernel to use updated packages.
```

## VDMS सर्वर शुरू करें

यहां हम पोर्ट 55555 के साथ VDMS सर्वर शुरू करते हैं।

```python
!docker run --rm -d -p 55555:55555 --name vdms_vs_test_nb intellabs/vdms:latest
```

```output
e6061b270eef87de5319a6c5af709b36badcad8118069a8f6b577d2e01ad5e2d
```

## मूलभूत उदाहरण (डॉकर कंटेनर का उपयोग करके)

इस मूलभूत उदाहरण में, हम VDMS में दस्तावेज़ जोड़ने और इसका उपयोग एक वेक्टर डेटाबेस के रूप में करने का प्रदर्शन करते हैं।

आप VDMS सर्वर को अलग से एक डॉकर कंटेनर में चला सकते हैं ताकि LangChain का उपयोग कर VDMS Python क्लाइंट के माध्यम से कनेक्ट किया जा सके।

VDMS में दस्तावेजों के कई संग्रह संभाल करने की क्षमता है, लेकिन LangChain इंटरफ़ेस एक की उम्मीद करता है, इसलिए हमें संग्रह के नाम को निर्दिष्ट करना होगा। LangChain द्वारा उपयोग किया जाने वाला डिफ़ॉल्ट संग्रह नाम "langchain" है।

```python
import time

from langchain_community.document_loaders.text import TextLoader
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import VDMS
from langchain_community.vectorstores.vdms import VDMS_Client
from langchain_text_splitters.character import CharacterTextSplitter

time.sleep(2)
DELIMITER = "-" * 50

# Connect to VDMS Vector Store
vdms_client = VDMS_Client(host="localhost", port=55555)
```

यहां परिणामों को प्रिंट करने के लिए कुछ सहायक कार्यों हैं।

```python
def print_document_details(doc):
    print(f"Content:\n\t{doc.page_content}\n")
    print("Metadata:")
    for key, value in doc.metadata.items():
        if value != "Missing property":
            print(f"\t{key}:\t{value}")


def print_results(similarity_results, score=True):
    print(f"{DELIMITER}\n")
    if score:
        for doc, score in similarity_results:
            print(f"Score:\t{score}\n")
            print_document_details(doc)
            print(f"{DELIMITER}\n")
    else:
        for doc in similarity_results:
            print_document_details(doc)
            print(f"{DELIMITER}\n")


def print_response(list_of_entities):
    for ent in list_of_entities:
        for key, value in ent.items():
            if value != "Missing property":
                print(f"\n{key}:\n\t{value}")
        print(f"{DELIMITER}\n")
```

### दस्तावेज़ लोड करें और एम्बेडिंग फ़ंक्शन प्राप्त करें

यहां हम राष्ट्रपति के सबसे हालिया संदेश को लोड करते हैं और दस्तावेज़ को टुकड़ों में विभाजित करते हैं।

LangChain वेक्टर स्टोर दस्तावेजों के लिए एक स्ट्रिंग/कीवर्ड `id` का उपयोग करते हैं। डिफ़ॉल्ट रूप से, `id` एक uuid है, लेकिन यहां हम इसे एक स्ट्रिंग के रूप में कास्ट किए गए एक पूर्णांक के रूप में परिभाषित कर रहे हैं। दस्तावेजों के साथ अतिरिक्त मेटाडेटा भी प्रदान किया जाता है और इस उदाहरण के लिए HuggingFaceEmbeddings को एम्बेडिंग फ़ंक्शन के रूप में उपयोग किया जाता है।

```python
# load the document and split it into chunks
document_path = "../../modules/state_of_the_union.txt"
raw_documents = TextLoader(document_path).load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(raw_documents)
ids = []
for doc_idx, doc in enumerate(docs):
    ids.append(str(doc_idx + 1))
    docs[doc_idx].metadata["id"] = str(doc_idx + 1)
    docs[doc_idx].metadata["page_number"] = int(doc_idx + 1)
    docs[doc_idx].metadata["president_included"] = (
        "president" in doc.page_content.lower()
    )
print(f"# Documents: {len(docs)}")


# create the open-source embedding function
embedding = HuggingFaceEmbeddings()
print(
    f"# Embedding Dimensions: {len(embedding.embed_query('This is a test document.'))}"
)
```

```output
# Documents: 42
# Embedding Dimensions: 768
```

### फ़ैस फ्लैट और यूक्लिडियन दूरी (डिफ़ॉल्ट) का उपयोग करके समानता खोज

इस खंड में, हम FAISS IndexFlat इंडेक्सिंग (डिफ़ॉल्ट) और यूक्लिडियन दूरी (डिफ़ॉल्ट) को समानता खोज के लिए दूरी मीट्रिक के रूप में उपयोग करते हुए दस्तावेज़ों को VDMS में जोड़ते हैं। हम `Ketanji Brown Jackson` के बारे में राष्ट्रपति ने क्या कहा, इस प्रश्न से संबंधित तीन दस्तावेज़ों (`k=3`) की खोज करते हैं।

```python
# add data
collection_name = "my_collection_faiss_L2"
db = VDMS.from_documents(
    docs,
    client=vdms_client,
    ids=ids,
    collection_name=collection_name,
    embedding=embedding,
)

# Query (No metadata filtering)
k = 3
query = "What did the president say about Ketanji Brown Jackson"
returned_docs = db.similarity_search(query, k=k, filter=None)
print_results(returned_docs, score=False)
```

```output
--------------------------------------------------

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Content:
	As Frances Haugen, who is here with us tonight, has shown, we must hold social media platforms accountable for the national experiment they’re conducting on our children for profit.

It’s time to strengthen privacy protections, ban targeted advertising to children, demand tech companies stop collecting personal data on our children.

And let’s get all Americans the mental health services they need. More people they can turn to for help, and full parity between physical and mental health care.

Third, support our veterans.

Veterans are the best of us.

I’ve always believed that we have a sacred obligation to equip all those we send to war and care for them and their families when they come home.

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.

Our troops in Iraq and Afghanistan faced many dangers.

Metadata:
	id:	37
	page_number:	37
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Content:
	A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.

Metadata:
	id:	33
	page_number:	33
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------
```

```python
# Query (with filtering)
k = 3
constraints = {"page_number": [">", 30], "president_included": ["==", True]}
query = "What did the president say about Ketanji Brown Jackson"
returned_docs = db.similarity_search(query, k=k, filter=constraints)
print_results(returned_docs, score=False)
```

```output
--------------------------------------------------

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Content:
	And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.

Metadata:
	id:	35
	page_number:	35
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Content:
	Last month, I announced our plan to supercharge
the Cancer Moonshot that President Obama asked me to lead six years ago.

Our goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.

More support for patients and families.

To get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health.

It’s based on DARPA—the Defense Department project that led to the Internet, GPS, and so much more.

ARPA-H will have a singular purpose—to drive breakthroughs in cancer, Alzheimer’s, diabetes, and more.

A unity agenda for the nation.

We can do this.

My fellow Americans—tonight , we have gathered in a sacred space—the citadel of our democracy.

In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things.

We have fought for freedom, expanded liberty, defeated totalitarianism and terror.

Metadata:
	id:	40
	page_number:	40
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------
```

### TileDBDense और यूक्लिडियन दूरी का उपयोग करके समानता खोज

इस खंड में, हम TileDB Dense इंडेक्सिंग और L2 को समानता खोज के लिए दूरी मीट्रिक के रूप में उपयोग करते हुए दस्तावेज़ों को VDMS में जोड़ते हैं। हम `Ketanji Brown Jackson` के बारे में राष्ट्रपति ने क्या कहा, इस प्रश्न से संबंधित तीन दस्तावेज़ों (`k=3`) की खोज करते हैं और साथ ही स्कोर भी वापस लौटाते हैं।

```python
db_tiledbD = VDMS.from_documents(
    docs,
    client=vdms_client,
    ids=ids,
    collection_name="my_collection_tiledbD_L2",
    embedding=embedding,
    engine="TileDBDense",
    distance_strategy="L2",
)

k = 3
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db_tiledbD.similarity_search_with_score(query, k=k, filter=None)
print_results(docs_with_score)
```

```output
--------------------------------------------------

Score:	1.2032090425491333

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Score:	1.495247483253479

Content:
	As Frances Haugen, who is here with us tonight, has shown, we must hold social media platforms accountable for the national experiment they’re conducting on our children for profit.

It’s time to strengthen privacy protections, ban targeted advertising to children, demand tech companies stop collecting personal data on our children.

And let’s get all Americans the mental health services they need. More people they can turn to for help, and full parity between physical and mental health care.

Third, support our veterans.

Veterans are the best of us.

I’ve always believed that we have a sacred obligation to equip all those we send to war and care for them and their families when they come home.

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.

Our troops in Iraq and Afghanistan faced many dangers.

Metadata:
	id:	37
	page_number:	37
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Score:	1.5008409023284912

Content:
	A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.

Metadata:
	id:	33
	page_number:	33
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------
```

### फ़ैस IVFFlat और यूक्लिडियन दूरी का उपयोग करके समानता खोज

इस खंड में, हम Faiss IndexIVFFlat इंडेक्सिंग और L2 को समानता खोज के लिए दूरी मीट्रिक के रूप में उपयोग करते हुए दस्तावेज़ों को VDMS में जोड़ते हैं। हम `Ketanji Brown Jackson` के बारे में राष्ट्रपति ने क्या कहा, इस प्रश्न से संबंधित तीन दस्तावेज़ों (`k=3`) की खोज करते हैं और साथ ही स्कोर भी वापस लौटाते हैं।

```python
db_FaissIVFFlat = VDMS.from_documents(
    docs,
    client=vdms_client,
    ids=ids,
    collection_name="my_collection_FaissIVFFlat_L2",
    embedding=embedding,
    engine="FaissIVFFlat",
    distance_strategy="L2",
)
# Query
k = 3
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db_FaissIVFFlat.similarity_search_with_score(query, k=k, filter=None)
print_results(docs_with_score)
```

```output
--------------------------------------------------

Score:	1.2032090425491333

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Score:	1.495247483253479

Content:
	As Frances Haugen, who is here with us tonight, has shown, we must hold social media platforms accountable for the national experiment they’re conducting on our children for profit.

It’s time to strengthen privacy protections, ban targeted advertising to children, demand tech companies stop collecting personal data on our children.

And let’s get all Americans the mental health services they need. More people they can turn to for help, and full parity between physical and mental health care.

Third, support our veterans.

Veterans are the best of us.

I’ve always believed that we have a sacred obligation to equip all those we send to war and care for them and their families when they come home.

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.

Our troops in Iraq and Afghanistan faced many dangers.

Metadata:
	id:	37
	page_number:	37
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Score:	1.5008409023284912

Content:
	A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.

Metadata:
	id:	33
	page_number:	33
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------
```

### अपडेट और हटाना

एक वास्तविक अनुप्रयोग की ओर बढ़ते हुए, आप डेटा जोड़ने से परे जाना चाहते हैं, और डेटा को अपडेट और हटाना भी चाहते हैं।

यहां इसे करने का एक मूलभूत उदाहरण दिया गया है। पहले, हम प्रश्न से सबसे प्रासंगिक दस्तावेज़ के लिए मेटाडेटा को अपडेट करेंगे।

```python
doc = db.similarity_search(query)[0]
print(f"Original metadata: \n\t{doc.metadata}")

# update the metadata for a document
doc.metadata["new_value"] = "hello world"
print(f"new metadata: \n\t{doc.metadata}")
print(f"{DELIMITER}\n")

# Update document in VDMS
id_to_update = doc.metadata["id"]
db.update_document(collection_name, id_to_update, doc)
response, response_array = db.get(
    collection_name, constraints={"id": ["==", id_to_update]}
)

# Display Results
print(f"UPDATED ENTRY (id={id_to_update}):")
print_response([response[0]["FindDescriptor"]["entities"][0]])
```

```output
Original metadata:
	{'id': '32', 'page_number': 32, 'president_included': True, 'source': '../../modules/state_of_the_union.txt'}
new metadata:
	{'id': '32', 'page_number': 32, 'president_included': True, 'source': '../../modules/state_of_the_union.txt', 'new_value': 'hello world'}
--------------------------------------------------

UPDATED ENTRY (id=32):

content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

id:
	32

new_value:
	hello world

page_number:
	32

president_included:
	True

source:
	../../modules/state_of_the_union.txt
--------------------------------------------------
```

अगला, हम आईडी (id=42) के आखिरी दस्तावेज़ को हटा देंगे।

```python
print("Documents before deletion: ", db.count(collection_name))

id_to_remove = ids[-1]
db.delete(collection_name=collection_name, ids=[id_to_remove])
print(f"Documents after deletion (id={id_to_remove}): {db.count(collection_name)}")
```

```output
Documents before deletion:  42
Documents after deletion (id=42): 41
```

## अन्य जानकारी

VDMS विभिन्न प्रकार के दृश्यात्मक डेटा और ऑपरेशन का समर्थन करता है। कुछ क्षमताएं LangChain इंटरफ़ेस में एकीकृत हैं, लेकिन VDMS के निरंतर विकास के साथ अतिरिक्त कार्यप्रवाह सुधार जोड़े जाएंगे।

LangChain में एकीकृत अतिरिक्त क्षमताएं नीचे दी गई हैं।

### वेक्टर द्वारा समानता खोज

स्ट्रिंग क्वेरी द्वारा खोजने के बजाय, आप एम्बेडिंग/वेक्टर द्वारा भी खोज कर सकते हैं।

```python
embedding_vector = embedding.embed_query(query)
returned_docs = db.similarity_search_by_vector(embedding_vector)

# Print Results
print_document_details(returned_docs[0])
```

```output
Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	new_value:	hello world
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
```

### मेटाडेटा पर फ़िल्टरिंग

संग्रह के साथ काम करने से पहले उसे संकुचित करना मददगार हो सकता है।

उदाहरण के लिए, get विधि का उपयोग करके मेटाडेटा पर आधारित संग्रह को फ़िल्टर किया जा सकता है। फ़िल्टर मेटाडेटा के लिए एक डिक्शनरी का उपयोग किया जाता है। यहां हम वह दस्तावेज़ पुनः प्राप्त करते हैं जहां `id = 2` है और उसे वेक्टर स्टोर से हटा देते हैं।

```python
response, response_array = db.get(
    collection_name,
    limit=1,
    include=["metadata", "embeddings"],
    constraints={"id": ["==", "2"]},
)

print("Returned entry:")
print_response([response[0]["FindDescriptor"]["entities"][0]])

# Delete id=2
db.delete(collection_name=collection_name, ids=["2"]);
```

```output
Returned entry:

blob:
	True

content:
	Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland.

In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight.

Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world.

Please rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people.

Throughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos.

They keep moving.

And the costs and the threats to America and the world keep rising.

That’s why the NATO Alliance was created to secure peace and stability in Europe after World War 2.

The United States is a member along with 29 other nations.

It matters. American diplomacy matters. American resolve matters.

id:
	2

page_number:
	2

president_included:
	True

source:
	../../modules/state_of_the_union.txt
--------------------------------------------------
```

### रिट्रीवर विकल्प

यह खंड VDMS को एक रिट्रीवर के रूप में कैसे उपयोग करने के विभिन्न विकल्पों पर चर्चा करता है।

#### समानता खोज

यहां हम रिट्रीवर ऑब्जेक्ट में समानता खोज का उपयोग करते हैं।

```python
retriever = db.as_retriever()
relevant_docs = retriever.invoke(query)[0]

print_document_details(relevant_docs)
```

```output
Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	new_value:	hello world
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
```

#### अधिकतम सीमांत प्रासंगिकता खोज (MMR)

समानता खोज के अलावा, आप रिट्रीवर ऑब्जेक्ट में `mmr` का भी उपयोग कर सकते हैं।

```python
retriever = db.as_retriever(search_type="mmr")
relevant_docs = retriever.invoke(query)[0]

print_document_details(relevant_docs)
```

```output
Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	new_value:	hello world
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
```

हम MMR को सीधे भी उपयोग कर सकते हैं।

```python
mmr_resp = db.max_marginal_relevance_search_with_score(query, k=2, fetch_k=10)
print_results(mmr_resp)
```

```output
--------------------------------------------------

Score:	1.2032092809677124

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	new_value:	hello world
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Score:	1.507053256034851

Content:
	But cancer from prolonged exposure to burn pits ravaged Heath’s lungs and body.

Danielle says Heath was a fighter to the very end.

He didn’t know how to stop fighting, and neither did she.

Through her pain she found purpose to demand we do better.

Tonight, Danielle—we are.

The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits.

And tonight, I’m announcing we’re expanding eligibility to veterans suffering from nine respiratory cancers.

I’m also calling on Congress: pass a law to make sure veterans devastated by toxic exposures in Iraq and Afghanistan finally get the benefits and comprehensive health care they deserve.

And fourth, let’s end cancer as we know it.

This is personal to me and Jill, to Kamala, and to so many of you.

Cancer is the #2 cause of death in America–second only to heart disease.

Metadata:
	id:	39
	page_number:	39
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------
```

### डिलीट कलेक्शन

पहले, हमने `id` के आधार पर दस्तावेज़ों को हटा दिया था। यहां, कोई आईडी प्रदान नहीं किया गया है, इसलिए सभी दस्तावेज़ हटा दिए जाते हैं।

```python
print("Documents before deletion: ", db.count(collection_name))

db.delete(collection_name=collection_name)

print("Documents after deletion: ", db.count(collection_name))
```

```output
Documents before deletion:  40
Documents after deletion:  0
```

## VDMS सर्वर को रोकें

```python
!docker kill vdms_vs_test_nb
```

```output
huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)

vdms_vs_test_nb
```
