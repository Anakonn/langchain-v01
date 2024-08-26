---
translated: true
---

# フォールバック

言語モデルを使う際は、基盤となるAPIからさまざまな問題が発生することがよくあります。レート制限やダウンタイムなどです。そのため、LLMアプリケーションを本番環境に移行する際は、これらの問題に備えることが重要になってきます。そこで、フォールバックという概念を導入しました。

**フォールバック**とは、緊急時に使用できる代替計画のことです。

重要なのは、フォールバックはLLMレベルだけでなく、実行可能なレベル全体に適用できることです。これは、モデルによって必要なプロンプトが異なるためです。OpenAIへのリクエストが失敗した場合、同じプロンプトをAnthropicに送るのではなく、別のプロンプトテンプレートを使って異なるバージョンを送信したいと思うでしょう。

## LLM APIエラーのフォールバック

これは最も一般的なフォールバックの使用例かもしれません。LLM APIへのリクエストは、さまざまな理由で失敗する可能性があります - APIがダウンしている、レート制限に達した、その他さまざまな理由です。そのため、フォールバックを使うことで、これらの問題に対処できます。

重要: デフォルトでは、多くのLLMラッパーはエラーをキャッチして再試行します。フォールバックを使う場合は、それらの機能をオフにしたほうがよいでしょう。そうしないと、最初のラッパーが再試行し続け、失敗しないためです。

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_community.chat_models import ChatAnthropic
from langchain_openai import ChatOpenAI
```

まず、OpenAIからRateLimitErrorが発生した場合の動作をモックアウトしましょう。

```python
from unittest.mock import patch

import httpx
from openai import RateLimitError

request = httpx.Request("GET", "/")
response = httpx.Response(200, request=request)
error = RateLimitError("rate limit", response=response, body="")
```

```python
# Note that we set max_retries = 0 to avoid retrying on RateLimits, etc
openai_llm = ChatOpenAI(max_retries=0)
anthropic_llm = ChatAnthropic()
llm = openai_llm.with_fallbacks([anthropic_llm])
```

```python
# Let's use just the OpenAI LLm first, to show that we run into an error
with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(openai_llm.invoke("Why did the chicken cross the road?"))
    except RateLimitError:
        print("Hit error")
```

```output
Hit error
```

```python
# Now let's try with fallbacks to Anthropic
with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(llm.invoke("Why did the chicken cross the road?"))
    except RateLimitError:
        print("Hit error")
```

```output
content=' I don\'t actually know why the chicken crossed the road, but here are some possible humorous answers:\n\n- To get to the other side!\n\n- It was too chicken to just stand there. \n\n- It wanted a change of scenery.\n\n- It wanted to show the possum it could be done.\n\n- It was on its way to a poultry farmers\' convention.\n\nThe joke plays on the double meaning of "the other side" - literally crossing the road to the other side, or the "other side" meaning the afterlife. So it\'s an anti-joke, with a silly or unexpected pun as the answer.' additional_kwargs={} example=False
```

「フォールバック付きLLM」は、通常のLLMと同様に使用できます。

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're a nice assistant who always includes a compliment in your response",
        ),
        ("human", "Why did the {animal} cross the road"),
    ]
)
chain = prompt | llm
with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(chain.invoke({"animal": "kangaroo"}))
    except RateLimitError:
        print("Hit error")
```

```output
content=" I don't actually know why the kangaroo crossed the road, but I can take a guess! Here are some possible reasons:\n\n- To get to the other side (the classic joke answer!)\n\n- It was trying to find some food or water \n\n- It was trying to find a mate during mating season\n\n- It was fleeing from a predator or perceived threat\n\n- It was disoriented and crossed accidentally \n\n- It was following a herd of other kangaroos who were crossing\n\n- It wanted a change of scenery or environment \n\n- It was trying to reach a new habitat or territory\n\nThe real reason is unknown without more context, but hopefully one of those potential explanations does the joke justice! Let me know if you have any other animal jokes I can try to decipher." additional_kwargs={} example=False
```

## シーケンスのフォールバック

シーケンス自体がシーケンスであるフォールバックを作成することもできます。ここでは、ChatOpenAIとOpenAI(チャットモデルではない)の2つのモデルを使用しています。OpenAIはチャットモデルではないため、おそらく別のプロンプトが必要でしょう。

```python
# First let's create a chain with a ChatModel
# We add in a string output parser here so the outputs between the two are the same type
from langchain_core.output_parsers import StrOutputParser

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're a nice assistant who always includes a compliment in your response",
        ),
        ("human", "Why did the {animal} cross the road"),
    ]
)
# Here we're going to use a bad model name to easily create a chain that will error
chat_model = ChatOpenAI(model="gpt-fake")
bad_chain = chat_prompt | chat_model | StrOutputParser()
```

```python
# Now lets create a chain with the normal OpenAI model
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

prompt_template = """Instructions: You should always include a compliment in your response.

Question: Why did the {animal} cross the road?"""
prompt = PromptTemplate.from_template(prompt_template)
llm = OpenAI()
good_chain = prompt | llm
```

```python
# We can now create a final chain which combines the two
chain = bad_chain.with_fallbacks([good_chain])
chain.invoke({"animal": "turtle"})
```

```output
'\n\nAnswer: The turtle crossed the road to get to the other side, and I have to say he had some impressive determination.'
```

## 長い入力のフォールバック

LLMの大きな制限要因の1つは、コンテキストウィンドウの長さです。通常、プロンプトの長さを数えて追跡できますが、それが難しい/複雑な場合は、コンテキストが長いモデルにフォールバックできます。

```python
short_llm = ChatOpenAI()
long_llm = ChatOpenAI(model="gpt-3.5-turbo-16k")
llm = short_llm.with_fallbacks([long_llm])
```

```python
inputs = "What is the next number: " + ", ".join(["one", "two"] * 3000)
```

```python
try:
    print(short_llm.invoke(inputs))
except Exception as e:
    print(e)
```

```output
This model's maximum context length is 4097 tokens. However, your messages resulted in 12012 tokens. Please reduce the length of the messages.
```

```python
try:
    print(llm.invoke(inputs))
except Exception as e:
    print(e)
```

```output
content='The next number in the sequence is two.' additional_kwargs={} example=False
```

## より良いモデルへのフォールバック

私たちはしばしば、特定の形式(JSONなど)で出力するようモデルに要求します。GPT-3.5のようなモデルはこれをある程度行えますが、時に苦戦します。これは自然とフォールバックにつながります - GPT-3.5(より速く、より安価)で試してみて、解析に失敗した場合はGPT-4を使うことができます。

```python
from langchain.output_parsers import DatetimeOutputParser
```

```python
prompt = ChatPromptTemplate.from_template(
    "what time was {event} (in %Y-%m-%dT%H:%M:%S.%fZ format - only return this value)"
)
```

```python
# In this case we are going to do the fallbacks on the LLM + output parser level
# Because the error will get raised in the OutputParser
openai_35 = ChatOpenAI() | DatetimeOutputParser()
openai_4 = ChatOpenAI(model="gpt-4") | DatetimeOutputParser()
```

```python
only_35 = prompt | openai_35
fallback_4 = prompt | openai_35.with_fallbacks([openai_4])
```

```python
try:
    print(only_35.invoke({"event": "the superbowl in 1994"}))
except Exception as e:
    print(f"Error: {e}")
```

```output
Error: Could not parse datetime string: The Super Bowl in 1994 took place on January 30th at 3:30 PM local time. Converting this to the specified format (%Y-%m-%dT%H:%M:%S.%fZ) results in: 1994-01-30T15:30:00.000Z
```

```python
try:
    print(fallback_4.invoke({"event": "the superbowl in 1994"}))
except Exception as e:
    print(f"Error: {e}")
```

```output
1994-01-30 15:30:00
```
