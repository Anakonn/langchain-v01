---
translated: true
---

# Facebook チャット

>[Messenger](https://en.wikipedia.org/wiki/Messenger_(software)) は `Meta Platforms` が開発した米国の独自のインスタントメッセージングアプリとプラットフォームです。 2008年に `Facebook Chat` として開発され、2010年にメッセージングサービスを刷新しました。

このノートブックでは、[Facebook チャット](https://www.facebook.com/business/help/1646890868956360)からデータをロードし、LangChainで取り込めるフォーマットにする方法を説明します。

```python
# pip install pandas
```

```python
from langchain_community.document_loaders import FacebookChatLoader
```

```python
loader = FacebookChatLoader("example_data/facebook_chat.json")
```

```python
loader.load()
```

```output
[Document(page_content='User 2 on 2023-02-05 03:46:11: Bye!\n\nUser 1 on 2023-02-05 03:43:55: Oh no worries! Bye\n\nUser 2 on 2023-02-05 03:24:37: No Im sorry it was my mistake, the blue one is not for sale\n\nUser 1 on 2023-02-05 03:05:40: I thought you were selling the blue one!\n\nUser 1 on 2023-02-05 03:05:09: Im not interested in this bag. Im interested in the blue one!\n\nUser 2 on 2023-02-05 03:04:28: Here is $129\n\nUser 2 on 2023-02-05 03:04:05: Online is at least $100\n\nUser 1 on 2023-02-05 02:59:59: How much do you want?\n\nUser 2 on 2023-02-04 22:17:56: Goodmorning! $50 is too low.\n\nUser 1 on 2023-02-04 14:17:02: Hi! Im interested in your bag. Im offering $50. Let me know if you are interested. Thanks!\n\n', metadata={'source': 'example_data/facebook_chat.json'})]
```
