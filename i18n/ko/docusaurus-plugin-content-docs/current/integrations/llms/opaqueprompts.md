---
translated: true
---

# OpaquePrompts

[OpaquePrompts](https://opaqueprompts.readthedocs.io/en/latest/)는 사용자 프라이버시를 훼손하지 않고도 언어 모델의 힘을 활용할 수 있게 해주는 서비스입니다. 기존 애플리케이션 및 서비스에 쉽게 통합할 수 있도록 설계된 OpaquePrompts는 간단한 Python 라이브러리와 LangChain을 통해 사용할 수 있습니다. 더욱 중요한 것은 OpaquePrompts가 [confidential computing](https://en.wikipedia.org/wiki/Confidential_computing)의 힘을 활용하여 OpaquePrompts 서비스 자체도 보호하고 있는 데이터에 액세스할 수 없다는 점입니다.

이 노트북에서는 LangChain을 사용하여 `OpaquePrompts`와 상호 작용하는 방법을 살펴봅니다.

```python
# install the opaqueprompts and langchain packages
%pip install --upgrade --quiet  opaqueprompts langchain
```

OpaquePrompts API에 액세스하려면 API 키가 필요합니다. [OpaquePrompts 웹사이트](https://opaqueprompts.opaque.co/)에서 계정을 만들면 [API Keys 페이지](https:opaqueprompts.opaque.co/api-keys)에서 API 키를 찾을 수 있습니다.

```python
import os

# Set API keys

os.environ["OPAQUEPROMPTS_API_KEY"] = "<OPAQUEPROMPTS_API_KEY>"
os.environ["OPENAI_API_KEY"] = "<OPENAI_API_KEY>"
```

# OpaquePrompts LLM Wrapper 사용

애플리케이션에 OpaquePrompts를 적용하는 것은 `llm=OpenAI()`를 `llm=OpaquePrompts(base_llm=OpenAI())`로 바꾸는 것만큼 간단할 수 있습니다.

```python
from langchain.callbacks.stdout import StdOutCallbackHandler
from langchain.chains import LLMChain
from langchain.globals import set_debug, set_verbose
from langchain.memory import ConversationBufferWindowMemory
from langchain_community.llms import OpaquePrompts
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

set_debug(True)
set_verbose(True)

prompt_template = """
As an AI assistant, you will answer questions according to given context.

Sensitive personal information in the question is masked for privacy.
For instance, if the original text says "Giana is good," it will be changed
to "PERSON_998 is good."

Here's how to handle these changes:
* Consider these masked phrases just as placeholders, but still refer to
them in a relevant way when answering.
* It's possible that different masked terms might mean the same thing.
Stick with the given term and don't modify it.
* All masked terms follow the "TYPE_ID" pattern.
* Please don't invent new masked terms. For instance, if you see "PERSON_998,"
don't come up with "PERSON_997" or "PERSON_999" unless they're already in the question.

Conversation History: ```{history}```
Context : ```During our recent meeting on February 23, 2023, at 10:30 AM,
John Doe provided me with his personal details. His email is johndoe@example.com
and his contact number is 650-456-7890. He lives in New York City, USA, and
belongs to the American nationality with Christian beliefs and a leaning towards
the Democratic party. He mentioned that he recently made a transaction using his
credit card 4111 1111 1111 1111 and transferred bitcoins to the wallet address
1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. While discussing his European travels, he noted
down his IBAN as GB29 NWBK 6016 1331 9268 19. Additionally, he provided his website
as https://johndoeportfolio.com. John also discussed some of his US-specific details.
He said his bank account number is 1234567890123456 and his drivers license is Y12345678.
His ITIN is 987-65-4321, and he recently renewed his passport, the number for which is
123456789. He emphasized not to share his SSN, which is 123-45-6789. Furthermore, he
mentioned that he accesses his work files remotely through the IP 192.168.1.1 and has
a medical license number MED-123456. ```
Question: ```{question}```

"""

chain = LLMChain(
    prompt=PromptTemplate.from_template(prompt_template),
    llm=OpaquePrompts(base_llm=OpenAI()),
    memory=ConversationBufferWindowMemory(k=2),
    verbose=True,
)


print(
    chain.run(
        {
            "question": """Write a message to remind John to do password reset for his website to stay secure."""
        },
        callbacks=[StdOutCallbackHandler()],
    )
)
```

출력에서 사용자 입력의 다음과 같은 컨텍스트에 민감한 데이터가 포함되어 있음을 확인할 수 있습니다.

```output
# Context from user input

During our recent meeting on February 23, 2023, at 10:30 AM, John Doe provided me with his personal details. His email is johndoe@example.com and his contact number is 650-456-7890. He lives in New York City, USA, and belongs to the American nationality with Christian beliefs and a leaning towards the Democratic party. He mentioned that he recently made a transaction using his credit card 4111 1111 1111 1111 and transferred bitcoins to the wallet address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. While discussing his European travels, he noted down his IBAN as GB29 NWBK 6016 1331 9268 19. Additionally, he provided his website as https://johndoeportfolio.com. John also discussed some of his US-specific details. He said his bank account number is 1234567890123456 and his drivers license is Y12345678. His ITIN is 987-65-4321, and he recently renewed his passport, the number for which is 123456789. He emphasized not to share his SSN, which is 669-45-6789. Furthermore, he mentioned that he accesses his work files remotely through the IP 192.168.1.1 and has a medical license number MED-123456.

```

OpaquePrompts는 자동으로 민감한 데이터를 감지하고 자리 표시자로 대체합니다.

```output

# Context after OpaquePrompts

During our recent meeting on DATE_TIME_3, at DATE_TIME_2, PERSON_3 provided me with his personal details. His email is EMAIL_ADDRESS_1 and his contact number is PHONE_NUMBER_1. He lives in LOCATION_3, LOCATION_2, and belongs to the NRP_3 nationality with NRP_2 beliefs and a leaning towards the Democratic party. He mentioned that he recently made a transaction using his credit card CREDIT_CARD_1 and transferred bitcoins to the wallet address CRYPTO_1. While discussing his NRP_1 travels, he noted down his IBAN as IBAN_CODE_1. Additionally, he provided his website as URL_1. PERSON_2 also discussed some of his LOCATION_1-specific details. He said his bank account number is US_BANK_NUMBER_1 and his drivers license is US_DRIVER_LICENSE_2. His ITIN is US_ITIN_1, and he recently renewed his passport, the number for which is DATE_TIME_1. He emphasized not to share his SSN, which is US_SSN_1. Furthermore, he mentioned that he accesses his work files remotely through the IP IP_ADDRESS_1 and has a medical license number MED-US_DRIVER_LICENSE_1.

```

자리 표시자가 LLM 응답에 사용됩니다.

```output

# response returned by LLM

Hey PERSON_1, just wanted to remind you to do a password reset for your website URL_1 through your email EMAIL_ADDRESS_1. It's important to stay secure online, so don't forget to do it!

```

자리 표시자를 원래 민감한 데이터로 대체하여 응답을 비식별화합니다.

```output

# desanitized LLM response from OpaquePrompts

Hey John, just wanted to remind you to do a password reset for your website https://johndoeportfolio.com through your email johndoe@example.com. It's important to stay secure online, so don't forget to do it!

```

# LangChain 표현식에서 OpaquePrompts 사용

드롭인 대체가 필요한 유연성을 제공하지 않는 경우 LangChain 표현식과 함께 사용할 수 있는 기능이 있습니다.

```python
import langchain_community.utilities.opaqueprompts as op
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

prompt = (PromptTemplate.from_template(prompt_template),)
llm = OpenAI()
pg_chain = (
    op.sanitize
    | RunnablePassthrough.assign(
        response=(lambda x: x["sanitized_input"]) | prompt | llm | StrOutputParser(),
    )
    | (lambda x: op.desanitize(x["response"], x["secure_context"]))
)

pg_chain.invoke(
    {
        "question": "Write a text message to remind John to do password reset for his website through his email to stay secure.",
        "history": "",
    }
)
```
