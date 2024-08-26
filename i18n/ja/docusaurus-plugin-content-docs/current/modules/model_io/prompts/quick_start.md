---
sidebar_position: 0
title: クイックリファレンス
translated: true
---

# クイックリファレンス

プロンプトテンプレートは、言語モデルのプロンプトを生成するための事前定義されたレシピです。

テンプレートには、指示、few-shot例、特定のタスクに適したコンテキストと質問が含まれる可能性があります。

LangChainは、プロンプトテンプレートの作成と使用のためのツールを提供します。

LangChainは、モデル非依存のテンプレートを作成することを目指しており、これにより既存のテンプレートを異なる言語モデルで再利用しやすくなります。

通常、言語モデルはプロンプトを文字列またはチャットメッセージのリストで受け取ります。

## `PromptTemplate`

`PromptTemplate`を使用して、文字列プロンプトのテンプレートを作成します。

デフォルトでは、`PromptTemplate`は[Pythonのstr.format](https://docs.python.org/3/library/stdtypes.html#str.format)構文をテンプレートに使用します。

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template(
    "Tell me a {adjective} joke about {content}."
)
prompt_template.format(adjective="funny", content="chickens")
```

```output
'Tell me a funny joke about chickens.'
```

テンプレートは、変数がない場合も含め、任意の数の変数をサポートします。

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template("Tell me a joke")
prompt_template.format()
```

```output
'Tell me a joke'
```

ユーザーは、プロンプトを任意の方法でフォーマットするカスタムプロンプトテンプレートを作成できます。
詳細については、[プロンプトテンプレートの構成](/docs/modules/model_io/prompts/composition/)を参照してください。

## `ChatPromptTemplate`

[チャットモデル](/docs/modules/model_io/chat)のプロンプトは、[チャットメッセージ](/docs/modules/model_io/chat/message_types/)のリストです。

各チャットメッセージには、コンテンツと追加のパラメーター「role」が関連付けられています。
たとえば、OpenAI [Chat Completions API](https://platform.openai.com/docs/guides/chat/introduction)では、チャットメッセージをAIアシスタント、ヒューマン、またはシステムの役割に関連付けることができます。

チャットプロンプトテンプレートは次のように作成します:

```python
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful AI bot. Your name is {name}."),
        ("human", "Hello, how are you doing?"),
        ("ai", "I'm doing well, thanks!"),
        ("human", "{user_input}"),
    ]
)

messages = chat_template.format_messages(name="Bob", user_input="What is your name?")
```

これらのフォーマットされたメッセージをLangChainの`ChatOpenAI`チャットモデルクラスにパイプすることは、OpenAIクライアントを直接使用するのとほぼ同等です:

```python
%pip install openai
```

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful AI bot. Your name is Bob."},
        {"role": "user", "content": "Hello, how are you doing?"},
        {"role": "assistant", "content": "I'm doing well, thanks!"},
        {"role": "user", "content": "What is your name?"},
    ],
)
```

`ChatPromptTemplate.from_messages`静的メソッドは、さまざまなメッセージ表現を受け入れ、チャットモデルに正確にユーザーが望むメッセージを入力する便利な方法です。

たとえば、上記で使用した(type, content)の2タプル表現に加えて、`MessagePromptTemplate`または`BaseMessage`のインスタンスを渡すこともできます。

```python
from langchain_core.messages import SystemMessage
from langchain_core.prompts import HumanMessagePromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=(
                "You are a helpful assistant that re-writes the user's text to "
                "sound more upbeat."
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)
messages = chat_template.format_messages(text="I don't like eating tasty things")
print(messages)
```

```output
[SystemMessage(content="You are a helpful assistant that re-writes the user's text to sound more upbeat."), HumanMessage(content="I don't like eating tasty things")]
```

これにより、チャットプロンプトの構築方法に柔軟性が得られます。

## メッセージプロンプト

LangChainは、さまざまな種類の`MessagePromptTemplate`を提供しています。最も一般的に使用されるのは、AIメッセージ、システムメッセージ、ヒューマンメッセージをそれぞれ作成する`AIMessagePromptTemplate`、`SystemMessagePromptTemplate`、`HumanMessagePromptTemplate`です。[メッセージの種類についてはこちらをご覧ください](/docs/modules/model_io/chat/message_types)。

チャットモデルが任意の役割を持つチャットメッセージを受け入れる場合は、ユーザーが役割名を指定できる`ChatMessagePromptTemplate`を使用できます。

```python
from langchain_core.prompts import ChatMessagePromptTemplate

prompt = "May the {subject} be with you"

chat_message_prompt = ChatMessagePromptTemplate.from_template(
    role="Jedi", template=prompt
)
chat_message_prompt.format(subject="force")
```

```output
ChatMessage(content='May the force be with you', role='Jedi')
```

## `MessagesPlaceholder`

LangChainは、`MessagesPlaceholder`も提供しており、これを使用するとフォーマット時に表示するメッセージを完全に制御できます。これは、メッセージプロンプトテンプレートに使用する役割が不明確な場合や、フォーマット時にメッセージのリストを挿入したい場合に便利です。

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)

human_prompt = "Summarize our conversation so far in {word_count} words."
human_message_template = HumanMessagePromptTemplate.from_template(human_prompt)

chat_prompt = ChatPromptTemplate.from_messages(
    [MessagesPlaceholder(variable_name="conversation"), human_message_template]
)
```

```python
from langchain_core.messages import AIMessage, HumanMessage

human_message = HumanMessage(content="What is the best way to learn programming?")
ai_message = AIMessage(
    content="""\
1. Choose a programming language: Decide on a programming language that you want to learn.

2. Start with the basics: Familiarize yourself with the basic programming concepts such as variables, data types and control structures.

3. Practice, practice, practice: The best way to learn programming is through hands-on experience\
"""
)

chat_prompt.format_prompt(
    conversation=[human_message, ai_message], word_count="10"
).to_messages()
```

```output
[HumanMessage(content='What is the best way to learn programming?'),
 AIMessage(content='1. Choose a programming language: Decide on a programming language that you want to learn.\n\n2. Start with the basics: Familiarize yourself with the basic programming concepts such as variables, data types and control structures.\n\n3. Practice, practice, practice: The best way to learn programming is through hands-on experience'),
 HumanMessage(content='Summarize our conversation so far in 10 words.')]
```

メッセージプロンプトテンプレートの完全なリストは次のとおりです:

* [AIMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.AIMessagePromptTemplate.html)、AIアシスタントメッセージ用
* [SystemMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.SystemMessagePromptTemplate.html)、システムメッセージ用
* [HumanMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html)、ユーザーメッセージ用
* [ChatMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatMessagePromptTemplate.html)、任意の役割のメッセージ用
* [MessagesPlaceholder](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html)、メッセージのリストに対応

## LCEL

`PromptTemplate`と`ChatPromptTemplate`は、[LangChain式言語(LCEL)](/docs/expression_language/)の基本的な構成要素である[Runnable interface](/docs/expression_language/interface)を実装しています。つまり、`invoke`、`ainvoke`、`stream`、`astream`、`batch`、`abatch`、`astream_log`呼び出しをサポートしています。

`PromptTemplate`は辞書(プロンプト変数)を受け取り、`StringPromptValue`を返します。`ChatPromptTemplate`は辞書を受け取り、`ChatPromptValue`を返します。

```python
prompt_template = PromptTemplate.from_template(
    "Tell me a {adjective} joke about {content}."
)

prompt_val = prompt_template.invoke({"adjective": "funny", "content": "chickens"})
prompt_val
```

```output
StringPromptValue(text='Tell me a funny joke about chickens.')
```

```python
prompt_val.to_string()
```

```output
'Tell me a funny joke about chickens.'
```

```python
prompt_val.to_messages()
```

```output
[HumanMessage(content='Tell me a funny joke about chickens.')]
```

```python
chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=(
                "You are a helpful assistant that re-writes the user's text to "
                "sound more upbeat."
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)

chat_val = chat_template.invoke({"text": "i dont like eating tasty things."})
```

```python
chat_val.to_messages()
```

```output
[SystemMessage(content="You are a helpful assistant that re-writes the user's text to sound more upbeat."),
 HumanMessage(content='i dont like eating tasty things.')]
```

```python
chat_val.to_string()
```

```output
"System: You are a helpful assistant that re-writes the user's text to sound more upbeat.\nHuman: i dont like eating tasty things."
```
