---
sidebar_class_name: hidden
translated: true
---

# SQL

가장 흔히 Q&A 시스템을 구축할 수 있는 데이터베이스 유형 중 하나는 SQL 데이터베이스입니다. LangChain은 SQLAlchemy에서 지원하는 모든 SQL 방언(MySQL, PostgreSQL, Oracle SQL, Databricks, SQLite 등)과 호환되는 여러 내장 체인 및 에이전트를 제공합니다. 이를 통해 다음과 같은 사용 사례를 구현할 수 있습니다:

* 자연어 질문을 기반으로 실행할 쿼리 생성,
* 데이터베이스 데이터를 기반으로 질문에 답변할 수 있는 챗봇 생성,
* 사용자가 분석하고자 하는 인사이트를 기반으로 맞춤 대시보드 생성,

등 다양한 기능을 구현할 수 있습니다.

## ⚠️ 보안 주의 사항 ⚠️

SQL 데이터베이스의 Q&A 시스템을 구축하려면 모델이 생성한 SQL 쿼리를 실행해야 합니다. 이는 본질적으로 위험이 따릅니다. 체인/에이전트의 필요에 따라 항상 데이터베이스 연결 권한을 가능한 한 좁게 설정해야 합니다. 이렇게 하면 모델 기반 시스템 구축의 위험을 완화할 수 있지만, 완전히 제거할 수는 없습니다. 일반적인 보안 모범 사례에 대한 자세한 내용은 [여기](/docs/security)를 참조하십시오.

![sql_usecase.png](../../../../../../static/img/sql_usecase.png)

## 빠른 시작

**[빠른 시작](/docs/use_cases/sql/quickstart)** 페이지로 이동하여 시작하십시오.

## 고급

기본 사항을 익힌 후에는 다음 고급 가이드를 참조하십시오:

* [에이전트](/docs/use_cases/sql/agents): SQL DB와 상호 작용할 수 있는 에이전트 구축.
* [프롬프트 전략](/docs/use_cases/sql/prompting): SQL 쿼리 생성을 개선하기 위한 전략.
* [쿼리 검증](/docs/use_cases/sql/query_checking): SQL 쿼리 검증 방법.
* [대규모 데이터베이스](/docs/use_cases/sql/large_db): 다수의 테이블과 높은 카디널리티 열이 있는 데이터베이스와 상호 작용하는 방법.