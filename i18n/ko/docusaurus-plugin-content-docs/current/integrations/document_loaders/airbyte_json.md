---
translated: true
---

# Airbyte JSON (더 이상 사용되지 않음)

참고: `AirbyteJSONLoader`는 더 이상 사용되지 않습니다. 대신 [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte)를 사용하세요.

> [Airbyte](https://github.com/airbytehq/airbyte)는 데이터 웨어하우스와 데이터베이스로부터 API, 데이터베이스 및 파일에서 ELT 파이프라인을 위한 데이터 통합 플랫폼입니다. 데이터 웨어하우스 및 데이터베이스에 대한 ELT 커넥터가 가장 많이 포함되어 있습니다.

이 문서는 Airbyte에서 소스를 로컬 JSON 파일로 로드한 후 이를 문서로 읽어들이는 방법을 다룹니다.

필수 조건:
Docker Desktop이 설치되어 있어야 합니다.

단계:

1. GitHub에서 Airbyte를 클론합니다 - `git clone https://github.com/airbytehq/airbyte.git`

2. Airbyte 디렉토리로 이동합니다 - `cd airbyte`

3. Airbyte를 시작합니다 - `docker compose up`

4. 브라우저에서 http://localhost:8000 에 접속합니다. 사용자 이름과 비밀번호를 묻는 화면이 나타납니다. 기본 사용자 이름은 `airbyte`이고 비밀번호는 `password`입니다.

5. 원하는 소스를 설정합니다.

6. 로컬 JSON을 대상으로 설정하고, 지정된 대상 경로를 `/json_data`로 설정합니다. 수동 동기화를 설정합니다.

7. 연결을 실행합니다.

8. 생성된 파일을 확인하려면: `file:///tmp/airbyte_local`로 이동합니다.

9. 데이터를 찾아 경로를 복사합니다. 해당 경로는 아래 파일 변수에 저장되어야 합니다. 경로는 `/tmp/airbyte_local`로 시작해야 합니다.

```python
from langchain_community.document_loaders import AirbyteJSONLoader
```

```python
!ls /tmp/airbyte_local/json_data/
```

```output
_airbyte_raw_pokemon.jsonl
```

```python
loader = AirbyteJSONLoader("/tmp/airbyte_local/json_data/_airbyte_raw_pokemon.jsonl")
```

```python
data = loader.load()
```

```python
print(data[0].page_content[:500])
```

```output
abilities:
ability:
name: blaze
url: https://pokeapi.co/api/v2/ability/66/

is_hidden: False
slot: 1


ability:
name: solar-power
url: https://pokeapi.co/api/v2/ability/94/

is_hidden: True
slot: 3

base_experience: 267
forms:
name: charizard
url: https://pokeapi.co/api/v2/pokemon-form/6/

game_indices:
game_index: 180
version:
name: red
url: https://pokeapi.co/api/v2/version/1/



game_index: 180
version:
name: blue
url: https://pokeapi.co/api/v2/version/2/



game_index: 180
version:
n
```

