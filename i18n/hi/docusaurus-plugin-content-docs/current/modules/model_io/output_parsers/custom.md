---
translated: true
---

# कस्टम आउटपुट पार्सर्स

कुछ स्थितियों में आप एक कस्टम पार्सर को लागू करना चाहते हो जो मॉडल आउटपुट को एक कस्टम प्रारूप में संरचित करे।

कस्टम पार्सर को लागू करने के दो तरीके हैं:

1. LCEL में `RunnableLambda` या `RunnableGenerator` का उपयोग करना - हम अधिकांश उपयोग मामलों के लिए इसकी सिफारिश करते हैं
2. पार्सिंग के लिए आधारभूत वर्गों से अनुवर्तन करना - यह चीजों को करने का कठिन तरीका है

इन दो दृष्टिकोणों के बीच का अंतर मुख्य रूप से सतही है और मुख्य रूप से उन कॉलबैक्स में है जो ट्रिगर होते हैं (जैसे, `on_chain_start` बनाम `on_parser_start`), और एक रनेबल लैम्बडा बनाम एक पार्सर को एक ट्रेसिंग प्लेटफॉर्म जैसे LangSmith में कैसे दृश्यमान किया जा सकता है।

## रनेबल लैम्बडा और जनरेटर

पार्सिंग करने का अनुशंसित तरीका **रनेबल लैम्बडा** और **रनेबल जनरेटर** का उपयोग करना है!

यहाँ, हम एक सरल पार्सर बनाएंगे जो मॉडल से आउटपुट को उल्टा करेगा।

उदाहरण के लिए, यदि मॉडल "Meow" आउटपुट करता है, तो पार्सर "mEOW" उत्पन्न करेगा।

```python
from typing import Iterable

from langchain_anthropic.chat_models import ChatAnthropic
from langchain_core.messages import AIMessage, AIMessageChunk

model = ChatAnthropic(model_name="claude-2.1")


def parse(ai_message: AIMessage) -> str:
    """Parse the AI message."""
    return ai_message.content.swapcase()


chain = model | parse
chain.invoke("hello")
```
```output
'hELLO!'
```

:::tip

LCEL स्वचालित रूप से `parse` फ़ंक्शन को `RunnableLambda(parse)` में अपग्रेड करता है जब `|` संक्षिप्त वाक्यविन्यास का उपयोग करके संयोजित किया जाता है।

यदि आप इससे खुश नहीं हैं, तो आप मैन्युअल रूप से `RunnableLambda` आयात कर सकते हैं और फिर `parse = RunnableLambda(parse)` चला सकते हैं।
:::

क्या स्ट्रीमिंग काम करता है?

```python
for chunk in chain.stream("tell me about yourself in one sentence"):
    print(chunk, end="|", flush=True)
```
```output
i'M cLAUDE, AN ai ASSISTANT CREATED BY aNTHROPIC TO BE HELPFUL, HARMLESS, AND HONEST.|
```

नहीं, यह नहीं करता क्योंकि पार्सर इनपुट को एकत्रित करता है और फिर आउटपुट को पार्स करता है।

यदि हम एक स्ट्रीमिंग पार्सर को लागू करना चाहते हैं, तो हम पार्सर को इनपुट पर एक इटरेबल स्वीकार करवा सकते हैं और परिणाम को जैसे ही उपलब्ध होते हैं, उत्पन्न कर सकते हैं।

```python
from langchain_core.runnables import RunnableGenerator


def streaming_parse(chunks: Iterable[AIMessageChunk]) -> Iterable[str]:
    for chunk in chunks:
        yield chunk.content.swapcase()


streaming_parse = RunnableGenerator(streaming_parse)
```

:::important

कृपया स्ट्रीमिंग पार्सर को `RunnableGenerator` में लपेटें क्योंकि हम इसे `|` संक्षिप्त वाक्यविन्यास के साथ स्वचालित रूप से अपग्रेड करना बंद कर सकते हैं।
:::

```python
chain = model | streaming_parse
chain.invoke("hello")
```
```output
'hELLO!'
```

चलो यह पुष्टि करते हैं कि स्ट्रीमिंग काम करता है!

```python
for chunk in chain.stream("tell me about yourself in one sentence"):
    print(chunk, end="|", flush=True)
```
```output
i|'M| cLAUDE|,| AN| ai| ASSISTANT| CREATED| BY| aN|THROP|IC| TO| BE| HELPFUL|,| HARMLESS|,| AND| HONEST|.|
```

## पार्सिंग आधारभूत वर्गों से अनुवर्तन करना

पार्सर को लागू करने का एक और दृष्टिकोण `BaseOutputParser`, `BaseGenerationOutputParser` या आवश्यकता के अनुसार अन्य आधारभूत पार्सरों से अनुवर्तन करना है।

सामान्य तौर पर, हम अधिकांश उपयोग मामलों के लिए इस दृष्टिकोण की सिफारिश नहीं करते क्योंकि इससे लिखने के लिए अधिक कोड होता है, लेकिन महत्वपूर्ण लाभ नहीं होते।

सबसे सरल प्रकार का आउटपुट पार्सर `BaseOutputParser` वर्ग का विस्तार करता है और निम्नलिखित विधियों को लागू करना होता है:

* `parse`: मॉडल से स्ट्रिंग आउटपुट लेता है और इसे पार्स करता है
* (वैकल्पिक) `_type`: पार्सर का नाम पहचानता है।

जब चैट मॉडल या LLM से आउटपुट गलत प्रारूप में होता है, तो यह `OutputParserException` को फेंक सकता है ताकि इंगित किया जा सके कि खराब इनपुट के कारण पार्सिंग विफल हो गई है। इस अपवाद का उपयोग करने से कोड जो पार्सर का उपयोग करता है, इसे एक सुसंगत तरीके से संभाल सकता है।

:::tip पार्सर रनेबल्स हैं! 🏃

क्योंकि `BaseOutputParser` `Runnable` इंटरफ़ेस को लागू करता है, इस तरह से आप बनाएंगे कोई भी कस्टम पार्सर वैध LangChain रनेबल्स बन जाएगा और स्वचालित असिंक्रोनस समर्थन, बैच इंटरफ़ेस, लॉगिंग समर्थन आदि का लाभ उठाएगा।
:::

### सरल पार्सर

यहाँ एक सरल पार्सर है जो **स्ट्रिंग** प्रतिनिधित्व को पार्स कर सकता है और इसे संबंधित `boolean` प्रकार में परिवर्तित कर सकता है।

```python
from langchain_core.exceptions import OutputParserException
from langchain_core.output_parsers import BaseOutputParser


# The [bool] desribes a parameterization of a generic.
# It's basically indicating what the return type of parse is
# in this case the return type is either True or False
class BooleanOutputParser(BaseOutputParser[bool]):
    """Custom boolean parser."""

    true_val: str = "YES"
    false_val: str = "NO"

    def parse(self, text: str) -> bool:
        cleaned_text = text.strip().upper()
        if cleaned_text not in (self.true_val.upper(), self.false_val.upper()):
            raise OutputParserException(
                f"BooleanOutputParser expected output value to either be "
                f"{self.true_val} or {self.false_val} (case-insensitive). "
                f"Received {cleaned_text}."
            )
        return cleaned_text == self.true_val.upper()

    @property
    def _type(self) -> str:
        return "boolean_output_parser"
```
```python
parser = BooleanOutputParser()
parser.invoke("YES")
```
```output
True
```
```python
try:
    parser.invoke("MEOW")
except Exception as e:
    print(f"Triggered an exception of type: {type(e)}")
```
```output
Triggered an exception of type: <class 'langchain_core.exceptions.OutputParserException'>
```

चलो पैरामीटरीकरण को बदलने का परीक्षण करते हैं

```python
parser = BooleanOutputParser(true_val="OKAY")
parser.invoke("OKAY")
```
```output
True
```

चलो पुष्टि करते हैं कि अन्य LCEL विधियाँ मौजूद हैं

```python
parser.batch(["OKAY", "NO"])
```
```output
[True, False]
```
```python
await parser.abatch(["OKAY", "NO"])
```
```output
[True, False]
```
```python
from langchain_anthropic.chat_models import ChatAnthropic

anthropic = ChatAnthropic(model_name="claude-2.1")
anthropic.invoke("say OKAY or NO")
```
```output
AIMessage(content='OKAY')
```

चलो परीक्षण करते हैं कि हमारा पार्सर काम करता है!

```python
chain = anthropic | parser
chain.invoke("say OKAY or NO")
```
```output
True
```

:::note
पार्सर LLM से आउटपुट (स्ट्रिंग) या चैट मॉडल से आउटपुट (एक `AIMessage`) के साथ काम करेगा!
:::

### कच्चे मॉडल आउटपुट्स को पार्स करना

कभी-कभी मॉडल आउटपुट पर अतिरिक्त मेटाडेटा होता है जो कच्चे पाठ के अलावा महत्वपूर्ण होता है। इसका एक उदाहरण टूल कॉलिंग है, जहां कॉल की गई फ़ंक्शनों में पारित किए जाने वाले तर्क एक अलग गुण में वापस किए जाते हैं। यदि आप इस अधिक विस्तृत नियंत्रण की आवश्यकता है, तो आप बजाय `BaseGenerationOutputParser` वर्ग से उत्तराधिकार ले सकते हैं।

यह वर्ग एक एकमात्र `parse_result` विधि की आवश्यकता होती है। यह विधि कच्चे मॉडल आउटपुट (जैसे, `Generation` या `ChatGeneration` की सूची) लेती है और पार्स किया गया आउटपुट वापस करती है।

`Generation` और `ChatGeneration` दोनों का समर्थन करना पार्सर को रेगुलर LLM के साथ-साथ चैट मॉडल के साथ भी काम करने में सक्षम बनाता है।

```python
from typing import List

from langchain_core.exceptions import OutputParserException
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import BaseGenerationOutputParser
from langchain_core.outputs import ChatGeneration, Generation


class StrInvertCase(BaseGenerationOutputParser[str]):
    """An example parser that inverts the case of the characters in the message.

    This is an example parse shown just for demonstration purposes and to keep
    the example as simple as possible.
    """

    def parse_result(self, result: List[Generation], *, partial: bool = False) -> str:
        """Parse a list of model Generations into a specific format.

        Args:
            result: A list of Generations to be parsed. The Generations are assumed
                to be different candidate outputs for a single model input.
                Many parsers assume that only a single generation is passed it in.
                We will assert for that
            partial: Whether to allow partial results. This is used for parsers
                     that support streaming
        """
        if len(result) != 1:
            raise NotImplementedError(
                "This output parser can only be used with a single generation."
            )
        generation = result[0]
        if not isinstance(generation, ChatGeneration):
            # Say that this one only works with chat generations
            raise OutputParserException(
                "This output parser can only be used with a chat generation."
            )
        return generation.message.content.swapcase()


chain = anthropic | StrInvertCase()
```

चलो नए पार्सर का परीक्षण करते हैं! इसे मॉडल से आउटपुट को उल्टा करना चाहिए।

```python
chain.invoke("Tell me a short sentence about yourself")
```
```output
'hELLO! mY NAME IS cLAUDE.'
```
