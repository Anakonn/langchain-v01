---
translated: true
---

# 부제

>[SubRip 파일 형식](https://en.wikipedia.org/wiki/SubRip#SubRip_file_format)은 `Matroska` 멀티미디어 컨테이너 형식 웹사이트에서 "모든 자막 형식 중 가장 기본적인 것"으로 설명됩니다. `SubRip (SubRip Text)` 파일은 `.srt` 확장자로 명명되며, 빈 줄로 구분된 그룹의 일반 텍스트로 된 형식화된 줄을 포함합니다. 자막은 1부터 순차적으로 번호가 매겨집니다. 사용되는 타임코드 형식은 시:분:초,밀리초이며, 시간 단위는 두 자리 0으로 채워지고 소수점은 세 자리 0으로 채워집니다(00:00:00,000). 소수점 구분자는 콤마이며, 이는 프로그램이 프랑스에서 작성되었기 때문입니다.

자막(`.srt`) 파일에서 데이터 로드하는 방법

[여기에서 예제 .srt 파일을 다운로드하십시오](https://www.opensubtitles.org/en/subtitles/5575150/star-wars-the-clone-wars-crisis-at-the-heart-en).

```python
%pip install --upgrade --quiet  pysrt
```

```python
from langchain_community.document_loaders import SRTLoader
```

```python
loader = SRTLoader(
    "example_data/Star_Wars_The_Clone_Wars_S06E07_Crisis_at_the_Heart.srt"
)
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:100]
```

```output
'<i>Corruption discovered\nat the core of the Banking Clan!</i> <i>Reunited, Rush Clovis\nand Senator A'
```
