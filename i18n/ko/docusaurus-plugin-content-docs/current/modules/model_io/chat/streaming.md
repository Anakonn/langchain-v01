---
sidebar_position: 1.5
translated: true
---

# 스트리밍

모든 ChatModels은 Runnable 인터페이스를 구현하며, 이에는 ainvoke, batch, abatch, stream, astream 등의 기본 구현 메서드가 포함됩니다. 이를 통해 모든 ChatModels은 기본적인 스트리밍 지원을 제공합니다.

스트리밍 지원은 기본적으로 단일 값의 반복기(또는 비동기 스트리밍의 경우 AsyncIterator)를 반환하며, 이는 기본 ChatModel 공급자가 반환하는 최종 결과입니다. 이는 토큰 단위의 스트리밍을 제공하지 않지만, 토큰 반복기를 기대하는 코드가 모든 ChatModel 통합에서 작동할 수 있도록 합니다.

토큰 단위 스트리밍을 지원하는 [통합 목록](/docs/integrations/chat/)을 확인하세요.

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
