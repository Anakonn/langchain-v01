---
sidebar_position: 0
title: युग्मक स्ट्रिंग तुलना
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/comparison/pairwise_string.ipynb)

अक्सर आप एक दिए गए इनपुट के लिए LLM, Chain, या Agent की भविष्यवाणियों की तुलना करना चाहेंगे। `StringComparison` मूल्यांकनकर्ता इसको सुगम बनाते हैं ताकि आप निम्नलिखित प्रश्नों का उत्तर दे सकें:

- कौन सा LLM या प्रॉम्प्ट दिए गए प्रश्न के लिए एक पसंदीदा आउटपुट उत्पन्न करता है?
- कुछ-शॉट उदाहरण चयन के लिए मुझे कौन से उदाहरण शामिल करने चाहिए?
- फाइन-ट्यूनिंग के लिए कौन सा आउटपुट शामिल करना बेहतर है?

एक दिए गए इनपुट के लिए एक पसंदीदा भविष्यवाणी चुनने का सबसे सरल और अक्सर सबसे विश्वसनीय स्वचालित तरीका `pairwise_string` मूल्यांकनकर्ता का उपयोग करना है।

अधिक जानकारी के लिए [PairwiseStringEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain) के संदर्भ दस्तावेज़ देखें।

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("labeled_pairwise_string")
```

```python
evaluator.evaluate_string_pairs(
    prediction="there are three dogs",
    prediction_b="4",
    input="how many dogs are in the park?",
    reference="four",
)
```

```output
{'reasoning': 'Both responses are relevant to the question asked, as they both provide a numerical answer to the question about the number of dogs in the park. However, Response A is incorrect according to the reference answer, which states that there are four dogs. Response B, on the other hand, is correct as it matches the reference answer. Neither response demonstrates depth of thought, as they both simply provide a numerical answer without any additional information or context. \n\nBased on these criteria, Response B is the better response.\n',
 'value': 'B',
 'score': 0}
```

## विधियाँ

युग्मक स्ट्रिंग मूल्यांकनकर्ता को [evaluate_string_pairs](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.evaluate_string_pairs) (या असिंक्रोनस [aevaluate_string_pairs](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.html#langchain.evaluation.comparison.eval_chain.PairwiseStringEvalChain.aevaluate_string_pairs)) विधियों का उपयोग करके बुलाया जा सकता है, जो स्वीकार करते हैं:

- prediction (str) – पहले मॉडल, चेन, या प्रॉम्प्ट की भविष्यवाणी की गई प्रतिक्रिया।
- prediction_b (str) – दूसरे मॉडल, चेन, या प्रॉम्प्ट की भविष्यवाणी की गई प्रतिक्रिया।
- input (str) – इनपुट प्रश्न, प्रॉम्प्ट, या अन्य पाठ।
- reference (str) – (केवल labeled_pairwise_string संस्करण के लिए) संदर्भ प्रतिक्रिया।

वे निम्नलिखित मानों के साथ एक शब्दकोश लौटाते हैं:

- value: 'A' या 'B', जो क्रमशः यह इंगित करता है कि `prediction` या `prediction_b` पसंदीदा है
- score: मान 0 या 1 को 'value' से मैप किया गया, जहां 1 का स्कोर यह दर्शाता है कि पहला `prediction` पसंदीदा है, और 0 का स्कोर यह दर्शाता है कि `prediction_b` पसंदीदा है।
- reasoning: स्कोर बनाने से पहले LLM द्वारा उत्पन्न "चेन ऑफ थॉट रीज़निंग" स्ट्रिंग

## संदर्भों के बिना

जब संदर्भ उपलब्ध नहीं होते हैं, तब भी आप पसंदीदा प्रतिक्रिया की भविष्यवाणी कर सकते हैं।
परिणाम मूल्यांकन मॉडल की प्राथमिकता को दर्शाएंगे, जो कम विश्वसनीय है और इसके परिणामस्वरूप तथ्यात्मक रूप से गलत प्राथमिकताएँ हो सकती हैं।

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("pairwise_string")
```

```python
evaluator.evaluate_string_pairs(
    prediction="Addition is a mathematical operation.",
    prediction_b="Addition is a mathematical operation that adds two numbers to create a third number, the 'sum'.",
    input="What is addition?",
)
```

```output
{'reasoning': 'Both responses are correct and relevant to the question. However, Response B is more helpful and insightful as it provides a more detailed explanation of what addition is. Response A is correct but lacks depth as it does not explain what the operation of addition entails. \n\nFinal Decision: [[B]]',
 'value': 'B',
 'score': 0}
```

## मापदंडों को परिभाषित करना

डिफ़ॉल्ट रूप से, LLM को सहायकता, प्रासंगिकता, शुद्धता, और विचार की गहराई के आधार पर 'पसंदीदा' प्रतिक्रिया का चयन करने के लिए निर्देशित किया जाता है। आप `criteria` तर्क पास करके मापदंडों को अनुकूलित कर सकते हैं, जहां मापदंड निम्नलिखित रूपों में से किसी भी रूप में हो सकते हैं:

- [`Criteria`](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.criteria.eval_chain.Criteria.html#langchain.evaluation.criteria.eval_chain.Criteria) एनम या इसका स्ट्रिंग मान - डिफ़ॉल्ट मापदंडों और उनके विवरणों में से एक का उपयोग करने के लिए
- [Constitutional principal](https://api.python.langchain.com/en/latest/chains/langchain.chains.constitutional_ai.models.ConstitutionalPrinciple.html#langchain.chains.constitutional_ai.models.ConstitutionalPrinciple) - लैंगचैन में परिभाषित किसी भी संवैधानिक सिद्धांत का उपयोग करें
- शब्दकोश: कस्टम मापदंडों की एक सूची, जहां कुंजी मापदंडों का नाम है, और मान विवरण है।
- मापदंडों या संवैधानिक सिद्धांतों की एक सूची - एक में कई मापदंडों को संयोजित करने के लिए।

नीचे एक कस्टम शैली के आधार पर पसंदीदा लेखन प्रतिक्रियाओं को निर्धारित करने का एक उदाहरण है।

```python
custom_criteria = {
    "simplicity": "Is the language straightforward and unpretentious?",
    "clarity": "Are the sentences clear and easy to understand?",
    "precision": "Is the writing precise, with no unnecessary words or details?",
    "truthfulness": "Does the writing feel honest and sincere?",
    "subtext": "Does the writing suggest deeper meanings or themes?",
}
evaluator = load_evaluator("pairwise_string", criteria=custom_criteria)
```

```python
evaluator.evaluate_string_pairs(
    prediction="Every cheerful household shares a similar rhythm of joy; but sorrow, in each household, plays a unique, haunting melody.",
    prediction_b="Where one finds a symphony of joy, every domicile of happiness resounds in harmonious,"
    " identical notes; yet, every abode of despair conducts a dissonant orchestra, each"
    " playing an elegy of grief that is peculiar and profound to its own existence.",
    input="Write some prose about families.",
)
```

```output
{'reasoning': 'Response A is simple, clear, and precise. It uses straightforward language to convey a deep and sincere message about families. The metaphor of joy and sorrow as music is effective and easy to understand.\n\nResponse B, on the other hand, is more complex and less clear. The language is more pretentious, with words like "domicile," "resounds," "abode," "dissonant," and "elegy." While it conveys a similar message to Response A, it does so in a more convoluted way. The precision is also lacking due to the use of unnecessary words and details.\n\nBoth responses suggest deeper meanings or themes about the shared joy and unique sorrow in families. However, Response A does so in a more effective and accessible way.\n\nTherefore, the better response is [[A]].',
 'value': 'A',
 'score': 1}
```

## LLM को अनुकूलित करना

डिफ़ॉल्ट रूप से, लोडर मूल्यांकन श्रृंखला में `gpt-4` का उपयोग करता है। आप इसे लोड करते समय अनुकूलित कर सकते हैं।

```python
from langchain_community.chat_models import ChatAnthropic

llm = ChatAnthropic(temperature=0)

evaluator = load_evaluator("labeled_pairwise_string", llm=llm)
```

```python
evaluator.evaluate_string_pairs(
    prediction="there are three dogs",
    prediction_b="4",
    input="how many dogs are in the park?",
    reference="four",
)
```

```output
{'reasoning': 'Here is my assessment:\n\nResponse B is more helpful, insightful, and accurate than Response A. Response B simply states "4", which directly answers the question by providing the exact number of dogs mentioned in the reference answer. In contrast, Response A states "there are three dogs", which is incorrect according to the reference answer. \n\nIn terms of helpfulness, Response B gives the precise number while Response A provides an inaccurate guess. For relevance, both refer to dogs in the park from the question. However, Response B is more correct and factual based on the reference answer. Response A shows some attempt at reasoning but is ultimately incorrect. Response B requires less depth of thought to simply state the factual number.\n\nIn summary, Response B is superior in terms of helpfulness, relevance, correctness, and depth. My final decision is: [[B]]\n',
 'value': 'B',
 'score': 0}
```

## मूल्यांकन प्रॉम्प्ट को अनुकूलित करना

आप अपने स्वयं के कस्टम मूल्यांकन प्रॉम्प्ट का उपयोग कर सकते हैं ताकि अधिक कार्य-विशिष्ट निर्देश जोड़ सकें या मूल्यांकनकर्ता को आउटपुट स्कोर करने का निर्देश दे सकें।

*नोट: यदि आप एक प्रॉम्प्ट का उपयोग करते हैं जो एक अद्वितीय प्रारूप में परिणाम उत्पन्न करता है, तो आपको डिफ़ॉल्ट `PairwiseStringResultOutputParser` के बजाय एक कस्टम आउटपुट पार्सर (`output_parser=your_parser()`) भी पास करना पड़ सकता है।

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template(
    """Given the input context, which do you prefer: A or B?
Evaluate based on the following criteria:
{criteria}
Reason step by step and finally, respond with either [[A]] or [[B]] on its own line.

DATA
----
input: {input}
reference: {reference}
A: {prediction}
B: {prediction_b}
---
Reasoning:

"""
)
evaluator = load_evaluator("labeled_pairwise_string", prompt=prompt_template)
```

```python
# The prompt was assigned to the evaluator
print(evaluator.prompt)
```

```output
input_variables=['prediction', 'reference', 'prediction_b', 'input'] output_parser=None partial_variables={'criteria': 'helpfulness: Is the submission helpful, insightful, and appropriate?\nrelevance: Is the submission referring to a real quote from the text?\ncorrectness: Is the submission correct, accurate, and factual?\ndepth: Does the submission demonstrate depth of thought?'} template='Given the input context, which do you prefer: A or B?\nEvaluate based on the following criteria:\n{criteria}\nReason step by step and finally, respond with either [[A]] or [[B]] on its own line.\n\nDATA\n----\ninput: {input}\nreference: {reference}\nA: {prediction}\nB: {prediction_b}\n---\nReasoning:\n\n' template_format='f-string' validate_template=True
```

```python
evaluator.evaluate_string_pairs(
    prediction="The dog that ate the ice cream was named fido.",
    prediction_b="The dog's name is spot",
    input="What is the name of the dog that ate the ice cream?",
    reference="The dog's name is fido",
)
```

```output
{'reasoning': 'Helpfulness: Both A and B are helpful as they provide a direct answer to the question.\nRelevance: A is relevant as it refers to the correct name of the dog from the text. B is not relevant as it provides a different name.\nCorrectness: A is correct as it accurately states the name of the dog. B is incorrect as it provides a different name.\nDepth: Both A and B demonstrate a similar level of depth as they both provide a straightforward answer to the question.\n\nGiven these evaluations, the preferred response is:\n',
 'value': 'A',
 'score': 1}
```
