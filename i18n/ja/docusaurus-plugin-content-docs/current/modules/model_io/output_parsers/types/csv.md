---
translated: true
---

# CSV パーサー

このアウトプットパーサーは、コンマ区切りのアイテムのリストを返したい場合に使用できます。

```python
from langchain.output_parsers import CommaSeparatedListOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

output_parser = CommaSeparatedListOutputParser()

format_instructions = output_parser.get_format_instructions()
prompt = PromptTemplate(
    template="List five {subject}.\n{format_instructions}",
    input_variables=["subject"],
    partial_variables={"format_instructions": format_instructions},
)

model = ChatOpenAI(temperature=0)

chain = prompt | model | output_parser
```

```python
chain.invoke({"subject": "ice cream flavors"})
```

```output
['Vanilla',
 'Chocolate',
 'Strawberry',
 'Mint Chocolate Chip',
 'Cookies and Cream']
```

```python
for s in chain.stream({"subject": "ice cream flavors"}):
    print(s)
```

```output
['Vanilla']
['Chocolate']
['Strawberry']
['Mint Chocolate Chip']
['Cookies and Cream']
```

[CommaSeparatedListOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.list.CommaSeparatedListOutputParser.html#langchain_core.output_parsers.list.CommaSeparatedListOutputParser) の API ドキュメントを確認してください。
