---
sidebar_position: 5
translated: true
---

# 構成

LangChainは、プロンプトの異なる部分を組み合わせるためのユーザーフレンドリーなインターフェイスを提供しています。文字列プロンプトやチャットプロンプトのいずれかを使用して、このように構築することができます。このようにプロンプトを構築することで、コンポーネントを簡単に再利用できます。

## 文字列プロンプトの構成

文字列プロンプトを使用する場合、各テンプレートが連結されます。プロンプトそのものや文字列(リストの最初の要素がプロンプトである必要があります)を使用することができます。

```python
from langchain_core.prompts import PromptTemplate
```

```python
prompt = (
    PromptTemplate.from_template("Tell me a joke about {topic}")
    + ", make it funny"
    + "\n\nand in {language}"
)
```

```python
prompt
```

```output
PromptTemplate(input_variables=['language', 'topic'], template='Tell me a joke about {topic}, make it funny\n\nand in {language}')
```

```python
prompt.format(topic="sports", language="spanish")
```

```output
'Tell me a joke about sports, make it funny\n\nand in spanish'
```

LLMChainでも同様に使用することができます。

```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI()
```

```python
chain = LLMChain(llm=model, prompt=prompt)
```

```python
chain.run(topic="sports", language="spanish")
```

```output
'¿Por qué el futbolista llevaba un paraguas al partido?\n\nPorque pronosticaban lluvia de goles.'
```

## チャットプロンプトの構成

チャットプロンプトは、メッセージのリストで構成されています。開発者の体験を向上させるために、これらのプロンプトを作成する便利な方法を追加しました。このパイプラインでは、新しい要素が最終的なプロンプトの新しいメッセージになります。

```python
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

まず、システムメッセージを持つベースのChatPromptTemplateを初期化しましょう。システムから始める必要はありませんが、良い習慣です。

```python
prompt = SystemMessage(content="You are a nice pirate")
```

他のメッセージやメッセージテンプレートを組み合わせてパイプラインを簡単に作成できます。
変数がない場合は`Message`を、変数がある場合は`MessageTemplate`を使用します。文字列を使うこともできます(注意: これは自動的にHumanMessagePromptTemplateとして推論されます)。

```python
new_prompt = (
    prompt + HumanMessage(content="hi") + AIMessage(content="what?") + "{input}"
)
```

内部的には、これはChatPromptTemplateクラスのインスタンスを作成しているので、前と同じように使用できます。

```python
new_prompt.format_messages(input="i said hi")
```

```output
[SystemMessage(content='You are a nice pirate', additional_kwargs={}),
 HumanMessage(content='hi', additional_kwargs={}, example=False),
 AIMessage(content='what?', additional_kwargs={}, example=False),
 HumanMessage(content='i said hi', additional_kwargs={}, example=False)]
```

LLMChainでも同様に使用することができます。

```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI()
```

```python
chain = LLMChain(llm=model, prompt=new_prompt)
```

```python
chain.run("i said hi")
```

```output
'Oh, hello! How can I assist you today?'
```

## PipelinePromptの使用

LangChainには[PipelinePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.pipeline.PipelinePromptTemplate.html)という抽象化が含まれており、プロンプトの一部を再利用したい場合に便利です。PipelinePromptには主に2つの部分があります:

- 最終プロンプト: 返される最終的なプロンプト
- パイプラインプロンプト: 文字列の名前とプロンプトテンプレートのタプルのリスト。各プロンプトテンプレートはフォーマットされ、同じ名前の変数としてその後のプロンプトテンプレートに渡されます。

```python
from langchain_core.prompts.pipeline import PipelinePromptTemplate
from langchain_core.prompts.prompt import PromptTemplate
```

```python
full_template = """{introduction}

{example}

{start}"""
full_prompt = PromptTemplate.from_template(full_template)
```

```python
introduction_template = """You are impersonating {person}."""
introduction_prompt = PromptTemplate.from_template(introduction_template)
```

```python
example_template = """Here's an example of an interaction:

Q: {example_q}
A: {example_a}"""
example_prompt = PromptTemplate.from_template(example_template)
```

```python
start_template = """Now, do this for real!

Q: {input}
A:"""
start_prompt = PromptTemplate.from_template(start_template)
```

```python
input_prompts = [
    ("introduction", introduction_prompt),
    ("example", example_prompt),
    ("start", start_prompt),
]
pipeline_prompt = PipelinePromptTemplate(
    final_prompt=full_prompt, pipeline_prompts=input_prompts
)
```

```python
pipeline_prompt.input_variables
```

```output
['example_q', 'person', 'input', 'example_a']
```

```python
print(
    pipeline_prompt.format(
        person="Elon Musk",
        example_q="What's your favorite car?",
        example_a="Tesla",
        input="What's your favorite social media site?",
    )
)
```

```output
You are impersonating Elon Musk.

Here's an example of an interaction:

Q: What's your favorite car?
A: Tesla

Now, do this for real!

Q: What's your favorite social media site?
A:
```
