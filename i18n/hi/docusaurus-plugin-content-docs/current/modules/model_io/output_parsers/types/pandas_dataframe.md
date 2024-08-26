---
translated: true
---

# पैंडास डेटाफ्रेम पार्सर

पैंडास डेटाफ्रेम पायथन प्रोग्रामिंग भाषा में एक लोकप्रिय डेटा संरचना है, जो आमतौर पर डेटा मैनिपुलेशन और विश्लेषण के लिए उपयोग किया जाता है। यह संरचित डेटा के साथ काम करने के लिए एक व्यापक सेट ऑफ़ टूल प्रदान करता है, जिससे यह डेटा सफाई, रूपांतरण और विश्लेषण जैसे कार्यों के लिए एक लचीली विकल्प बन जाता है।

यह आउटपुट पार्सर उपयोगकर्ताओं को एक मनमाना पैंडास डेटाफ्रेम निर्दिष्ट करने और एलएलएम से डेटा को एक प्रारूपित डिक्शनरी के रूप में प्राप्त करने की अनुमति देता है जो कि संबंधित डेटाफ्रेम से डेटा निकालता है। याद रखें कि बड़े भाषा मॉडल रिसाव अवधारणाएं हैं! आप परिभाषित प्रारूप निर्देशों के अनुसार एक अच्छी तरह से गठित क्वेरी जनरेट करने के लिए पर्याप्त क्षमता वाले एक एलएलएम का उपयोग करना होगा।

पैंडास के डेटाफ्रेम ऑब्जेक्ट का उपयोग करके उस डेटाफ्रेम को घोषित करें जिस पर आप क्वेरी करना चाहते हैं।

```python
import pprint
from typing import Any, Dict

import pandas as pd
from langchain.output_parsers import PandasDataFrameOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(temperature=0)
```

```python
# Solely for documentation purposes.
def format_parser_output(parser_output: Dict[str, Any]) -> None:
    for key in parser_output.keys():
        parser_output[key] = parser_output[key].to_dict()
    return pprint.PrettyPrinter(width=4, compact=True).pprint(parser_output)
```

```python
# Define your desired Pandas DataFrame.
df = pd.DataFrame(
    {
        "num_legs": [2, 4, 8, 0],
        "num_wings": [2, 0, 0, 0],
        "num_specimen_seen": [10, 2, 1, 8],
    }
)

# Set up a parser + inject instructions into the prompt template.
parser = PandasDataFrameOutputParser(dataframe=df)
```

```python
# Here's an example of a column operation being performed.
df_query = "Retrieve the num_wings column."

# Set up the prompt.
prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser
parser_output = chain.invoke({"query": df_query})

format_parser_output(parser_output)
```

```output
{'num_wings': {0: 2,
               1: 0,
               2: 0,
               3: 0}}
```

```python
# Here's an example of a row operation being performed.
df_query = "Retrieve the first row."

# Set up the prompt.
prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser
parser_output = chain.invoke({"query": df_query})

format_parser_output(parser_output)
```

```output
{'0': {'num_legs': 2,
       'num_specimen_seen': 10,
       'num_wings': 2}}
```

```python
# Here's an example of a random Pandas DataFrame operation limiting the number of rows
df_query = "Retrieve the average of the num_legs column from rows 1 to 3."

# Set up the prompt.
prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser
parser_output = chain.invoke({"query": df_query})

print(parser_output)
```

```output
{'mean': 4.0}
```

```python
# Here's an example of a poorly formatted query
df_query = "Retrieve the mean of the num_fingers column."

# Set up the prompt.
prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser
parser_output = chain.invoke({"query": df_query})
```

```output
---------------------------------------------------------------------------

OutputParserException                     Traceback (most recent call last)

Cell In[23], line 12
      5 prompt = PromptTemplate(
      6     template="Answer the user query.\n{format_instructions}\n{query}\n",
      7     input_variables=["query"],
      8     partial_variables={"format_instructions": parser.get_format_instructions()},
      9 )
     11 chain = prompt | model | parser
---> 12 parser_output = chain.invoke({"query": df_query})

File ~/workplace/langchain/libs/core/langchain_core/runnables/base.py:1616, in RunnableSequence.invoke(self, input, config)
   1614 try:
   1615     for i, step in enumerate(self.steps):
-> 1616         input = step.invoke(
   1617             input,
   1618             # mark each step as a child run
   1619             patch_config(
   1620                 config, callbacks=run_manager.get_child(f"seq:step:{i+1}")
   1621             ),
   1622         )
   1623 # finish the root run
   1624 except BaseException as e:

File ~/workplace/langchain/libs/core/langchain_core/output_parsers/base.py:170, in BaseOutputParser.invoke(self, input, config)
    166 def invoke(
    167     self, input: Union[str, BaseMessage], config: Optional[RunnableConfig] = None
    168 ) -> T:
    169     if isinstance(input, BaseMessage):
--> 170         return self._call_with_config(
    171             lambda inner_input: self.parse_result(
    172                 [ChatGeneration(message=inner_input)]
    173             ),
    174             input,
    175             config,
    176             run_type="parser",
    177         )
    178     else:
    179         return self._call_with_config(
    180             lambda inner_input: self.parse_result([Generation(text=inner_input)]),
    181             input,
    182             config,
    183             run_type="parser",
    184         )

File ~/workplace/langchain/libs/core/langchain_core/runnables/base.py:906, in Runnable._call_with_config(self, func, input, config, run_type, **kwargs)
    899 run_manager = callback_manager.on_chain_start(
    900     dumpd(self),
    901     input,
    902     run_type=run_type,
    903     name=config.get("run_name"),
    904 )
    905 try:
--> 906     output = call_func_with_variable_args(
    907         func, input, config, run_manager, **kwargs
    908     )
    909 except BaseException as e:
    910     run_manager.on_chain_error(e)

File ~/workplace/langchain/libs/core/langchain_core/runnables/config.py:308, in call_func_with_variable_args(func, input, config, run_manager, **kwargs)
    306 if run_manager is not None and accepts_run_manager(func):
    307     kwargs["run_manager"] = run_manager
--> 308 return func(input, **kwargs)

File ~/workplace/langchain/libs/core/langchain_core/output_parsers/base.py:171, in BaseOutputParser.invoke.<locals>.<lambda>(inner_input)
    166 def invoke(
    167     self, input: Union[str, BaseMessage], config: Optional[RunnableConfig] = None
    168 ) -> T:
    169     if isinstance(input, BaseMessage):
    170         return self._call_with_config(
--> 171             lambda inner_input: self.parse_result(
    172                 [ChatGeneration(message=inner_input)]
    173             ),
    174             input,
    175             config,
    176             run_type="parser",
    177         )
    178     else:
    179         return self._call_with_config(
    180             lambda inner_input: self.parse_result([Generation(text=inner_input)]),
    181             input,
    182             config,
    183             run_type="parser",
    184         )

File ~/workplace/langchain/libs/core/langchain_core/output_parsers/base.py:222, in BaseOutputParser.parse_result(self, result, partial)
    209 def parse_result(self, result: List[Generation], *, partial: bool = False) -> T:
    210     """Parse a list of candidate model Generations into a specific format.
    211
    212     The return value is parsed from only the first Generation in the result, which
   (...)
    220         Structured output.
    221     """
--> 222     return self.parse(result[0].text)

File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pandas_dataframe.py:90, in PandasDataFrameOutputParser.parse(self, request)
     88 request_type, request_params = splitted_request
     89 if request_type in {"Invalid column", "Invalid operation"}:
---> 90     raise OutputParserException(
     91         f"{request}. Please check the format instructions."
     92     )
     93 array_exists = re.search(r"(\[.*?\])", request_params)
     94 if array_exists:

OutputParserException: Invalid column: num_fingers. Please check the format instructions.
```

[PandasDataFrameOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.pandas_dataframe.PandasDataFrameOutputParser.html#langchain.output_parsers.pandas_dataframe.PandasDataFrameOutputParser) के लिए एपीआई दस्तावेज़ीकरण देखें।
