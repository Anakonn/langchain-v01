---
translated: true
---

# 문서 탐구: 문서 조사

벡터 저장소 지식 베이스에 사용되는 문서는 일반적으로 서술적이거나 대화형 형식으로 저장됩니다. 그러나 대부분의 사용자 질의는 질문 형식입니다. 문서를 벡터화하기 전에 문서를 **질문 답변 형식으로 변환**하면 관련 문서를 더 잘 검색할 수 있고 관련 없는 문서를 더 적게 검색할 수 있습니다.

[Doctran](https://github.com/psychic-api/doctran) 라이브러리를 사용하면 이를 수행할 수 있습니다. 이 라이브러리는 OpenAI의 함수 호출 기능을 사용하여 문서를 "조사"합니다.

다양한 질의에 대한 원본 문서와 조사된 문서의 벡터 유사도 점수에 대한 벤치마크는 [이 노트북](https://github.com/psychic-api/doctran/blob/main/benchmark.md)을 참조하세요.

```python
%pip install --upgrade --quiet  doctran
```

```python
import json

from langchain_community.document_transformers import DoctranQATransformer
from langchain_core.documents import Document
```

```python
from dotenv import load_dotenv

load_dotenv()
```

```output
True
```

## 입력

이것은 우리가 조사할 문서입니다.

```python
sample_text = """[Generated with ChatGPT]

Confidential Document - For Internal Use Only

Date: July 1, 2023

Subject: Updates and Discussions on Various Topics

Dear Team,

I hope this email finds you well. In this document, I would like to provide you with some important updates and discuss various topics that require our attention. Please treat the information contained herein as highly confidential.

Security and Privacy Measures
As part of our ongoing commitment to ensure the security and privacy of our customers' data, we have implemented robust measures across all our systems. We would like to commend John Doe (email: john.doe@example.com) from the IT department for his diligent work in enhancing our network security. Moving forward, we kindly remind everyone to strictly adhere to our data protection policies and guidelines. Additionally, if you come across any potential security risks or incidents, please report them immediately to our dedicated team at security@example.com.

HR Updates and Employee Benefits
Recently, we welcomed several new team members who have made significant contributions to their respective departments. I would like to recognize Jane Smith (SSN: 049-45-5928) for her outstanding performance in customer service. Jane has consistently received positive feedback from our clients. Furthermore, please remember that the open enrollment period for our employee benefits program is fast approaching. Should you have any questions or require assistance, please contact our HR representative, Michael Johnson (phone: 418-492-3850, email: michael.johnson@example.com).

Marketing Initiatives and Campaigns
Our marketing team has been actively working on developing new strategies to increase brand awareness and drive customer engagement. We would like to thank Sarah Thompson (phone: 415-555-1234) for her exceptional efforts in managing our social media platforms. Sarah has successfully increased our follower base by 20% in the past month alone. Moreover, please mark your calendars for the upcoming product launch event on July 15th. We encourage all team members to attend and support this exciting milestone for our company.

Research and Development Projects
In our pursuit of innovation, our research and development department has been working tirelessly on various projects. I would like to acknowledge the exceptional work of David Rodriguez (email: david.rodriguez@example.com) in his role as project lead. David's contributions to the development of our cutting-edge technology have been instrumental. Furthermore, we would like to remind everyone to share their ideas and suggestions for potential new projects during our monthly R&D brainstorming session, scheduled for July 10th.

Please treat the information in this document with utmost confidentiality and ensure that it is not shared with unauthorized individuals. If you have any questions or concerns regarding the topics discussed, please do not hesitate to reach out to me directly.

Thank you for your attention, and let's continue to work together to achieve our goals.

Best regards,

Jason Fan
Cofounder & CEO
Psychic
jason@psychic.dev
"""
print(sample_text)
```

```output
[Generated with ChatGPT]

Confidential Document - For Internal Use Only

Date: July 1, 2023

Subject: Updates and Discussions on Various Topics

Dear Team,

I hope this email finds you well. In this document, I would like to provide you with some important updates and discuss various topics that require our attention. Please treat the information contained herein as highly confidential.

Security and Privacy Measures
As part of our ongoing commitment to ensure the security and privacy of our customers' data, we have implemented robust measures across all our systems. We would like to commend John Doe (email: john.doe@example.com) from the IT department for his diligent work in enhancing our network security. Moving forward, we kindly remind everyone to strictly adhere to our data protection policies and guidelines. Additionally, if you come across any potential security risks or incidents, please report them immediately to our dedicated team at security@example.com.

HR Updates and Employee Benefits
Recently, we welcomed several new team members who have made significant contributions to their respective departments. I would like to recognize Jane Smith (SSN: 049-45-5928) for her outstanding performance in customer service. Jane has consistently received positive feedback from our clients. Furthermore, please remember that the open enrollment period for our employee benefits program is fast approaching. Should you have any questions or require assistance, please contact our HR representative, Michael Johnson (phone: 418-492-3850, email: michael.johnson@example.com).

Marketing Initiatives and Campaigns
Our marketing team has been actively working on developing new strategies to increase brand awareness and drive customer engagement. We would like to thank Sarah Thompson (phone: 415-555-1234) for her exceptional efforts in managing our social media platforms. Sarah has successfully increased our follower base by 20% in the past month alone. Moreover, please mark your calendars for the upcoming product launch event on July 15th. We encourage all team members to attend and support this exciting milestone for our company.

Research and Development Projects
In our pursuit of innovation, our research and development department has been working tirelessly on various projects. I would like to acknowledge the exceptional work of David Rodriguez (email: david.rodriguez@example.com) in his role as project lead. David's contributions to the development of our cutting-edge technology have been instrumental. Furthermore, we would like to remind everyone to share their ideas and suggestions for potential new projects during our monthly R&D brainstorming session, scheduled for July 10th.

Please treat the information in this document with utmost confidentiality and ensure that it is not shared with unauthorized individuals. If you have any questions or concerns regarding the topics discussed, please do not hesitate to reach out to me directly.

Thank you for your attention, and let's continue to work together to achieve our goals.

Best regards,

Jason Fan
Cofounder & CEO
Psychic
jason@psychic.dev
```

```python
documents = [Document(page_content=sample_text)]
qa_transformer = DoctranQATransformer()
transformed_document = qa_transformer.transform_documents(documents)
```

## 출력

문서를 조사한 후에는 메타데이터에 질문과 답변이 포함된 새로운 문서가 반환됩니다.

```python
transformed_document = qa_transformer.transform_documents(documents)
print(json.dumps(transformed_document[0].metadata, indent=2))
```

```output
{
  "questions_and_answers": [
    {
      "question": "What is the purpose of this document?",
      "answer": "The purpose of this document is to provide important updates and discuss various topics that require the team's attention."
    },
    {
      "question": "What should be done if someone comes across potential security risks or incidents?",
      "answer": "If someone comes across potential security risks or incidents, they should report them immediately to the dedicated team at security@example.com."
    },
    {
      "question": "Who is commended for enhancing network security?",
      "answer": "John Doe from the IT department is commended for enhancing network security."
    },
    {
      "question": "Who should be contacted for assistance with employee benefits?",
      "answer": "For assistance with employee benefits, HR representative Michael Johnson should be contacted. His phone number is 418-492-3850, and his email is michael.johnson@example.com."
    },
    {
      "question": "Who has made significant contributions to their respective departments?",
      "answer": "Several new team members have made significant contributions to their respective departments."
    },
    {
      "question": "Who is recognized for outstanding performance in customer service?",
      "answer": "Jane Smith is recognized for outstanding performance in customer service."
    },
    {
      "question": "Who has successfully increased the follower base on social media?",
      "answer": "Sarah Thompson has successfully increased the follower base on social media."
    },
    {
      "question": "When is the upcoming product launch event?",
      "answer": "The upcoming product launch event is on July 15th."
    },
    {
      "question": "Who is acknowledged for their exceptional work as project lead?",
      "answer": "David Rodriguez is acknowledged for his exceptional work as project lead."
    },
    {
      "question": "When is the monthly R&D brainstorming session scheduled?",
      "answer": "The monthly R&D brainstorming session is scheduled for July 10th."
    }
  ]
}
```
