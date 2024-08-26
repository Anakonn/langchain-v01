---
translated: true
---

# ストリーミング

すべての `LLM` は `Runnable` インターフェイスを実装しており、すべてのメソッド (ainvoke、batch、abatch、stream、astream) のデフォルトの実装が付属しています。これにより、すべての `LLM` に基本的なストリーミングのサポートが提供されます。

ストリーミングのサポートは、基礎となる `LLM` プロバイダーによって返される最終結果の単一の値を返す Iterator (または非同期ストリーミングの場合は AsyncIterator) を返すことがデフォルトになっています。これは明らかにトークンごとのストリーミングを提供するものではありませんが、トークンの反復子を期待するコードが、私たちの `LLM` インテグレーションのいずれでも機能するようにします。

トークンごとのストリーミングをサポートするインテグレーションについては、[こちら](/docs/integrations/llms/)をご覧ください。

```python
from langchain_openai import OpenAI

llm = OpenAI(model="gpt-3.5-turbo-instruct", temperature=0, max_tokens=512)
for chunk in llm.stream("Write me a song about sparkling water."):
    print(chunk, end="", flush=True)
```

```output


Verse 1:
Bubbles dancing in my glass
Clear and crisp, it's such a blast
Refreshing taste, it's like a dream
Sparkling water, you make me beam

Chorus:
Oh sparkling water, you're my delight
With every sip, you make me feel so right
You're like a party in my mouth
I can't get enough, I'm hooked no doubt

Verse 2:
No sugar, no calories, just pure bliss
You're the perfect drink, I must confess
From lemon to lime, so many flavors to choose
Sparkling water, you never fail to amuse

Chorus:
Oh sparkling water, you're my delight
With every sip, you make me feel so right
You're like a party in my mouth
I can't get enough, I'm hooked no doubt

Bridge:
Some may say you're just plain water
But to me, you're so much more
You bring a sparkle to my day
In every single way

Chorus:
Oh sparkling water, you're my delight
With every sip, you make me feel so right
You're like a party in my mouth
I can't get enough, I'm hooked no doubt

Outro:
So here's to you, my dear sparkling water
You'll always be my go-to drink forever
With your effervescence and refreshing taste
You'll always have a special place.
```
