---
translated: true
---

# Blackboard

>[Blackboard Learn](https://en.wikipedia.org/wiki/Blackboard_Learn)(이전에는 Blackboard Learning Management System으로 알려짐)은 Blackboard Inc.에서 개발한 웹 기반 가상 학습 환경 및 학습 관리 시스템입니다. 이 소프트웨어는 코스 관리, 사용자 정의 가능한 개방형 아키텍처, 학생 정보 시스템 및 인증 프로토콜과의 통합을 지원하는 확장 가능한 설계 기능을 제공합니다. 이는 로컬 서버에 설치되거나 `Blackboard ASP Solutions`에서 호스팅되거나 Amazon Web Services에서 호스팅되는 Software as a Service로 제공될 수 있습니다. 주요 목적은 전통적으로 대면으로 제공되는 과정에 온라인 요소를 추가하고 대면 회의가 거의 없는 완전히 온라인 과정을 개발하는 것으로 알려져 있습니다.

이 문서는 [Blackboard Learn](https://www.anthology.com/products/teaching-and-learning/learning-effectiveness/blackboard-learn) 인스턴스에서 데이터를 로드하는 방법을 다룹니다.

이 로더는 모든 `Blackboard` 코스와 호환되지 않습니다. 새로운 `Blackboard` 인터페이스를 사용하는 코스와만 호환됩니다.

이 로더를 사용하려면 BbRouter 쿠키가 있어야 합니다. 코스에 로그인한 후 브라우저의 개발자 도구에서 BbRouter 쿠키의 값을 복사하여 얻을 수 있습니다.


```python
from langchain_community.document_loaders import BlackboardLoader

loader = BlackboardLoader(
    blackboard_course_url="https://blackboard.example.com/webapps/blackboard/execute/announcement?method=search&context=course_entry&course_id=_123456_1",
    bbrouter="expires:12345...",
    load_all_recursively=True,
)
documents = loader.load()
```

