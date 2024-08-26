---
translated: true
---

# 아서

>[아서](https://arthur.ai)는 모델 모니터링 및 관찰 플랫폼입니다.

다음 가이드는 등록된 채팅 LLM에 아서 콜백 핸들러를 실행하여 모델 추론을 자동으로 아서에 기록하는 방법을 보여줍니다.

현재 아서에 온보딩되지 않은 모델이 있는 경우 [생성 텍스트 모델 온보딩 가이드](https://docs.arthur.ai/user-guide/walkthroughs/model-onboarding/generative_text_onboarding.html)를 방문하세요. `Arthur SDK`를 사용하는 방법에 대한 자세한 내용은 [문서](https://docs.arthur.ai/)를 참조하세요.

## 설치 및 설정

아서 자격 증명을 여기에 입력하세요

```python
arthur_url = "https://app.arthur.ai"
arthur_login = "your-arthur-login-username-here"
arthur_model_id = "your-arthur-model-id-here"
```

## 콜백 핸들러

```python
from langchain.callbacks import ArthurCallbackHandler
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
```

아서 콜백 핸들러가 포함된 Langchain LLM 생성

```python
def make_langchain_chat_llm():
    return ChatOpenAI(
        streaming=True,
        temperature=0.1,
        callbacks=[
            StreamingStdOutCallbackHandler(),
            ArthurCallbackHandler.from_credentials(
                arthur_model_id, arthur_url=arthur_url, arthur_login=arthur_login
            ),
        ],
    )
```

```python
chatgpt = make_langchain_chat_llm()
```

```output
Please enter password for admin: ········
```

이 `run` 함수를 사용하여 채팅 LLM을 실행하면 채팅 기록이 지속적인 목록에 저장되어 대화에서 이전 메시지를 참조할 수 있으며 각 응답이 아서 플랫폼에 기록됩니다. [모델 대시보드 페이지](https://app.arthur.ai/)에서 이 모델의 추론 기록을 볼 수 있습니다.

`q`를 입력하여 실행 루프를 종료합니다.

```python
def run(llm):
    history = []
    while True:
        user_input = input("\n>>> input >>>\n>>>: ")
        if user_input == "q":
            break
        history.append(HumanMessage(content=user_input))
        history.append(llm(history))
```

```python
run(chatgpt)
```

```output

>>> input >>>
>>>: What is a callback handler?
A callback handler, also known as a callback function or callback method, is a piece of code that is executed in response to a specific event or condition. It is commonly used in programming languages that support event-driven or asynchronous programming paradigms.

The purpose of a callback handler is to provide a way for developers to define custom behavior that should be executed when a certain event occurs. Instead of waiting for a result or blocking the execution, the program registers a callback function and continues with other tasks. When the event is triggered, the callback function is invoked, allowing the program to respond accordingly.

Callback handlers are commonly used in various scenarios, such as handling user input, responding to network requests, processing asynchronous operations, and implementing event-driven architectures. They provide a flexible and modular way to handle events and decouple different components of a system.
>>> input >>>
>>>: What do I need to do to get the full benefits of this
To get the full benefits of using a callback handler, you should consider the following:

1. Understand the event or condition: Identify the specific event or condition that you want to respond to with a callback handler. This could be user input, network requests, or any other asynchronous operation.

2. Define the callback function: Create a function that will be executed when the event or condition occurs. This function should contain the desired behavior or actions you want to take in response to the event.

3. Register the callback function: Depending on the programming language or framework you are using, you may need to register or attach the callback function to the appropriate event or condition. This ensures that the callback function is invoked when the event occurs.

4. Handle the callback: Implement the necessary logic within the callback function to handle the event or condition. This could involve updating the user interface, processing data, making further requests, or triggering other actions.

5. Consider error handling: It's important to handle any potential errors or exceptions that may occur within the callback function. This ensures that your program can gracefully handle unexpected situations and prevent crashes or undesired behavior.

6. Maintain code readability and modularity: As your codebase grows, it's crucial to keep your callback handlers organized and maintainable. Consider using design patterns or architectural principles to structure your code in a modular and scalable way.

By following these steps, you can leverage the benefits of callback handlers, such as asynchronous and event-driven programming, improved responsiveness, and modular code design.
>>> input >>>
>>>: q
```
