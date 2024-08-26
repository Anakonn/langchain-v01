---
translated: true
---

# Discord

>[Discord](https://discord.com/)은 VoIP(Voice over Internet Protocol) 및 인스턴트 메시징 소셜 플랫폼입니다. 사용자는 음성 통화, 화상 통화, 텍스트 메시징, 미디어 및 파일을 개인 채팅 또는 "서버"라고 하는 커뮤니티의 일부로 통신할 수 있습니다. 서버는 초대 링크를 통해 액세스할 수 있는 지속적인 채팅 룸과 음성 채널의 집합입니다.

다음 단계에 따라 `Discord` 데이터를 다운로드하세요:

1. **사용자 설정**으로 이동합니다.
2. **개인정보 보호 및 안전**으로 이동합니다.
3. **내 데이터 전체 요청** 섹션으로 이동하여 **데이터 요청** 버튼을 클릭합니다.

데이터를 받는 데 최대 30일이 걸릴 수 있습니다. Discord에 등록된 이메일 주소로 이메일이 발송됩니다. 해당 이메일에는 개인 Discord 데이터를 다운로드할 수 있는 다운로드 버튼이 포함되어 있습니다.

```python
import os

import pandas as pd
```

```python
path = input('Please enter the path to the contents of the Discord "messages" folder: ')
li = []
for f in os.listdir(path):
    expected_csv_path = os.path.join(path, f, "messages.csv")
    csv_exists = os.path.isfile(expected_csv_path)
    if csv_exists:
        df = pd.read_csv(expected_csv_path, index_col=None, header=0)
        li.append(df)

df = pd.concat(li, axis=0, ignore_index=True, sort=False)
```

```python
from langchain_community.document_loaders.discord import DiscordChatLoader
```

```python
loader = DiscordChatLoader(df, user_id_col="ID")
print(loader.load())
```
