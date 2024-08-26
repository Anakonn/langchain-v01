---
translated: true
---

# 에어테이블

>[에어테이블](https://en.wikipedia.org/wiki/Airtable)은 클라우드 협업 서비스입니다.
`Airtable`은 데이터베이스의 기능을 스프레드시트에 적용한 스프레드시트-데이터베이스 하이브리드입니다.
>에어테이블 테이블의 필드는 스프레드시트의 셀과 유사하지만 '체크박스', '전화번호', '드롭다운 목록' 등의 유형을 가지며 이미지와 같은 파일 첨부를 참조할 수 있습니다.

>사용자는 데이터베이스를 만들고, 열 유형을 설정하고, 레코드를 추가하고, 테이블을 서로 연결하고, 협업하고, 레코드를 정렬하고 외부 웹사이트에 뷰를 게시할 수 있습니다.

## 설치 및 설정

```bash
pip install pyairtable
```

* [API 키](https://support.airtable.com/docs/creating-and-using-api-keys-and-access-tokens)를 얻으세요.
* [베이스 ID](https://airtable.com/developers/web/api/introduction)를 얻으세요.
* [테이블 URL에서 테이블 ID](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/#:~:text=Both%20the%20Airtable%20Base%20ID,URL%20that%20begins%20with%20tbl)를 얻으세요.

## 문서 로더

```python
<!--IMPORTS:[{"imported": "AirtableLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.airtable.AirtableLoader.html", "title": "Airtable"}]-->
from langchain_community.document_loaders import AirtableLoader
```

[예시](/docs/integrations/document_loaders/airtable)를 참고하세요.
