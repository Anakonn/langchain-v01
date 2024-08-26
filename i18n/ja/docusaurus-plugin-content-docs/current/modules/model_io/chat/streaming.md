---
sidebar_position: 1.5
translated: true
---

# ストリーミング

すべての ChatModels は Runnable インターフェースを実装しており、これにはすべてのメソッド (ainvoke、batch、abatch、stream、astream) のデフォルトの実装が付属しています。これにより、すべての ChatModels に基本的なストリーミングのサポートが提供されます。

ストリーミングのサポートは、基礎となる ChatModel プロバイダーによって返される最終結果の単一の値を返す Iterator (または非同期ストリーミングの場合は AsyncIterator) を返すことをデフォルトとしています。これは明らかにトークンごとのストリーミングを提供するものではありませんが、トークンの反復子を期待するコードが、当社の ChatModel インテグレーションのいずれでも機能するようにします。

トークンごとのストリーミングをサポートするインテグレーションについては、[こちら](/docs/integrations/chat/)をご覧ください。

```python
from langchain_community.chat_models import ChatAnthropic
```

```python
chat = ChatAnthropic(model="claude-2")
for chunk in chat.stream("Write me a song about goldfish on the moon"):
    print(chunk.content, end="", flush=True)
```

```output
 Here's a song I just improvised about goldfish on the moon:

Floating in space, looking for a place
To call their home, all alone
Swimming through stars, these goldfish from Mars
Left their fishbowl behind, a new life to find
On the moon, where the craters loom
Searching for food, maybe some lunar food
Out of their depth, close to death
How they wish, for just one small fish
To join them up here, their future unclear
On the moon, where the Earth looms
Dreaming of home, filled with foam
Their bodies adapt, continuing to last
On the moon, where they learn to swoon
Over cheese that astronauts tease
As they stare back at Earth, the planet of birth
These goldfish out of water, swim on and on
Lunar pioneers, conquering their fears
On the moon, where they happily swoon
```
