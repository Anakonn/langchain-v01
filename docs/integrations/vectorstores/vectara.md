---
canonical: https://python.langchain.com/v0.1/docs/integrations/vectorstores/vectara
translated: false
---

# Vectara

>[Vectara](https://vectara.com/) is the trusted GenAI platform that provides an easy-to-use API for document indexing and querying.

Vectara provides an end-to-end managed service for Retrieval Augmented Generation or [RAG](https://vectara.com/grounded-generation/), which includes:

1. A way to extract text from document files and chunk them into sentences.

2. The state-of-the-art [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) embeddings model. Each text chunk is encoded into a vector embedding using Boomerang, and stored in the Vectara internal knowledge (vector+text) store

3. A query service that automatically encodes the query into embedding, and retrieves the most relevant text segments (including support for [Hybrid Search](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) and [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/))

4. An option to create [generative summary](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview), based on the retrieved documents, including citations.

See the [Vectara API documentation](https://docs.vectara.com/docs/) for more information on how to use the API.

This notebook shows how to use the basic retrieval functionality, when utilizing Vectara just as a Vector Store (without summarization), incuding: `similarity_search` and `similarity_search_with_score` as well as using the LangChain `as_retriever` functionality.

# Setup

You will need a Vectara account to use Vectara with LangChain. To get started, use the following steps:

1. [Sign up](https://www.vectara.com/integrations/langchain) for a Vectara account if you don't already have one. Once you have completed your sign up you will have a Vectara customer ID. You can find your customer ID by clicking on your name, on the top-right of the Vectara console window.

2. Within your account you can create one or more corpora. Each corpus represents an area that stores text data upon ingest from input documents. To create a corpus, use the **"Create Corpus"** button. You then provide a name to your corpus as well as a description. Optionally you can define filtering attributes and apply some advanced options. If you click on your created corpus, you can see its name and corpus ID right on the top.

3. Next you'll need to create API keys to access the corpus. Click on the **"Authorization"** tab in the corpus view and then the **"Create API Key"** button. Give your key a name, and choose whether you want query only or query+index for your key. Click "Create" and you now have an active API key. Keep this key confidential.

To use LangChain with Vectara, you'll need to have these three values: customer ID, corpus ID and api_key.
You can provide those to LangChain in two ways:

1. Include in your environment these three variables: `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` and `VECTARA_API_KEY`.

> For example, you can set these variables using os.environ and getpass as follows:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. Add them to the Vectara vectorstore constructor:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

## Connecting to Vectara from LangChain

To get started, let's ingest the documents using the from_documents() method.
We assume here that you've added your VECTARA_CUSTOMER_ID, VECTARA_CORPUS_ID and query+indexing VECTARA_API_KEY as environment variables.

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
vectara = Vectara.from_documents(
    docs,
    embedding=FakeEmbeddings(size=768),
    doc_metadata={"speech": "state-of-the-union"},
)
```

Vectara's indexing API provides a file upload API where the file is handled directly by Vectara - pre-processed, chunked optimally and added to the Vectara vector store.
To use this, we added the add_files() method (as well as from_files()).

Let's see this in action. We pick two PDF documents to upload:

1. The "I have a dream" speech by Dr. King
2. Churchill's "We Shall Fight on the Beaches" speech

```python
import tempfile
import urllib.request

urls = [
    [
        "https://www.gilderlehrman.org/sites/default/files/inline-pdfs/king.dreamspeech.excerpts.pdf",
        "I-have-a-dream",
    ],
    [
        "https://www.parkwayschools.net/cms/lib/MO01931486/Centricity/Domain/1578/Churchill_Beaches_Speech.pdf",
        "we shall fight on the beaches",
    ],
]
files_list = []
for url, _ in urls:
    name = tempfile.NamedTemporaryFile().name
    urllib.request.urlretrieve(url, name)
    files_list.append(name)

docsearch: Vectara = Vectara.from_files(
    files=files_list,
    embedding=FakeEmbeddings(size=768),
    metadatas=[{"url": url, "speech": title} for url, title in urls],
)
```

## Similarity search

The simplest scenario for using Vectara is to perform a similarity search.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vectara.similarity_search(
    query, n_sentence_context=0, filter="doc.speech = 'state-of-the-union'"
)
```

```python
found_docs
```

```output
[Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '596', 'len': '97', 'speech': 'state-of-the-union'}),
 Document(page_content='In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.”', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '141', 'len': '117', 'speech': 'state-of-the-union'}),
 Document(page_content='As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.”', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '0', 'len': '77', 'speech': 'state-of-the-union'}),
 Document(page_content='Last month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '0', 'len': '122', 'speech': 'state-of-the-union'}),
 Document(page_content='He thought he could roll into Ukraine and the world would roll over.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '664', 'len': '68', 'speech': 'state-of-the-union'}),
 Document(page_content='That’s why one of the first things I did as President was fight to pass the American Rescue Plan.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '314', 'len': '97', 'speech': 'state-of-the-union'}),
 Document(page_content='And he thought he could divide us at home.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '160', 'len': '42', 'speech': 'state-of-the-union'}),
 Document(page_content='He met the Ukrainian people.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '788', 'len': '28', 'speech': 'state-of-the-union'}),
 Document(page_content='He thought the West and NATO wouldn’t respond.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '113', 'len': '46', 'speech': 'state-of-the-union'}),
 Document(page_content='In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '772', 'len': '131', 'speech': 'state-of-the-union'})]
```

```python
print(found_docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.
```

## Similarity search with score

Sometimes we might want to perform the search, but also obtain a relevancy score to know how good is a particular result.

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'state-of-the-union'",
    score_threshold=0.2,
)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.

Score: 0.74179757
```

Now let's do similar search for content in the files we uploaded

```python
query = "We must forever conduct our struggle"
min_score = 1.2
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'I-have-a-dream'",
    score_threshold=min_score,
)
print(f"With this threshold of {min_score} we have {len(found_docs)} documents")
```

```output
With this threshold of 1.2 we have 0 documents
```

```python
query = "We must forever conduct our struggle"
min_score = 0.2
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'I-have-a-dream'",
    score_threshold=min_score,
)
print(f"With this threshold of {min_score} we have {len(found_docs)} documents")
```

```output
With this threshold of 0.2 we have 10 documents
```

MMR is an important retrieval capability for many applications, whereby search results feeding your GenAI application are reranked to improve diversity of results.

Let's see how that works with Vectara:

```python
query = "state of the economy"
found_docs = vectara.similarity_search(
    query,
    n_sentence_context=0,
    filter="doc.speech = 'state-of-the-union'",
    k=5,
    mmr_config={"is_enabled": True, "mmr_k": 50, "diversity_bias": 0.0},
)
print("\n\n".join([x.page_content for x in found_docs]))
```

```output
Economic assistance.

Grow the workforce. Build the economy from the bottom up
and the middle out, not from the top down.

When we invest in our workers, when we build the economy from the bottom up and the middle out together, we can do something we haven’t done in a long time: build a better America.

Our economy grew at a rate of 5.7% last year, the strongest growth in nearly 40 years, the first step in bringing fundamental change to an economy that hasn’t worked for the working people of this nation for too long.

Economists call it “increasing the productive capacity of our economy.”
```

```python
query = "state of the economy"
found_docs = vectara.similarity_search(
    query,
    n_sentence_context=0,
    filter="doc.speech = 'state-of-the-union'",
    k=5,
    mmr_config={"is_enabled": True, "mmr_k": 50, "diversity_bias": 1.0},
)
print("\n\n".join([x.page_content for x in found_docs]))
```

```output
Economic assistance.

The Russian stock market has lost 40% of its value and trading remains suspended.

But that trickle-down theory led to weaker economic growth, lower wages, bigger deficits, and the widest gap between those at the top and everyone else in nearly a century.

In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

The federal government spends about $600 Billion a year to keep the country safe and secure.
```

As you can see, in the first example diversity_bias was set to 0.0 (equivalent to diversity reranking disabled), which resulted in a the top-5 most relevant documents. With diversity_bias=1.0 we maximize diversity and as you can see the resulting top documents are much more diverse in their semantic meanings.

## Vectara as a Retriever

Finally let's see how to use Vectara with the `as_retriever()` interface:

```python
retriever = vectara.as_retriever()
retriever
```

```output
VectorStoreRetriever(tags=['Vectara'], vectorstore=<langchain_community.vectorstores.vectara.Vectara object at 0x109a3c760>)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```

```output
Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '596', 'len': '97', 'speech': 'state-of-the-union'})
```