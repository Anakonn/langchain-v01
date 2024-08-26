---
translated: true
---

# एक्टिवलूप डीप मेमोरी

>[एक्टिवलूप डीप मेमोरी](https://docs.activeloop.ai/performance-features/deep-memory) एक ऐसा टूल सेट है जो आपको अपने वेक्टर स्टोर को अपने उपयोग मामले के लिए अनुकूलित करने और अपने एलएलएम ऐप्स में अधिक सटीकता प्राप्त करने में सक्षम बनाता है।

`रिट्रीवल-ऑग्मेंटेड जनरेशन` (`RAG`) हाल ही में काफी ध्यान आकर्षित कर रहा है। उन्नत RAG तकनीकों और एजेंटों के उभरने के साथ, वे RAGs द्वारा किए जा सकने वाले कार्यों के संभावित क्षेत्र को विस्तारित कर रहे हैं। हालांकि, उत्पादन में RAGs को एकीकृत करने में कुछ चुनौतियां हो सकती हैं। उत्पादन सेटिंग में RAGs को लागू करते समय विचार करने वाले प्रमुख कारक सटीकता (रिकॉल), लागत और लेटेंसी हैं। मूलभूत उपयोग मामलों के लिए, OpenAI का एडा मॉडल एक सरल समानता खोज के साथ संतोषजनक परिणाम दे सकता है। फिर भी, खोजों के दौरान अधिक सटीकता या रिकॉल के लिए, उन्नत पुनर्प्राप्ति तकनीकों का उपयोग करना आवश्यक हो सकता है। इन विधियों में डेटा खंड आकार में परिवर्तन, क्वेरी को कई बार पुनर्लिखित करना और अधिक शामिल हो सकते हैं, जिससे लेटेंसी और लागत में वृद्धि हो सकती है। एक्टिवलूप का [डीप मेमोरी](https://www.activeloop.ai/resources/use-deep-memory-to-boost-rag-apps-accuracy-by-up-to-22/) `एक्टिवलूप डीप लेक` उपयोगकर्ताओं के लिए एक सुविधा है, जो एक कॉर्पस से प्रासंगिक डेटा को उपयोगकर्ता क्वेरी से मिलाने के लिए एक छोटे न्यूरल नेटवर्क परत को प्रशिक्षित करके इन मुद्दों को संबोधित करता है। इस जोड़ के साथ, खोज के दौरान न्यूनतम लेटेंसी होती है, लेकिन यह पुनर्प्राप्ति सटीकता को 27% तक बढ़ा सकता है और लागत प्रभावी और उपयोग करने में सरल है, बिना किसी अतिरिक्त उन्नत rag तकनीक की आवश्यकता के।

इस ट्यूटोरियल में हम `DeepLake` दस्तावेज़ों को पार्स करेंगे और एक RAG प्रणाली बनाएंगे जो दस्तावेज़ों से प्रश्न का जवाब दे सकती है।

## 1. डेटासेट निर्माण

हम इस ट्यूटोरियल के लिए `BeautifulSoup` लाइब्रेरी और LangChain के दस्तावेज़ पार्सर जैसे `Html2TextTransformer`, `AsyncHtmlLoader` का उपयोग करके एक्टिवलूप के दस्तावेज़ों को पार्स करेंगे। इसलिए हमें निम्नलिखित लाइब्रेरियों को स्थापित करना होगा:

```python
%pip install --upgrade --quiet  tiktoken langchain-openai python-dotenv datasets langchain deeplake beautifulsoup4 html2text ragas
```

आपको एक [एक्टिवलूप](https://activeloop.ai) खाता भी बनाना होगा।

```python
ORG_ID = "..."
```

```python
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import DeepLake
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API token: ")
# # activeloop token is needed if you are not signed in using CLI: `activeloop login -u <USERNAME> -p <PASSWORD>`
os.environ["ACTIVELOOP_TOKEN"] = getpass.getpass(
    "Enter your ActiveLoop API token: "
)  # Get your API token from https://app.activeloop.ai, click on your profile picture in the top right corner, and select "API Tokens"

token = os.getenv("ACTIVELOOP_TOKEN")
openai_embeddings = OpenAIEmbeddings()
```

```python
db = DeepLake(
    dataset_path=f"hub://{ORG_ID}/deeplake-docs-deepmemory",  # org_id stands for your username or organization from activeloop
    embedding=openai_embeddings,
    runtime={"tensor_db": True},
    token=token,
    # overwrite=True, # user overwrite flag if you want to overwrite the full dataset
    read_only=False,
)
```

`BeautifulSoup` का उपयोग करके वेबपेज में मौजूद सभी लिंक को पार्स करना

```python
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


def get_all_links(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve the page: {url}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")

    # Finding all 'a' tags which typically contain href attribute for links
    links = [
        urljoin(url, a["href"]) for a in soup.find_all("a", href=True) if a["href"]
    ]

    return links


base_url = "https://docs.deeplake.ai/en/latest/"
all_links = get_all_links(base_url)
```

डेटा लोड करना:

```python
from langchain_community.document_loaders.async_html import AsyncHtmlLoader

loader = AsyncHtmlLoader(all_links)
docs = loader.load()
```

डेटा को उपयोगकर्ता पठनीय प्रारूप में परिवर्तित करना:

```python
from langchain_community.document_transformers import Html2TextTransformer

html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(docs)
```

अब, हम दस्तावेज़ों को और छोटे खंडों में विभाजित करेंगे क्योंकि कुछ में बहुत अधिक पाठ है:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

chunk_size = 4096
docs_new = []

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size,
)

for doc in docs_transformed:
    if len(doc.page_content) < chunk_size:
        docs_new.append(doc)
    else:
        docs = text_splitter.create_documents([doc.page_content])
        docs_new.extend(docs)
```

VectorStore को भरना:

```python
docs = db.add_documents(docs_new)
```

## 2. संश्लेषित क्वेरी का उत्पादन और डीप मेमोरी का प्रशिक्षण

अगला कदम एक गहरी मेमोरी मॉडल को प्रशिक्षित करना होगा जो आपके उपयोगकर्ता क्वेरी को पहले से मौजूद डेटासेट से मेल खाएगा। यदि आपके पास कोई उपयोगकर्ता क्वेरी नहीं हैं, कोई बात नहीं, हम उन्हें एलएलएम का उपयोग करके उत्पन्न करेंगे!

#### TODO: Add image

यहां ऊपर हमने दिखाया कि गहरी मेमोरी कैसे काम करती है। तो जैसा आप देख सकते हैं, इसे प्रशिक्षित करने के लिए आपको प्रासंगिकता, क्वेरी के साथ-साथ कॉर्पस डेटा (जिस डेटा को हम क्वेरी करना चाहते हैं) की आवश्यकता होती है। कॉर्पस डेटा पहले के खंड में पहले ही भर दिया गया था, यहां हम प्रश्न और प्रासंगिकता उत्पन्न करेंगे।

1. `questions` - यह स्ट्रिंग्स का एक पाठ है, जहां प्रत्येक स्ट्रिंग एक क्वेरी को प्रतिनिधित्व करता है
2. `relevance` - यह प्रत्येक प्रश्न के लिए सत्य के लिंक को समाहित करता है। प्रश्न का जवाब देने वाले कई दस्तावेज़ हो सकते हैं। इस कारण से प्रासंगिकता `List[List[tuple[str, float]]]` है, जहां बाहरी सूची प्रश्नों को प्रतिनिधित्व करती है और आंतरिक सूची प्रासंगिक दस्तावेज़ों को। ट्यूपल में स्ट्रिंग, फ्लोट जोड़ी शामिल है जहां स्ट्रिंग डेटासेट में `id` टेंसर से संबंधित स्रोत दस्तावेज़ का आईडी है, जबकि फ्लोट प्रश्न से वर्तमान दस्तावेज़ की संबंधित मात्रा को दर्शाता है।

अब, आइए संश्लेषित प्रश्न और प्रासंगिकता उत्पन्न करें:

```python
from typing import List

from langchain.chains.openai_functions import (
    create_structured_output_chain,
)
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
```

```python
# fetch dataset docs and ids if they exist (optional you can also ingest)
docs = db.vectorstore.dataset.text.data(fetch_chunks=True, aslist=True)["value"]
ids = db.vectorstore.dataset.id.data(fetch_chunks=True, aslist=True)["value"]
```

```python
# If we pass in a model explicitly, we need to make sure it supports the OpenAI function-calling API.
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


class Questions(BaseModel):
    """Identifying information about a person."""

    question: str = Field(..., description="Questions about text")


prompt_msgs = [
    SystemMessage(
        content="You are a world class expert for generating questions based on provided context. \
                You make sure the question can be answered by the text."
    ),
    HumanMessagePromptTemplate.from_template(
        "Use the given text to generate a question from the following input: {input}"
    ),
    HumanMessage(content="Tips: Make sure to answer in the correct format"),
]
prompt = ChatPromptTemplate(messages=prompt_msgs)
chain = create_structured_output_chain(Questions, llm, prompt, verbose=True)

text = "# Understanding Hallucinations and Bias ## **Introduction** In this lesson, we'll cover the concept of **hallucinations** in LLMs, highlighting their influence on AI applications and demonstrating how to mitigate them using techniques like the retriever's architectures. We'll also explore **bias** within LLMs with examples."
questions = chain.run(input=text)
print(questions)
```

```python
import random

from langchain_openai import OpenAIEmbeddings
from tqdm import tqdm


def generate_queries(docs: List[str], ids: List[str], n: int = 100):
    questions = []
    relevances = []
    pbar = tqdm(total=n)
    while len(questions) < n:
        # 1. randomly draw a piece of text and relevance id
        r = random.randint(0, len(docs) - 1)
        text, label = docs[r], ids[r]

        # 2. generate queries and assign and relevance id
        generated_qs = [chain.run(input=text).question]
        questions.extend(generated_qs)
        relevances.extend([[(label, 1)] for _ in generated_qs])
        pbar.update(len(generated_qs))
        if len(questions) % 10 == 0:
            print(f"q: {len(questions)}")
    return questions[:n], relevances[:n]


chain = create_structured_output_chain(Questions, llm, prompt, verbose=False)
questions, relevances = generate_queries(docs, ids, n=200)

train_questions, train_relevances = questions[:100], relevances[:100]
test_questions, test_relevances = questions[100:], relevances[100:]
```

अब हमने 100 प्रशिक्षण क्वेरी और 100 परीक्षण क्वेरी भी बना लिए हैं। अब आइए गहरी मेमोरी को प्रशिक्षित करें:

```python
job_id = db.vectorstore.deep_memory.train(
    queries=train_questions,
    relevance=train_relevances,
)
```

आइए प्रशिक्षण प्रगति को ट्रैक करें:

```python
db.vectorstore.deep_memory.status("6538939ca0b69a9ca45c528c")
```

```output

--------------------------------------------------------------
|                  6538e02ecda4691033a51c5b                  |
--------------------------------------------------------------
| status                     | completed                     |
--------------------------------------------------------------
| progress                   | eta: 1.4 seconds              |
|                            | recall@10: 79.00% (+34.00%)   |
--------------------------------------------------------------
| results                    | recall@10: 79.00% (+34.00%)   |
--------------------------------------------------------------
```

## 3. गहरी मेमोरी प्रदर्शन का मूल्यांकन

महान, हमने मॉडल को प्रशिक्षित कर लिया है! यह रिकॉल में कुछ महत्वपूर्ण सुधार दिखा रहा है, लेकिन अब इसका उपयोग कैसे कर सकते हैं और नए अनदेखे डेटा पर इसका मूल्यांकन कैसे कर सकते हैं? इस खंड में हम मॉडल मूल्यांकन और अनुमान भाग में गहराई से जाएंगे और देखेंगे कि इसका LangChain के साथ कैसे उपयोग किया जा सकता है ताकि पुनर्प्राप्ति सटीकता में वृद्धि की जा सके।

### 3.1 गहरी मेमोरी मूल्यांकन

शुरुआत में हम गहरी मेमोरी के अंतर्निहित मूल्यांकन विधि का उपयोग कर सकते हैं।
यह कई `रिकॉल` मीट्रिक्स की गणना करता है।
यह कुछ पंक्तियों में आसानी से किया जा सकता है।

```python
recall = db.vectorstore.deep_memory.evaluate(
    queries=test_questions,
    relevance=test_relevances,
)
```

```output

Embedding queries took 0.81 seconds
---- Evaluating without model ----
Recall@1:	  9.0%
Recall@3:	  19.0%
Recall@5:	  24.0%
Recall@10:	  42.0%
Recall@50:	  93.0%
Recall@100:	  98.0%
---- Evaluating with model ----
Recall@1:	  19.0%
Recall@3:	  42.0%
Recall@5:	  49.0%
Recall@10:	  69.0%
Recall@50:	  97.0%
Recall@100:	  97.0%
```

यह एक अनदेखे परीक्षण डेटासेट पर भी काफी महत्वपूर्ण सुधार दिखा रहा है!!!

### 3.2 गहरी मेमोरी + RAGas

```python
from ragas.langchain import RagasEvaluatorChain
from ragas.metrics import (
    context_recall,
)
```

आइए रिकॉल को सत्य मानों में परिवर्तित करें:

```python
def convert_relevance_to_ground_truth(docs, relevance):
    ground_truths = []

    for rel in relevance:
        ground_truth = []
        for doc_id, _ in rel:
            ground_truth.append(docs[doc_id])
        ground_truths.append(ground_truth)
    return ground_truths
```

```python
ground_truths = convert_relevance_to_ground_truth(docs, test_relevances)

for deep_memory in [False, True]:
    print("\nEvaluating with deep_memory =", deep_memory)
    print("===================================")

    retriever = db.as_retriever()
    retriever.search_kwargs["deep_memory"] = deep_memory

    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatOpenAI(model="gpt-3.5-turbo"),
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
    )

    metrics = {
        "context_recall_score": 0,
    }

    eval_chains = {m.name: RagasEvaluatorChain(metric=m) for m in [context_recall]}

    for question, ground_truth in zip(test_questions, ground_truths):
        result = qa_chain({"query": question})
        result["ground_truths"] = ground_truth
        for name, eval_chain in eval_chains.items():
            score_name = f"{name}_score"
            metrics[score_name] += eval_chain(result)[score_name]

    for metric in metrics:
        metrics[metric] /= len(test_questions)
        print(f"{metric}: {metrics[metric]}")
    print("===================================")
```

```output

Evaluating with deep_memory = False
===================================
context_recall_score = 0.3763423145
===================================

Evaluating with deep_memory = True
===================================
context_recall_score = 0.5634545323
===================================
```

### 3.3 गहरी मेमोरी अनुमान

#### TODO: Add image

गहरी मेमोरी के साथ

```python
retriever = db.as_retriever()
retriever.search_kwargs["deep_memory"] = True
retriever.search_kwargs["k"] = 10

query = "Deamination of cytidine to uridine on the minus strand of viral DNA results in catastrophic G-to-A mutations in the viral genome."
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"), chain_type="stuff", retriever=retriever
)
print(qa.run(query))
```

```output
The base htype of the 'video_seq' tensor is 'video'.
```

गहरी मेमोरी के बिना

```python
retriever = db.as_retriever()
retriever.search_kwargs["deep_memory"] = False
retriever.search_kwargs["k"] = 10

query = "Deamination of cytidine to uridine on the minus strand of viral DNA results in catastrophic G-to-A mutations in the viral genome."
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"), chain_type="stuff", retriever=retriever
)
qa.run(query)
```

```output
The text does not provide information on the base htype of the 'video_seq' tensor.
```

### 3.4 गहरी मेमोरी लागत बचत

गहरी मेमोरी आपके मौजूदा कार्यप्रवाह को बदलिए बिना पुनर्प्राप्ति सटीकता में वृद्धि करता है। इसके अलावा, एलएलएम में टॉप_के इनपुट को कम करके, आप कम टोकन उपयोग के माध्यम से काफी अनुमान लागत कम कर सकते हैं।
