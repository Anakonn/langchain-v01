---
translated: true
---

# संदर्भात्मक संपीड़न

पुनर्प्राप्ति के साथ एक चुनौती यह है कि आमतौर पर आप उस विशिष्ट प्रश्न को नहीं जानते जिसका सामना आपके दस्तावेज़ संग्रह प्रणाली को करना होगा जब आप डेटा को इस प्रणाली में इंजेक्ट करते हैं। इसका मतलब है कि किसी प्रश्न के लिए सबसे प्रासंगिक जानकारी किसी दस्तावेज़ में बहुत अप्रासंगिक पाठ के बीच दफन हो सकती है। उस पूरे दस्तावेज़ को आपके एप्लिकेशन के माध्यम से भेजना अधिक महंगे एलएलएम कॉल और कमज़ोर प्रतिक्रियाओं का कारण बन सकता है।

संदर्भात्मक संपीड़न इस समस्या को हल करने के लिए बनाया गया है। विचार बहुत सरल है: पुनर्प्राप्त दस्तावेज़ों को तुरंत वैसे ही लौटाने के बजाय, आप उन्हें दिए गए प्रश्न के संदर्भ का उपयोग करके संपीड़ित कर सकते हैं, ताकि केवल प्रासंगिक जानकारी लौटाई जाए। यहां "संपीड़ित करना" का मतलब है न केवल किसी व्यक्तिगत दस्तावेज़ की सामग्री को संपीड़ित करना, बल्कि पूरे दस्तावेज़ों को छांटना भी।

संदर्भात्मक संपीड़न पुनर्प्राप्तकर्ता का उपयोग करने के लिए, आपको निम्न की आवश्यकता होगी:
- एक आधारभूत पुनर्प्राप्तकर्ता
- एक दस्तावेज़ संपीड़क

संदर्भात्मक संपीड़न पुनर्प्राप्तकर्ता प्रश्नों को आधारभूत पुनर्प्राप्तकर्ता को भेजता है, प्रारंभिक दस्तावेज़ों को लेता है और उन्हें दस्तावेज़ संपीड़क के माध्यम से भेजता है। दस्तावेज़ संपीड़क दस्तावेज़ों की एक सूची लेता है और उसे छोटा करता है, या तो दस्तावेज़ की सामग्री को कम करके या दस्तावेज़ों को पूरी तरह से छोड़कर।

![](https://drive.google.com/uc?id=1CtNgWODXZudxAWSRiWgSGEoTNrUFT98v)

## शुरू करें

```python
# Helper function for printing docs


def pretty_print_docs(docs):
    print(
        f"\n{'-' * 100}\n".join(
            [f"Document {i+1}:\n\n" + d.page_content for i, d in enumerate(docs)]
        )
    )
```

## एक सामान्य वेक्टर स्टोर पुनर्प्राप्तकर्ता का उपयोग करना

चलो एक सरल वेक्टर स्टोर पुनर्प्राप्तकर्ता को प्रारंभ करके और 2023 के राज्य के संदर्भ में संघ भाषण (टुकड़ों में) को संग्रहीत करके शुरू करते हैं। हम देख सकते हैं कि एक उदाहरण प्रश्न दिए जाने पर हमारा पुनर्प्राप्तकर्ता एक या दो प्रासंगिक दस्तावेज़ और कुछ अप्रासंगिक दस्तावेज़ लौटाता है। और यहां तक कि प्रासंगिक दस्तावेज़ों में भी बहुत सारी अप्रासंगिक जानकारी होती है।

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

documents = TextLoader("../../state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
retriever = FAISS.from_documents(texts, OpenAIEmbeddings()).as_retriever()

docs = retriever.invoke("What did the president say about Ketanji Brown Jackson")
pretty_print_docs(docs)
```

```output
Document 1:

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
----------------------------------------------------------------------------------------------------
Document 2:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
----------------------------------------------------------------------------------------------------
Document 3:

And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.
----------------------------------------------------------------------------------------------------
Document 4:

Tonight, I’m announcing a crackdown on these companies overcharging American businesses and consumers.

And as Wall Street firms take over more nursing homes, quality in those homes has gone down and costs have gone up.

That ends on my watch.

Medicare is going to set higher standards for nursing homes and make sure your loved ones get the care they deserve and expect.

We’ll also cut costs and keep the economy going strong by giving workers a fair shot, provide more training and apprenticeships, hire them based on their skills not degrees.

Let’s pass the Paycheck Fairness Act and paid leave.

Raise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty.

Let’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.
```

## एक `LLMChainExtractor` के साथ संदर्भात्मक संपीड़न जोड़ना

अब चलो हमारे आधारभूत पुनर्प्राप्तकर्ता को `ContextualCompressionRetriever` के साथ लपेटें। हम एक `LLMChainExtractor` जोड़ेंगे, जो प्रारंभिक रूप से लौटाए गए दस्तावेज़ों पर दौड़ेगा और प्रश्न के संदर्भ में प्रासंगिक सामग्री को निकालेगा।

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
compressor = LLMChainExtractor.from_llm(llm)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```

```output
/Users/harrisonchase/workplace/langchain/libs/langchain/langchain/chains/llm.py:316: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(
/Users/harrisonchase/workplace/langchain/libs/langchain/langchain/chains/llm.py:316: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(
/Users/harrisonchase/workplace/langchain/libs/langchain/langchain/chains/llm.py:316: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(
/Users/harrisonchase/workplace/langchain/libs/langchain/langchain/chains/llm.py:316: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

Document 1:

I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.
```

## अधिक बिल्ट-इन संपीड़क: फ़िल्टर

### `LLMChainFilter`

`LLMChainFilter` थोड़ा सरल लेकिन अधिक मजबूत संपीड़क है जो एक एलएलएम श्रृंखला का उपयोग करके यह तय करता है कि प्रारंभिक रूप से पुनर्प्राप्त किए गए दस्तावेज़ों में से कौन से छोड़ दिए जाने चाहिए और कौन से लौटाए जाने चाहिए, बिना दस्तावेज़ की सामग्री को संशोधित किए।

```python
from langchain.retrievers.document_compressors import LLMChainFilter

_filter = LLMChainFilter.from_llm(llm)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=_filter, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```

```output
/Users/harrisonchase/workplace/langchain/libs/langchain/langchain/chains/llm.py:316: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(
/Users/harrisonchase/workplace/langchain/libs/langchain/langchain/chains/llm.py:316: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(
/Users/harrisonchase/workplace/langchain/libs/langchain/langchain/chains/llm.py:316: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(
/Users/harrisonchase/workplace/langchain/libs/langchain/langchain/chains/llm.py:316: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

Document 1:

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

### `EmbeddingsFilter`

प्रत्येक पुनर्प्राप्त दस्तावेज़ पर एक अतिरिक्त एलएलएम कॉल करना महंगा और धीमा है। `EmbeddingsFilter` एक सस्ता और तेज़ विकल्प प्रदान करता है क्योंकि यह दस्तावेज़ और प्रश्न को एम्बेड करता है और केवल उन दस्तावेज़ों को लौटाता है जिनके एम्बेडिंग प्रश्न के साथ पर्याप्त समानता हैं।

```python
from langchain.retrievers.document_compressors import EmbeddingsFilter
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
embeddings_filter = EmbeddingsFilter(embeddings=embeddings, similarity_threshold=0.76)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=embeddings_filter, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```

```output
Document 1:

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
----------------------------------------------------------------------------------------------------
Document 2:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
----------------------------------------------------------------------------------------------------
Document 3:

And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.
```

## संपीड़क और दस्तावेज़ रूपांतरकों को एक साथ जोड़ना

`DocumentCompressorPipeline` का उपयोग करके हम आसानी से कई संपीड़कों को क्रमिक रूप से जोड़ सकते हैं। संपीड़कों के साथ-साथ हम अपने पाइपलाइन में `BaseDocumentTransformer` भी जोड़ सकते हैं, जो कोई संदर्भात्मक संपीड़न नहीं करते हैं, बल्कि केवल दस्तावेज़ों पर कुछ रूपांतरण करते हैं। उदाहरण के लिए, `TextSplitter` को दस्तावेज़ रूपांतरकों के रूप में उपयोग किया जा सकता है ताकि दस्तावेज़ को छोटे टुकड़ों में विभाजित किया जा सके, और `EmbeddingsRedundantFilter` का उपयोग दस्तावेज़ों के बीच एम्बेडिंग समानता के आधार पर अनावश्यक दस्तावेज़ों को छांटने के लिए किया जा सकता है।

नीचे हम पहले अपने दस्तावेज़ों को छोटे टुकड़ों में विभाजित करके, फिर अनावश्यक दस्तावेज़ों को हटाकर, और फिर प्रश्न के प्रासंगिकता के आधार पर फ़िल्टर करके एक संपीड़क पाइपलाइन बनाते हैं।

```python
from langchain.retrievers.document_compressors import DocumentCompressorPipeline
from langchain_community.document_transformers import EmbeddingsRedundantFilter
from langchain_text_splitters import CharacterTextSplitter

splitter = CharacterTextSplitter(chunk_size=300, chunk_overlap=0, separator=". ")
redundant_filter = EmbeddingsRedundantFilter(embeddings=embeddings)
relevant_filter = EmbeddingsFilter(embeddings=embeddings, similarity_threshold=0.76)
pipeline_compressor = DocumentCompressorPipeline(
    transformers=[splitter, redundant_filter, relevant_filter]
)
```

```python
compression_retriever = ContextualCompressionRetriever(
    base_compressor=pipeline_compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```

```output
Document 1:

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson
----------------------------------------------------------------------------------------------------
Document 2:

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year
----------------------------------------------------------------------------------------------------
Document 3:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder
----------------------------------------------------------------------------------------------------
Document 4:

Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both
```
