---
translated: true
---

# Facebook 채팅

>[Messenger](https://en.wikipedia.org/wiki/Messenger_(software))는 `Meta Platforms`에서 개발한 미국 독점 인스턴트 메신저 앱 및 플랫폼입니다. 2008년 `Facebook Chat`으로 처음 개발되었으며, 2010년 회사가 메신저 서비스를 개선했습니다.

이 노트북에서는 [Facebook Chats](https://www.facebook.com/business/help/1646890868956360)에서 데이터를 로드하여 LangChain에 입력할 수 있는 형식으로 변환하는 방법을 다룹니다.

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
