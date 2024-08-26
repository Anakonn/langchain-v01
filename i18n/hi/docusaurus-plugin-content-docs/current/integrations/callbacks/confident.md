---
translated: true
---

# आत्मविश्वास

>[DeepEval](https://confident-ai.com) यूनिट टेस्टिंग एलएलएम के लिए पैकेज।
> आत्मविश्वास का उपयोग करके, हर कोई यूनिट टेस्टिंग और एकीकरण टेस्टिंग दोनों का उपयोग करके रोबस्ट भाषा मॉडल बना सकता है। हम प्रत्येक चरण में समर्थन प्रदान करते हैं
> संश्लेषित डेटा सृजन से लेकर परीक्षण तक।

इस गाइड में हम एलएलएम के प्रदर्शन को कैसे परीक्षित और मापा जाता है, यह दिखाएंगे। हम आपको बताएंगे कि आप हमारे कॉलबैक का उपयोग कैसे कर सकते हैं और अपने खुद के मीट्रिक को कैसे परिभाषित और लॉग कर सकते हैं।

DeepEval भी प्रदान करता है:
- संश्लेषित डेटा कैसे बनाया जाए
- प्रदर्शन कैसे मापा जाए
- समय के साथ परिणामों की निगरानी और समीक्षा के लिए एक डैशबोर्ड

## स्थापना और सेटअप

```python
%pip install --upgrade --quiet  langchain langchain-openai deepeval langchain-chroma
```

### API क्रेडेंशियल प्राप्त करना

DeepEval API क्रेडेंशियल प्राप्त करने के लिए, अगले चरणों का पालन करें:

1. https://app.confident-ai.com पर जाएं
2. "संगठन" पर क्लिक करें
3. API कुंजी कॉपी करें।

जब आप लॉग इन करते हैं, तो आपसे `implementation` नाम सेट करने के लिए भी कहा जाएगा। `implementation` नाम आवश्यक है क्योंकि यह कार्यान्वयन के प्रकार का वर्णन करता है। (आप अपने प्रोजेक्ट को क्या कहना चाहते हैं, उस पर विचार करें। हम इसे वर्णनात्मक बनाने की सिफारिश करते हैं।)

```python
!deepeval login
```

### DeepEval सेट करें

आप डिफ़ॉल्ट रूप से `DeepEvalCallbackHandler` का उपयोग कर सकते हैं ताकि आप ट्रैक करना चाहते मीट्रिक्स को सेट कर सकें। हालांकि, इसका मीट्रिक्स के लिए सीमित समर्थन है (जल्द ही और जोड़ा जाएगा)। यह वर्तमान में समर्थित है:
- [उत्तर प्रासंगिकता](https://docs.confident-ai.com/docs/measuring_llm_performance/answer_relevancy)
- [पूर्वाग्रह](https://docs.confident-ai.com/docs/measuring_llm_performance/debias)
- [विषाक्तता](https://docs.confident-ai.com/docs/measuring_llm_performance/non_toxic)

```python
from deepeval.metrics.answer_relevancy import AnswerRelevancy

# Here we want to make sure the answer is minimally relevant
answer_relevancy_metric = AnswerRelevancy(minimum_score=0.5)
```

## शुरू करें

`DeepEvalCallbackHandler` का उपयोग करने के लिए, हमें `implementation_name` की आवश्यकता है।

```python
from langchain_community.callbacks.confident_callback import DeepEvalCallbackHandler

deepeval_callback = DeepEvalCallbackHandler(
    implementation_name="langchainQuickstart", metrics=[answer_relevancy_metric]
)
```

### पहला परिदृश्य: एलएलएम में फीड करना

आप इसे OpenAI के साथ अपने एलएलएम में फीड कर सकते हैं।

```python
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0,
    callbacks=[deepeval_callback],
    verbose=True,
    openai_api_key="<YOUR_API_KEY>",
)
output = llm.generate(
    [
        "What is the best evaluation tool out there? (no bias at all)",
    ]
)
```

```output
LLMResult(generations=[[Generation(text='\n\nQ: What did the fish say when he hit the wall? \nA: Dam.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nThe Moon \n\nThe moon is high in the midnight sky,\nSparkling like a star above.\nThe night so peaceful, so serene,\nFilling up the air with love.\n\nEver changing and renewing,\nA never-ending light of grace.\nThe moon remains a constant view,\nA reminder of life’s gentle pace.\n\nThrough time and space it guides us on,\nA never-fading beacon of hope.\nThe moon shines down on us all,\nAs it continues to rise and elope.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ. What did one magnet say to the other magnet?\nA. "I find you very attractive!"', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nThe world is charged with the grandeur of God.\nIt will flame out, like shining from shook foil;\nIt gathers to a greatness, like the ooze of oil\nCrushed. Why do men then now not reck his rod?\n\nGenerations have trod, have trod, have trod;\nAnd all is seared with trade; bleared, smeared with toil;\nAnd wears man's smudge and shares man's smell: the soil\nIs bare now, nor can foot feel, being shod.\n\nAnd for all this, nature is never spent;\nThere lives the dearest freshness deep down things;\nAnd though the last lights off the black West went\nOh, morning, at the brown brink eastward, springs —\n\nBecause the Holy Ghost over the bent\nWorld broods with warm breast and with ah! bright wings.\n\n~Gerard Manley Hopkins", generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ: What did one ocean say to the other ocean?\nA: Nothing, they just waved.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nA poem for you\n\nOn a field of green\n\nThe sky so blue\n\nA gentle breeze, the sun above\n\nA beautiful world, for us to love\n\nLife is a journey, full of surprise\n\nFull of joy and full of surprise\n\nBe brave and take small steps\n\nThe future will be revealed with depth\n\nIn the morning, when dawn arrives\n\nA fresh start, no reason to hide\n\nSomewhere down the road, there's a heart that beats\n\nBelieve in yourself, you'll always succeed.", generation_info={'finish_reason': 'stop', 'logprobs': None})]], llm_output={'token_usage': {'completion_tokens': 504, 'total_tokens': 528, 'prompt_tokens': 24}, 'model_name': 'text-davinci-003'})
```

आप फिर `is_successful()` मेथड को कॉल करके मीट्रिक की जांच कर सकते हैं कि क्या यह सफल था।

```python
answer_relevancy_metric.is_successful()
# returns True/False
```

एक बार जब आप ऐसा कर लेते हैं, तो आप नीचे दिए गए हमारे डैशबोर्ड को देख सकते हैं।

![Dashboard](https://docs.confident-ai.com/assets/images/dashboard-screenshot-b02db73008213a211b1158ff052d969e.png)

### दूसरा परिदृश्य: कॉलबैक के बिना श्रृंखला में एलएलएम ट्रैक करना

कॉलबैक के बिना श्रृंखला में एलएलएम ट्रैक करने के लिए, आप इसे अंत में प्लग कर सकते हैं।

हम एक सरल श्रृंखला को नीचे दिखाए गए तरीके से परिभाषित कर सकते हैं।

```python
import requests
from langchain.chains import RetrievalQA
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_file_url = "https://raw.githubusercontent.com/hwchase17/chat-your-data/master/state_of_the_union.txt"

openai_api_key = "sk-XXX"

with open("state_of_the_union.txt", "w") as f:
    response = requests.get(text_file_url)
    f.write(response.text)

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
docsearch = Chroma.from_documents(texts, embeddings)

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(openai_api_key=openai_api_key),
    chain_type="stuff",
    retriever=docsearch.as_retriever(),
)

# Providing a new question-answering pipeline
query = "Who is the president?"
result = qa.run(query)
```

श्रृंखला को परिभाषित करने के बाद, आप उत्तर समानता को मैन्युअल रूप से जांच सकते हैं।

```python
answer_relevancy_metric.measure(result, query)
answer_relevancy_metric.is_successful()
```

### अगला क्या?

आप अपने खुद के कस्टम मीट्रिक्स [यहां](https://docs.confident-ai.com/docs/quickstart/custom-metrics) बना सकते हैं।

DeepEval अन्य सुविधाएं भी प्रदान करता है जैसे कि [स्वचालित रूप से यूनिट टेस्ट बनाना](https://docs.confident-ai.com/docs/quickstart/synthetic-data-creation), [हैलुसिनेशन के लिए परीक्षण](https://docs.confident-ai.com/docs/measuring_llm_performance/factual_consistency)।

यदि आप रुचि रखते हैं, तो हमारे GitHub रिपॉजिटरी [https://github.com/confident-ai/deepeval](https://github.com/confident-ai/deepeval) पर जाएं। हम किसी भी पीआर और एलएलएम प्रदर्शन को बेहतर बनाने पर चर्चा का स्वागत करते हैं।
