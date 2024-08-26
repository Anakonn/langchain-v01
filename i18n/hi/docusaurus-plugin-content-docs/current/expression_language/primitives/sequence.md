---
keywords:
- Runnable
- Runnables
- LCEL
sidebar_position: 0
title: 'अनुक्रम: रनेबल्स को श्रृंखलाबद्ध करना'
translated: true
---

# रनेबल्स को श्रृंखलाबद्ध करना

`Runnable` इंटरफ़ेस का एक प्रमुख लाभ यह है कि किसी भी दो रनेबल्स को अनुक्रमों में "श्रृंखलाबद्ध" किया जा सकता है। पिछले रनेबल के `.invoke()` कॉल का आउटपुट अगले रनेबल के इनपुट के रूप में पारित किया जाता है। यह पाइप ऑपरेटर (`|`) का उपयोग करके या अधिक स्पष्ट `.pipe()` मेथड का उपयोग करके किया जा सकता है, जो एक ही काम करता है। परिणामी `RunnableSequence` खुद एक रनेबल है, जिसका मतलब है कि इसे किसी भी अन्य रनेबल की तरह आमंत्रित, स्ट्रीम या पाइप किया जा सकता है।

## पाइप ऑपरेटर

यह कैसे काम करता है, इसे दिखाने के लिए, चलो एक उदाहरण के माध्यम से चलते हैं। हम LangChain में एक सामान्य पैटर्न पर चर्चा करेंगे: [प्रॉम्प्ट टेम्प्लेट](/docs/modules/model_io/prompts/) का उपयोग करके इनपुट को [चैट मॉडल](/docs/modules/model_io/chat/) में प्रारूपित करना, और अंत में [आउटपुट पार्सर](/docs/modules/model_io/output_parsers/) के साथ चैट संदेश आउटपुट को स्ट्रिंग में परिवर्तित करना।

```python
%pip install --upgrade --quiet langchain langchain-anthropic
```

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
model = ChatAnthropic(model_name="claude-3-haiku-20240307")

chain = prompt | model | StrOutputParser()
```

प्रॉम्प्ट और मॉडल दोनों रनेबल हैं, और प्रॉम्प्ट कॉल से आउटपुट प्रकार चैट मॉडल के इनपुट प्रकार के समान है, इसलिए हम उन्हें एक साथ श्रृंखलाबद्ध कर सकते हैं। हम फिर परिणामी अनुक्रम को किसी भी अन्य रनेबल की तरह आमंत्रित कर सकते हैं:

```python
chain.invoke({"topic": "bears"})
```

```output
"Here's a bear joke for you:\n\nWhy don't bears wear socks? \nBecause they have bear feet!\n\nHow's that? I tried to keep it light and silly. Bears can make for some fun puns and jokes. Let me know if you'd like to hear another one!"
```

### कोर्शन

हम इस श्रृंखला को और अधिक रनेबल्स के साथ मिलाकर एक और श्रृंखला बना सकते हैं। इसमें श्रृंखला घटकों के आवश्यक इनपुट और आउटपुट के आधार पर अन्य प्रकार के रनेबल्स का उपयोग करके इनपुट/आउटपुट प्रारूपण शामिल हो सकता है।

उदाहरण के लिए, मान लीजिए कि हम जोक जनरेट करने वाली श्रृंखला को किसी अन्य श्रृंखला के साथ संयोजित करना चाहते हैं जो यह मूल्यांकन करता है कि क्या उत्पन्न किया गया जोक मजेदार था या नहीं।

हमें अगली श्रृंखला में इनपुट को प्रारूपित करने में सावधान रहना होगा। नीचे दिए गए उदाहरण में, श्रृंखला में डिक्शनरी को स्वचालित रूप से पार्स और परिवर्तित किया जाता है और एक [`RunnableParallel`](/docs/expression_language/primitives/parallel) में बदल दिया जाता है, जो अपने सभी मूल्यों को समानांतर रूप से चलाता है और परिणामों के साथ एक डिक्शनरी लौटाता है।

यह वही प्रारूप है जिसकी अगली प्रॉम्प्ट टेम्प्लेट को आवश्यकता होती है। यहाँ यह कार्य में है:

```python
from langchain_core.output_parsers import StrOutputParser

analysis_prompt = ChatPromptTemplate.from_template("is this a funny joke? {joke}")

composed_chain = {"joke": chain} | analysis_prompt | model | StrOutputParser()
```

```python
composed_chain.invoke({"topic": "bears"})
```

```output
"That's a pretty classic and well-known bear pun joke. Whether it's considered funny is quite subjective, as humor is very personal. Some people may find that type of pun-based joke amusing, while others may not find it that humorous. Ultimately, the funniness of a joke is in the eye (or ear) of the beholder. If you enjoyed the joke and got a chuckle out of it, then that's what matters most."
```

फ़ंक्शन को भी रनेबल्स में कोर्स किया जाएगा, इसलिए आप अपनी श्रृंखलाओं में कस्टम लॉजिक भी जोड़ सकते हैं। नीचे दी गई श्रृंखला पहले की तरह ही तर्किक प्रवाह का परिणाम देती है:

```python
composed_chain_with_lambda = (
    chain
    | (lambda input: {"joke": input})
    | analysis_prompt
    | model
    | StrOutputParser()
)
```

```python
composed_chain_with_lambda.invoke({"topic": "beets"})
```

```output
'I appreciate the effort, but I have to be honest - I didn\'t find that joke particularly funny. Beet-themed puns can be quite hit-or-miss, and this one falls more on the "miss" side for me. The premise is a bit too straightforward and predictable. While I can see the logic behind it, the punchline just doesn\'t pack much of a comedic punch. \n\nThat said, I do admire your willingness to explore puns and wordplay around vegetables. Cultivating a good sense of humor takes practice, and not every joke is going to land. The important thing is to keep experimenting and finding what works. Maybe try for a more unexpected or creative twist on beet-related humor next time. But thanks for sharing - I always appreciate when humans test out jokes on me, even if they don\'t always make me laugh out loud.'
```

हालांकि, ध्यान रखें कि इस तरह के फ़ंक्शन का उपयोग स्ट्रीमिंग जैसी गतिविधियों को प्रभावित कर सकता है। अधिक जानकारी के लिए [इस खंड](/docs/expression_language/primitives/functions) देखें।

## `.pipe()` मेथड

हम उसी अनुक्रम को `.pipe()` मेथड का उपयोग करके भी संरचित कर सकते हैं। यह कैसा दिखता है:

```python
from langchain_core.runnables import RunnableParallel

composed_chain_with_pipe = (
    RunnableParallel({"joke": chain})
    .pipe(analysis_prompt)
    .pipe(model)
    .pipe(StrOutputParser())
)
```

```python
composed_chain_with_pipe.invoke({"topic": "battlestar galactica"})
```

```output
'That\'s a pretty good Battlestar Galactica-themed pun! I appreciated the clever play on words with "Centurion" and "center on." It\'s the kind of nerdy, science fiction-inspired humor that fans of the show would likely enjoy. The joke is clever and demonstrates a good understanding of the Battlestar Galactica universe. I\'d be curious to hear any other Battlestar-related jokes you might have up your sleeve. As long as they don\'t reproduce copyrighted material, I\'m happy to provide my thoughts on the humor and appeal for fans of the show.'
```
