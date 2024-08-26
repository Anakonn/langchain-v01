---
translated: true
---

# 오픈 문서 형식 (ODT)

>오픈 문서 형식 (Open Document Format for Office Applications, ODF)은 `OpenDocument`로도 알려진 오픈 파일 형식으로, 워드 프로세싱 문서, 스프레드시트, 프레젠테이션 및 그래픽에 사용되며 ZIP 압축 XML 파일을 사용합니다. 이는 사무 애플리케이션을 위한 오픈 XML 기반 파일 형식 사양을 제공하는 것을 목표로 개발되었습니다.

>이 표준은 OASIS (Organization for the Advancement of Structured Information Standards) 컨소시엄의 기술 위원회에서 개발 및 유지 관리됩니다. 이는 `OpenOffice.org`와 `LibreOffice`의 기본 형식인 Sun Microsystems의 OpenOffice.org XML 사양을 기반으로 합니다. 이는 원래 `StarOffice`를 위해 "사무 문서를 위한 오픈 표준을 제공하기 위해" 개발되었습니다.

`UnstructuredODTLoader`는 `Open Office ODT` 파일을 로드하는 데 사용됩니다.

```python
from langchain_community.document_loaders import UnstructuredODTLoader
```

```python
loader = UnstructuredODTLoader("example_data/fake.odt", mode="elements")
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.odt', 'filename': 'example_data/fake.odt', 'category': 'Title'})
```
