---
translated: true
---

# 디버깅

LLM을 사용하여 빌드할 때, 어떤 시점에서는 무언가가 고장 나고 디버그가 필요할 것입니다. 모델 호출이 실패하거나 모델 출력이 잘못 형식화되거나 중첩된 모델 호출이 있을 때 어디서 잘못된 출력이 생성되었는지 명확하지 않을 수 있습니다.

다양한 도구와 기능을 사용하여 디버깅을 도와드리겠습니다.

## 추적(Tracing)

[LangSmith](/docs/langsmith/)와 같은 추적 기능이 있는 플랫폼은 디버깅을 위한 가장 포괄적인 솔루션입니다. 이러한 플랫폼은 LLM 앱을 쉽게 기록하고 시각화할 수 있을 뿐만 아니라, 이를 적극적으로 디버그하고 테스트하며 개선할 수 있습니다.

생산 등급의 LLM 애플리케이션을 구축할 때, 이러한 플랫폼은 필수적입니다.

![LangSmith 디버깅 인터페이스의 스크린샷, 입력 및 출력 세부 정보와 실행 트리 시각화를 보여줍니다.](../../../../../../static/img/run_details.png 'LangSmith 디버깅 인터페이스')

## `set_debug` 및 `set_verbose`

Jupyter 노트북에서 프로토타입을 작성하거나 Python 스크립트를 실행할 때, 체인 실행의 중간 단계를 출력하는 것이 유용할 수 있습니다.

여러 가지 방법으로 다양한 정도의 자세함을 가진 출력을 활성화할 수 있습니다.

간단한 에이전트가 있다고 가정하고, 이 에이전트가 수행하는 작업과 수신한 도구 출력을 시각화하고자 합니다. 디버깅 없이 실행하면 다음과 같은 출력을 확인할 수 있습니다.

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4", temperature=0)
tools = load_tools(["ddg-search", "llm-math"], llm=llm)
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION)
```

```python
agent.run("2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?")
```

```
    '2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란이며, 그는 2023년 기준으로 약 19345일입니다.'
```

### `set_debug(True)`

전역 `debug` 플래그를 설정하면 콜백 지원이 있는 모든 LangChain 구성 요소(체인, 모델, 에이전트, 도구, 검색기)가 수신한 입력과 생성한 출력을 출력합니다. 이는 가장 자세한 설정으로, 원시 입력 및 출력을 완전히 기록합니다.

```python
from langchain.globals import set_debug

set_debug(True)

agent.run("2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?")
```

<details> <summary>콘솔 출력</summary>

```output
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor] 입력과 함께 체인 실행 시작:
    {
      "input": "2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?"
    }
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 2:RunTypeEnum.chain:LLMChain] 입력과 함께 체인 실행 시작:
    {
      "input": "2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?",
      "agent_scratchpad": "",
      "stop": [
        "\nObservation:",
        "\n\tObservation:"
      ]
    }
    [llm/start] [1:RunTypeEnum.chain:AgentExecutor > 2:RunTypeEnum.chain:LLMChain > 3:RunTypeEnum.llm:ChatOpenAI] 입력과 함께 LLM 실행 시작:
    {
      "prompts": [
        "Human: 가능한 최선으로 다음 질문에 답변하세요. 다음 도구에 액세스할 수 있습니다:\n\nduckduckgo_search: DuckDuckGo 검색의 래퍼. 현재 이벤트에 대한 질문에 답해야 할 때 유용합니다. 입력은 검색어여야 합니다.\n계산기: 수학 문제를 해결해야 할 때 유용합니다.\n\n다음 형식을 사용하세요:\n\n질문: 답해야 할 입력 질문\n생각: 무엇을 해야 할지 항상 생각하세요\n작업: 취할 작업, [duckduckgo_search, Calculator] 중 하나여야 합니다.\n작업 입력: 작업에 대한 입력\n관찰: 작업 결과\n... (이 생각/작업/작업 입력/관찰이 N 번 반복될 수 있습니다)\n생각: 이제 최종 답을 알았습니다\n최종 답변: 원래 입력 질문에 대한 최종 답변\n\n시작!\n\n질문: 2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?\n생각:"
      ]
    }
    [llm/end] [1:RunTypeEnum.chain:AgentExecutor > 2:RunTypeEnum.chain:LLMChain > 3:RunTypeEnum.llm:ChatOpenAI] [5.53s] 출력과 함께 LLM 실행 종료:
    {
      "generations": [
        [
          {
            "text": "2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"2023년 영화 오펜하이머의 감독과 나이\"",
            "generation_info": {
              "finish_reason": "stop"
            },
            "message": {
              "lc": 1,
              "type": "constructor",
              "id": [
                "langchain",
                "schema",
                "messages",
                "AIMessage"
              ],
              "kwargs": {
                "content": "2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"2023년 영화 오펜하이머의 감독과 나이\"",
                "additional_kwargs": {}
              }
            }
          }
        ]
      ],
      "llm_output": {
        "token_usage": {
          "prompt_tokens": 206,
          "completion_tokens": 71,
          "total_tokens": 277
        },
        "model_name": "gpt-4"
      },
      "run": null
    }
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 2:RunTypeEnum.chain:LLMChain] [5.53s] 출력과 함께 체인 실행 종료:
    {
      "text": "2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"2023년 영화 오펜하이머의 감독과 나이\""
    }
    [tool/start] [1:RunTypeEnum.chain:AgentExecutor > 4:RunTypeEnum.tool:duckduckgo_search] 입력과 함께 도구 실행 시작:
    "2023년 영화 오펜하이머의 감독과 나이"
    [tool/end] [1:RunTypeEnum.chain:AgentExecutor > 4:RunTypeEnum.tool:duckduckgo_search] [1.51s] 출력과 함께 도구 실행 종료:
    "첫 원자 폭탄을 만들기 위한 광란의 분주함을 포착하기 위해 빠른 촬영, 엄격한 세트 규칙 및 전체 1940년대 서부 마을의 건설이 필요했습니다. Jada Yuan의 기사입니다. 2023년 7월 19일 오전 5시... 크리스토퍼 놀란의 새 영화 '오펜하이머'에서 Cillian Murphy가 J. Robert Oppenheimer로 출연합니다. 로스앨러모스에서 맨해튼 프로젝트를 감독한 미국 물리학자입니다. 유니버설 픽쳐스... 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. Robert Oppenheimer의 이야기와 원자 폭탄 개발에서 그의 역할을 다룹니다. 크리스토퍼 놀란은 '오펜하이머'라는 그의 가장 '극단적인' 영화에 깊이 빠져 있습니다. Kenneth Turan의 기사입니다. 2023년 7월 11일 오전 5시 PT. 구독자 전용. 로스앤젤레스에서 촬영한 크리스토퍼 놀란. ... 오펜하이머는 크리스토퍼 놀란 감독의 2023년 서사 전기 스릴러 영화입니다. 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 기반으로 J. Robert Oppenheimer에 대한 이야기입니다. 그는 맨해튼 프로젝트의 일환으로 첫 핵무기를 개발하는 데 중요한 역할을 했으며 원자 시대를 열었습니다."
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 5:RunTypeEnum.chain:LLMChain] 입력과 함께 체인 실행 시작:
    {
      "input": "2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?",
      "agent_scratchpad": "2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"2023년 영화 오펜하이머의 감독과 나이\"\n관찰: 첫 원자 폭탄을 만들기 위한 광란의 분주함을 포착하기 위해 빠른 촬영, 엄격한 세트 규칙 및 전체 1940년대 서부 마을의 건설이 필요했습니다. Jada Yuan의 기사입니다. 2023년 7월 19일 오전 5시... 크리스토퍼 놀란의 새 영화 '오펜하이머'에서 Cillian Murphy가 J. Robert Oppenheimer로 출연합니다. 로스앨러모스에서 맨해튼 프로젝트를 감독한 미국 물리학자입니다. 유니버설 픽쳐스... 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. Robert Oppenheimer의 이야기와 원자 폭탄 개발에서 그의 역할을 다룹니다. 크리스토퍼 놀란은 '오펜하이머'라는 그의 가장 '극단적인' 영화에 깊이 빠져 있습니다. Kenneth Turan의 기사입니다. 2023년 7월 11일 오전 5시 PT. 구독자 전용. 로스앤젤레스에서 촬영한 크리스토퍼 놀란. ... 오펜하이머는 크리스토퍼 놀란 감독의 2023년 서사 전기 스릴러 영화입니다. 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 기반으로 J. Robert Oppenheimer에 대한 이야기입니다. 그는 맨해튼 프로젝트의 일환으로 첫 핵무기를 개발하는 데 중요한 역할을 했으며 원자 시대를 열었습니다.\n생각:",
      "stop": [
        "\n관찰:",
        "\n\t관찰:"
      ]
    }
    [llm/start] [1:RunTypeEnum.chain:AgentExecutor > 5:RunTypeEnum.chain:LLMChain > 6:RunTypeEnum.llm:ChatOpenAI] 입력과 함께 LLM 실행 시작:
    {
      "prompts": [
        "Human: 가능한 최선으로 다음 질문에 답변하세요. 다음 도구에 액세스할 수 있습니다:\n\nduckduckgo_search: DuckDuckGo 검색의 래퍼. 현재 이벤트에 대한 질문에 답해야 할 때 유용합니다. 입력은 검색어여야 합니다.\n계산기: 수학 문제를 해결해야 할 때 유용합니다.\n\n다음 형식을 사용하세요:\n\n질문: 답해야 할 입력 질문\n생각: 무엇을 해야 할지 항상 생각하세요\n작업: 취할 작업, [duckduckgo_search, Calculator] 중 하나여야 합니다.\n작업 입력: 작업에 대한 입력\n관찰: 작업 결과\n... (이 생각/작업/작업 입력/관찰이 N 번 반복될 수 있습니다)\n생각: 이제 최종 답을 알았습니다\n최종 답변: 원래 입력 질문에 대한 최종 답변\n\n시작!\n\n질문: 2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?\n생각:2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"2023년 영화 오펜하이머의 감독과 나이\"\n관찰: 첫 원자 폭탄을 만들기 위한 광란의 분주함을 포착하기 위해 빠른 촬영, 엄격한 세트 규칙 및 전체 1940년대 서부 마을의 건설이 필요했습니다. Jada Yuan의 기사입니다. 2023년 7월 19일 오전 5시... 크리스토퍼 놀란의 새 영화 '오펜하이머'에서 Cillian Murphy가 J. Robert Oppenheimer로 출연합니다. 로스앨러모스에서 맨해튼 프로젝트를 감독한 미국 물리학자입니다. 유니버설 픽쳐스... 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. Robert Oppenheimer의 이야기와 원자 폭탄 개발에서 그의 역할을 다룹니다. 크리스토퍼 놀란은 '오펜하이머'라는 그의 가장 '극단적인' 영화에 깊이 빠져 있습니다. Kenneth Turan의 기사입니다. 2023년 7월 11일 오전 5시 PT. 구독자 전용. 로스앤젤레스에서 촬영한 크리스토퍼 놀란. ... 오펜하이머는 크리스토퍼 놀란 감독의 2023년 서사 전기 스릴러 영화입니다. 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 기반으로 J. Robert Oppenheimer에 대한 이야기입니다. 그는 맨해튼 프로젝트의 일환으로 첫 핵무기를 개발하는 데 중요한 역할을 했으며 원자 시대를 열었습니다.\n생각:"
      ]
    }
    [llm/end] [1:RunTypeEnum.chain:AgentExecutor > 5:RunTypeEnum.chain:LLMChain > 6:RunTypeEnum.llm:ChatOpenAI] [4.46s] 출력과 함께 LLM 실행 종료:
    {
      "generations": [
        [
          {
            "text": "2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란입니다. 이제 그의 나이를 알아내야 합니다.\n작업: duckduckgo_search\n작업 입력: \"크리스토퍼 놀란 나이\"",
            "generation_info": {
              "finish_reason": "stop"
            },
            "message": {
              "lc": 1,
              "type": "constructor",
              "id": [
                "langchain",
                "schema",
                "messages",
                "AIMessage"
              ],
              "kwargs": {
                "content": "2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란입니다. 이제 그의 나이를 알아내야 합니다.\n작업: duckduckgo_search\n작업 입력: \"크리스토퍼 놀란 나이\"",
                "additional_kwargs": {}
              }
            }
          }
        ]
      ],
      "llm_output": {
        "token_usage": {
          "prompt_tokens": 550,
          "completion_tokens": 39,
          "total_tokens": 589
        },
        "model_name": "gpt-4"
      },
      "run": null
    }
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 5:RunTypeEnum.chain:LLMChain] [4.46s] 출력과 함께 체인 실행 종료:
    {
      "text": "2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란입니다. 이제 그의 나이를 알아내야 합니다.\n작업: duckduckgo_search\n작업 입력: \"크리스토퍼 놀란 나이\""
    }
    [tool/start] [1:RunTypeEnum.chain:AgentExecutor > 7:RunTypeEnum.tool:duckduckgo_search] 입력과 함께 도구 실행 시작:
    "크리스토퍼 놀란 나이"
    [tool/end] [1:RunTypeEnum.chain:AgentExecutor > 7:RunTypeEnum.tool:duckduckgo_search] [1.33s] 출력과 함께 도구 실행 종료:
    "Christopher Edward Nolan CBE (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide. The recipient of many accolades, he has been nominated for five Academy Awards, five BAFTA Awards and six Golden Globe Awards. July 30, 1970 (age 52) London England Notable Works: \"Dunkirk\" \"Tenet\" \"The Prestige\" See all related content → Recent News Jul. 13, 2023, 11:11 AM ET (AP) Cillian Murphy, playing Oppenheimer, finally gets to lead a Christopher Nolan film July 11, 2023 5 AM PT For Subscribers Christopher Nolan is photographed in Los Angeles. (Joe Pugliese / For The Times) This is not the story I was supposed to write. Oppenheimer director Christopher Nolan, Cillian Murphy, Emily Blunt and Matt Damon on the stakes of making a three-hour, CGI-free summer film. Christopher Nolan, the director behind such films as \"Dunkirk,\" \"Inception,\" \"Interstellar,\" and the \"Dark Knight\" trilogy, has spent the last three years living in Oppenheimer's world, writing ..."
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 8:RunTypeEnum.chain:LLMChain] 입력과 함께 체인 실행 시작:
    {
      "input": "2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?",
      "agent_scratchpad": "2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"2023년 영화 오펜하이머의 감독과 나이\"\n관찰: 첫 원자 폭탄을 만들기 위한 광란의 분주함을 포착하기 위해 빠른 촬영, 엄격한 세트 규칙 및 전체 1940년대 서부 마을의 건설이 필요했습니다. Jada Yuan의 기사입니다. 2023년 7월 19일 오전 5시... 크리스토퍼 놀란의 새 영화 '오펜하이머'에서 Cillian Murphy가 J. Robert Oppenheimer로 출연합니다. 로스앨러모스에서 맨해튼 프로젝트를 감독한 미국 물리학자입니다. 유니버설 픽쳐스... 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. Robert Oppenheimer의 이야기와 원자 폭탄 개발에서 그의 역할을 다룹니다. 크리스토퍼 놀란은 '오펜하이머'라는 그의 가장 '극단적인' 영화에 깊이 빠져 있습니다. Kenneth Turan의 기사입니다. 2023년 7월 11일 오전 5시 PT. 구독자 전용. 로스앤젤레스에서 촬영한 크리스토퍼 놀란. ... 오펜하이머는 크리스토퍼 놀란 감독의 2023년 서사 전기 스릴러 영화입니다. 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 기반으로 J. Robert Oppenheimer에 대한 이야기입니다. 그는 맨해튼 프로젝트의 일환으로 첫 핵무기를 개발하는 데 중요한 역할을 했으며 원자 시대를 열었습니다.\n생각:2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"크리스토퍼 놀란 나이\"\n관찰: Christopher Edward Nolan CBE (1970년 7월 30일 출생)은 영국과 미국의 영화 제작자입니다. 복잡한 스토리텔링으로 유명한 그의 할리우드 블록버스터로 인해 놀란은 21세기의 선두 영화 제작자로 간주됩니다. 그의 영화는 전 세계적으로 50억 달러의 수익을 올렸습니다. 많은 상을 수상한 그는 다섯 번의 아카데미상, 다섯 번의 BAFTA상 및 여섯 번의 골든 글로브상 후보에 올랐습니다. 1970년 7월 30일 (52세) 런던 영국 주목할 만한 작품: \"덩케르크\" \"테넷\" \"프레스티지\" 모든 관련 콘텐츠 보기 → 최근 뉴스 2023년 7월 13일 오전 11:11 (AP) Cillian Murphy, 오펜하이머를 연기하며 마침내 Christopher Nolan 영화의 주인공이 되다 2023년 7월 11일 오전 5시 PT 구독자 전용 Christopher Nolan이 로스앤젤레스에서 촬영한 사진입니다. (Joe Pugliese / For The Times) 이 이야기는 내가 쓰기로 한 이야기가 아닙니다. 오펜하이머 감독 크리스토퍼 놀란, Cillian Murphy, Emily Blunt 및 Matt Damon이 세 시간 길이의 CGI 없이 여름 영화를 만드는 것의 중요성에 대해 논의합니다. \"덩케르크\", \"인셉션\", \"인터스텔라\" 및 \"다크 나이트\" 3부작과 같은 영화의 감독인 크리스토퍼 놀란은 지난 3년 동안 오펜하이머의 세계에 살며 글을 쓰고 있습니다.\n생각:",
      "stop": [
        "\n관찰:",
        "\n\t관찰:"
      ]
    }
    [llm/start] [1:RunTypeEnum.chain:AgentExecutor > 8:RunTypeEnum.chain:LLMChain > 9:RunTypeEnum.llm:ChatOpenAI] 입력과 함께 LLM 실행 시작:
    {
      "prompts": [
        "Human: 가능한 최선으로 다음 질문에 답변하세요. 다음 도구에 액세스할 수 있습니다:\n\nduckduckgo_search: DuckDuckGo 검색의 래퍼. 현재 이벤트에 대한 질문에 답해야 할 때 유용합니다. 입력은 검색어여야 합니다.\n계산기: 수학 문제를 해결해야 할 때 유용합니다.\n\n다음 형식을 사용하세요:\n\n질문: 답해야 할 입력 질문\n생각: 무엇을 해야 할지 항상 생각하세요\n작업: 취할 작업, [duckduckgo_search, Calculator] 중 하나여야 합니다.\n작업 입력: 작업에 대한 입력\n관찰: 작업 결과\n... (이 생각/작업/작업 입력/관찰이 N 번 반복될 수 있습니다)\n생각: 이제 최종 답을 알았습니다\n최종 답변: 원래 입력 질문에 대한 최종 답변\n\n시작!\n\n질문: 2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?\n생각:2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"2023년 영화 오펜하이머의 감독과 나이\"\n관찰: 첫 원자 폭탄을 만들기 위한 광란의 분주함을 포착하기 위해 빠른 촬영, 엄격한 세트 규칙 및 전체 1940년대 서부 마을의 건설이 필요했습니다. Jada Yuan의 기사입니다. 2023년 7월 19일 오전 5시... 크리스토퍼 놀란의 새 영화 '오펜하이머'에서 Cillian Murphy가 J. Robert Oppenheimer로 출연합니다. 로스앨러모스에서 맨해튼 프로젝트를 감독한 미국 물리학자입니다. 유니버설 픽쳐스... 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. Robert Oppenheimer의 이야기와 원자 폭탄 개발에서 그의 역할을 다룹니다. 크리스토퍼 놀란은 '오펜하이머'라는 그의 가장 '극단적인' 영화에 깊이 빠져 있습니다. Kenneth Turan의 기사입니다. 2023년 7월 11일 오전 5시 PT. 구독자 전용. 로스앤젤레스에서 촬영한 크리스토퍼 놀란. ... 오펜하이머는 크리스토퍼 놀란 감독의 2023년 서사 전기 스릴러 영화입니다. 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 기반으로 J. Robert Oppenheimer에 대한 이야기입니다. 그는 맨해튼 프로젝트의 일환으로 첫 핵무기를 개발하는 데 중요한 역할을 했으며 원자 시대를 열었습니다.\n생각:2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"크리스토퍼 놀란 나이\"\n관찰: Christopher Edward Nolan CBE (1970년 7월 30일 출생)은 영국과 미국의 영화 제작자입니다. 복잡한 스토리텔링으로 유명한 그의 할리우드 블록버스터로 인해 놀란은 21세기의 선두 영화 제작자로 간주됩니다. 그의 영화는 전 세계적으로 50억 달러의 수익을 올렸습니다. 많은 상을 수상한 그는 다섯 번의 아카데미상, 다섯 번의 BAFTA상 및 여섯 번의 골든 글로브상 후보에 올랐습니다. 1970년 7월 30일 (52세) 런던 영국 주목할 만한 작품: \"덩케르크\" \"테넷\" \"프레스티지\" 모든 관련 콘텐츠 보기 → 최근 뉴스 2023년 7월 13일 오전 11:11 (AP) Cillian Murphy, 오펜하이머를 연기하며 마침내 Christopher Nolan 영화의 주인공이 되다 2023년 7월 11일 오전 5시 PT 구독자 전용 Christopher Nolan이 로스앤젤레스에서 촬영한 사진입니다. (Joe Pugliese / For The Times) 이 이야기는 내가 쓰기로 한 이야기가 아닙니다. 오펜하이머 감독 크리스토퍼 놀란, Cillian Murphy, Emily Blunt 및 Matt Damon이 세 시간 길이의 CGI 없이 여름 영화를 만드는 것의 중요성에 대해 논의합니다. \"덩케르크\", \"인셉션\", \"인터스텔라\" 및 \"다크 나이트\" 3부작과 같은 영화의 감독인 크리스토퍼 놀란은 지난 3년 동안 오펜하이머의 세계에 살며 글을 쓰고 있습니다.\n생각:크리스토퍼 놀란은 1970년 7월 30일에 태어났으며, 2023년에는 52세입니다. 이제 그의 나이를 일 수로 계산해야 합니다.\n작업: 계산기\n작업 입력: 52*365",
      ]
    }
    [llm/end] [1:RunTypeEnum.chain:AgentExecutor > 8:RunTypeEnum.chain:LLMChain > 9:RunTypeEnum.llm:ChatOpenAI] [2.69s] 출력과 함께 LLM 실행 종료:
    {
      "generations": [
        [
          {
            "text": "크리스토퍼 놀란은 1970년 7월 30일에 태어났으며, 2023년에는 52세입니다. 이제 그의 나이를 일 수로 계산해야 합니다.\n작업: 계산기\n작업 입력: 52*365",
            "generation_info": {
              "finish_reason": "stop"
            },
            "message": {
              "lc": 1,
              "type": "constructor",
              "id": [
                "langchain",
                "schema",
                "messages",
                "AIMessage"
              ],
              "kwargs": {
                "content": "크리스토퍼 놀란은 1970년 7월 30일에 태어났으며, 2023년에는 52세입니다. 이제 그의 나이를 일 수로 계산해야 합니다.\n작업: 계산기\n작업 입력: 52*365",
                "additional_kwargs": {}
              }
            }
          }
        ]
      ],
      "llm_output": {
        "token_usage": {
          "prompt_tokens": 868,
          "completion_tokens": 46,
          "total_tokens": 914
        },
        "model_name": "gpt-4"
      },
      "run": null
    }
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 8:RunTypeEnum.chain:LLMChain] [2.69s] 출력과 함께 체인 실행 종료:
    {
      "text": "크리스토퍼 놀란은 1970년 7월 30일에 태어났으며, 2023년에는 52세입니다. 이제 그의 나이를 일 수로 계산해야 합니다.\n작업: 계산기\n작업 입력: 52*365"
    }
    [tool/start] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator] 입력과 함께 도구 실행 시작:
    "52*365"
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain] 입력과 함께 체인 실행 시작:
    {
      "question": "52*365"
    }
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain > 12:RunTypeEnum.chain:LLMChain] 입력과 함께 체인 실행 시작:
    {
      "question": "52*365",
      "stop": [
        "```output"
      ]
    }
    [llm/start] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain > 12:RunTypeEnum.chain:LLMChain > 13:RunTypeEnum.llm:ChatOpenAI] 입력과 함께 LLM 실행 시작:
    {
      "prompts": [
        "Human: 수학 문제를 Python의 numexpr 라이브러리를 사용하여 실행할 수 있는 표현식으로 변환하세요. 이 코드를 실행한 출력으로 질문에 답하세요.\n\n질문: ${수학 문제가 포함된 질문.}\n```text\n${문제를 해결하는 단일 수학 표현식}\n```\n...numexpr.evaluate(text)...\n```output\n${코드를 실행한 출력}\n```\n답변: ${답변}\n\n시작.\n\n질문: 37593 * 67은 얼마입니까?\n```text\n37593 * 67\n```\n...numexpr.evaluate(\"37593 * 67\")...\n```output\n2518731\n```\n답변: 2518731\n\n질문: 37593^(1/5)은 얼마입니까?\n```text\n37593**(1/5)\n```\n...numexpr.evaluate(\"37593**(1/5)\")...\n```output\n8.222831614237718\n```\n답변: 8.222831614237718\n\n질문: 52*365"
      ]
    }
    [llm/end] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain > 12:RunTypeEnum.chain:LLMChain > 13:RunTypeEnum.llm:ChatOpenAI] [2.89s] 출력과 함께 LLM 실행 종료:
    {
      "generations": [
        [
          {
            "text": "```text\n52*365\n```\n...numexpr.evaluate(\"52*365\")...\n",
            "generation_info": {
              "finish_reason": "stop"
            },
            "message": {
              "lc": 1,
              "type": "constructor",
              "id": [
                "langchain",
                "schema",
                "messages",
                "AIMessage"
              ],
              "kwargs": {
                "content": "```text\n52*365\n```\n...numexpr.evaluate(\"52*365\")...\n",
                "additional_kwargs": {}
              }
            }
          }
        ]
      ],
      "llm_output": {
        "token_usage": {
          "prompt_tokens": 203,
          "completion_tokens": 19,
          "total_tokens": 222
        },
        "model_name": "gpt-4"
      },
      "run": null
    }
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain > 12:RunTypeEnum.chain:LLMChain] [2.89s] 출력과 함께 체인 실행 종료:
    {
      "text": "```text\n52*365\n```\n...numexpr.evaluate(\"52*365\")...\n"
    }
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain] [2.90s] 출력과 함께 체인 실행 종료:
    {
      "answer": "답변: 18980"
    }
    [tool/end] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator] [2.90s] 출력과 함께 도구 실행 종료:
    "답변: 18980"
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 14:RunTypeEnum.chain:LLMChain] 입력과 함께 체인 실행 시작:
    {
      "input": "2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?",
      "agent_scratchpad": "2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"2023년 영화 오펜하이머의 감독과 나이\"\n관찰: 첫 원자 폭탄을 만들기 위한 광란의 분주함을 포착하기 위해 빠른 촬영, 엄격한 세트 규칙 및 전체 1940년대 서부 마을의 건설이 필요했습니다. Jada Yuan의 기사입니다. 2023년 7월 19일 오전 5시... 크리스토퍼 놀란의 새 영화 '오펜하이머'에서 Cillian Murphy가 J. Robert Oppenheimer로 출연합니다. 로스앨러모스에서 맨해튼 프로젝트를 감독한 미국 물리학자입니다. 유니버설 픽쳐스... 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. Robert Oppenheimer의 이야기와 원자 폭탄 개발에서 그의 역할을 다룹니다. 크리스토퍼 놀란은 '오펜하이머'라는 그의 가장 '극단적인' 영화에 깊이 빠져 있습니다. Kenneth Turan의 기사입니다. 2023년 7월 11일 오전 5시 PT. 구독자 전용. 로스앤젤레스에서 촬영한 크리스토퍼 놀란. ... 오펜하이머는 크리스토퍼 놀란 감독의 2023년 서사 전기 스릴러 영화입니다. 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 기반으로 J. Robert Oppenheimer에 대한 이야기입니다. 그는 맨해튼 프로젝트의 일환으로 첫 핵무기를 개발하는 데 중요한 역할을 했으며 원자 시대를 열었습니다.\n생각:크리스토퍼 놀란은 1970년 7월 30일에 태어났으며, 2023년에는 52세입니다. 이제 그의 나이를 일 수로 계산해야 합니다.\n작업: 계산기\n작업 입력: 52*365\n관찰: 답변: 18980\n생각:",
      "stop": [
        "\n관찰:",
        "\n\t관찰:"
      ]
    }
    [llm/start] [1:RunTypeEnum.chain:AgentExecutor > 14:RunTypeEnum.chain:LLMChain > 15:RunTypeEnum.llm:ChatOpenAI] 입력과 함께 LLM 실행 시작:
    {
      "prompts": [
        "Human: 가능한 최선으로 다음 질문에 답변하세요. 다음 도구에 액세스할 수 있습니다:\n\nduckduckgo_search: DuckDuckGo 검색의 래퍼. 현재 이벤트에 대한 질문에 답해야 할 때 유용합니다. 입력은 검색어여야 합니다.\n계산기: 수학 문제를 해결해야 할 때 유용합니다.\n\n다음 형식을 사용하세요:\n\n질문: 답해야 할 입력 질문\n생각: 무엇을 해야 할지 항상 생각하세요\n작업: 취할 작업, [duckduckgo_search, Calculator] 중 하나여야 합니다.\n작업 입력: 작업에 대한 입력\n관찰: 작업 결과\n... (이 생각/작업/작업 입력/관찰이 N 번 반복될 수 있습니다)\n생각: 이제 최종 답을 알았습니다\n최종 답변: 원래 입력 질문에 대한 최종 답변\n\n시작!\n\n질문: 2023년 영화 오펜하이머의 감독은 누구이고 나이는 몇 살인가요? 그들의 나이를 일 수로 계산하면 며칠인가요 (1년에 365일로 가정)?\n생각:2023년 영화 오펜하이머의 감독과 나이를 알아내야 합니다. 그런 다음 나이를 일 수로 계산해야 합니다. 감독과 나이를 알아내기 위해 DuckDuckGo를 사용하겠습니다.\n작업: duckduckgo_search\n작업 입력: \"2023년 영화 오펜하이머의 감독과 나이\"\n관찰: 첫 원자 폭탄을 만들기 위한 광란의 분주함을 포착하기 위해 빠른 촬영, 엄격한 세트 규칙 및 전체 1940년대 서부 마을의 건설이 필요했습니다. Jada Yuan의 기사입니다. 2023년 7월 19일 오전 5시... 크리스토퍼 놀란의 새 영화 '오펜하이머'에서 Cillian Murphy가 J. Robert Oppenheimer로 출연합니다. 로스앨러모스에서 맨해튼 프로젝트를 감독한 미국 물리학자입니다. 유니버설 픽쳐스... 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. Robert Oppenheimer의 이야기와 원자 폭탄 개발에서 그의 역할을 다룹니다. 크리스토퍼 놀란은 '오펜하이머'라는 그의 가장 '극단적인' 영화에 깊이 빠져 있습니다. Kenneth Turan의 기사입니다. 2023년 7월 11일 오전 5시 PT. 구독자 전용. 로스앤젤레스에서 촬영한 크리스토퍼 놀란. ... 오펜하이머는 크리스토퍼 놀란 감독의 2023년 서사 전기 스릴러 영화입니다. 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 기반으로 J. Robert Oppenheimer에 대한 이야기입니다. 그는 맨해튼 프로젝트의 일환으로 첫 핵무기를 개발하는 데 중요한 역할을 했으며 원자 시대를 열었습니다.\n생각:크리스토퍼 놀란은 1970년 7월 30일에 태어났으며, 2023년에는 52세입니다. 이제 그의 나이를 일 수로 계산해야 합니다.\n작업: 계산기\n작업 입력: 52*365\n관찰: 답변: 18980\n생각:"
      ]
    }
    [llm/end] [1:RunTypeEnum.chain:AgentExecutor > 14:RunTypeEnum.chain:LLMChain > 15:RunTypeEnum.llm:ChatOpenAI] [3.52s] 출력과 함께 LLM 실행 종료:
    {
      "generations": [
        [
          {
            "text": "이제 최종 답을 알았습니다\n최종 답변: 2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란이며, 그는 52세입니다. 그의 나이는 약 18980일입니다.",
            "generation_info": {
              "finish_reason": "stop"
            },
            "message": {
              "lc": 1,
              "type": "constructor",
              "id": [
                "langchain",
                "schema",
                "messages",
                "AIMessage"
              ],
              "kwargs": {
                "content": "이제 최종 답을 알았습니다\n최종 답변: 2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란이며, 그는 52세입니다. 그의 나이는 약 18980일입니다.",
                "additional_kwargs": {}
              }
            }
          }
        ]
      ],
      "llm_output": {
        "token_usage": {
          "prompt_tokens": 926,
          "completion_tokens": 43,
          "total_tokens": 969
        },
        "model_name": "gpt-4"
      },
      "run": null
    }
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 14:RunTypeEnum.chain:LLMChain] [3.52s] 출력과 함께 체인 실행 종료:
    {
      "text": "이제 최종 답을 알았습니다\n최종 답변: 2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란이며, 그는 52세입니다. 그의 나이는 약 18980일입니다."
    }
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor] [21.96s] 출력과 함께 체인 실행 종료:
    {
      "output": "2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란이며, 그는 52세입니다. 그의 나이는 약 18980일입니다."
    }

    '2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란이며, 그는 52세입니다. 그의 나이는 약 18980일입니다.'
```

</details>

### set_verbose(True)

verbose 플래그를 설정하면 입력 및 출력을 조금 더 읽기 쉽게 출력하며, 응용 프로그램 로직에 집중할 수 있도록 특정 원시 출력(예: LLM 호출의 토큰 사용 통계) 로그를 건너뜁니다.

```python
<!--IMPORTS:[{"imported": "set_verbose", "source": "langchain.globals", "docs": "https://api.python.langchain.com/en/latest/globals/langchain.globals.set_verbose.html", "title": "Debugging"}]-->
from langchain.globals import set_verbose

set_verbose(True)

agent.run("2023년 영화 오펜하이머를 감독한 사람은 누구이며, 그의 나이는 몇 살인가요? 그의 나이를 일 단위로 계산하면 며칠인가요? (연간 365일로 가정)")
```

<details> <summary>콘솔 출력</summary>

```output


    > 새로운 AgentExecutor 체인 시작...


    > 새로운 LLMChain 체인 시작...
    포맷팅 후 프롬프트:
    할 수 있는 한 최선을 다해 다음 질문에 답하십시오. 다음 도구에 접근할 수 있습니다:

    duckduckgo_search: DuckDuckGo 검색을 감싸는 래퍼. 현재 이벤트에 대한 질문에 답해야 할 때 유용합니다. 입력은 검색 쿼리여야 합니다.
    Calculator: 수학 문제를 해결해야 할 때 유용합니다.

    다음 형식을 사용하십시오:

    질문: 답변해야 하는 입력 질문
    생각: 무엇을 할지 항상 생각해야 합니다
    행동: 취해야 할 행동, [duckduckgo_search, Calculator] 중 하나여야 합니다
    행동 입력: 행동에 대한 입력
    관찰: 행동의 결과
    ... (이 생각/행동/행동 입력/관찰은 N번 반복될 수 있습니다)
    생각: 이제 최종 답을 알겠습니다
    최종 답: 원래 입력 질문에 대한 최종 답

    시작!

    질문: 2023년 영화 오펜하이머를 감독한 사람은 누구이며, 그의 나이는 몇 살인가요? 그의 나이를 일 단위로 계산하면 며칠인가요? (연간 365일로 가정)
    생각:

    > 체인 완료.
    먼저, 2023년 영화 오펜하이머를 감독한 사람이 누구인지와 그의 출생일을 알아내어 그의 나이를 계산해야 합니다.
    행동: duckduckgo_search
    행동 입력: "2023년 영화 오펜하이머 감독"
    관찰: 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. 로버트 오펜하이머와 그의 원자폭탄 개발 역할에 대한 이야기. 크리스토퍼 놀란의 새 영화 "오펜하이머"에서 Cillian Murphy가 J. 로버트 오펜하이머 역을 맡았습니다 ... 2023년 12:16 p.m. ET. ... 맨해튼 프로젝트의 일환으로 첫 원자폭탄을 개발한 J. 로버트 오펜하이머의 화려하고도 고뇌에 찬 삶을 재조명하는 스타 출연진의 영화입니다. 오펜하이머는 크리스토퍼 놀란이 감독하고 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 바탕으로 한 2023년 서사적 전기 스릴러 영화입니다.
    생각:

    > 새로운 LLMChain 체인 시작...
    포맷팅 후 프롬프트:
    할 수 있는 한 최선을 다해 다음 질문에 답하십시오. 다음 도구에 접근할 수 있습니다:

    duckduckgo_search: DuckDuckGo 검색을 감싸는 래퍼. 현재 이벤트에 대한 질문에 답해야 할 때 유용합니다. 입력은 검색 쿼리여야 합니다.
    Calculator: 수학 문제를 해결해야 할 때 유용합니다.

    다음 형식을 사용하십시오:

    질문: 답변해야 하는 입력 질문
    생각: 무엇을 할지 항상 생각해야 합니다
    행동: 취해야 할 행동, [duckduckgo_search, Calculator] 중 하나여야 합니다
    행동 입력: 행동에 대한 입력
    관찰: 행동의 결과
    ... (이 생각/행동/행동 입력/관찰은 N번 반복될 수 있습니다)
    생각: 이제 최종 답을 알겠습니다
    최종 답: 원래 입력 질문에 대한 최종 답

    시작!

    질문: 2023년 영화 오펜하이머를 감독한 사람은 누구이며, 그의 나이는 몇 살인가요? 그의 나이를 일 단위로 계산하면 며칠인가요? (연간 365일로 가정)
    생각:먼저, 2023년 영화 오펜하이머를 감독한 사람이 누구인지와 그의 출생일을 알아내어 그의 나이를 계산해야 합니다.
    행동: duckduckgo_search
    행동 입력: "2023년 영화 오펜하이머 감독"
    관찰: 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. 로버트 오펜하이머와 그의 원자폭탄 개발 역할에 대한 이야기. 크리스토퍼 놀란의 새 영화 "오펜하이머"에서 Cillian Murphy가 J. 로버트 오펜하이머 역을 맡았습니다 ... 2023년 12:16 p.m. ET. ... 맨해튼 프로젝트의 일환으로 첫 원자폭탄을 개발한 J. 로버트 오펜하이머의 화려하고도 고뇌에 찬 삶을 재조명하는 스타 출연진의 영화입니다. 오펜하이머는 크리스토퍼 놀란이 감독하고 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 바탕으로 한 2023년 서사적 전기 스릴러 영화입니다.
    생각:

    > 체인 완료.
    2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란입니다. 이제 그의 출생일을 알아내어 나이를 계산해야 합니다.
    행동: duckduckgo_search
    행동 입력: "크리스토퍼 놀란 출생일"
    관찰: 1970년 7월 30일 (나이 52세) 런던 잉글랜드 대표작: "덩케르크" "테넷" "프레스티지" 관련 내용 모두 보기 → 최근 뉴스 2023년 7월 13일, 오전 11:11 (AP) 크리스토퍼 놀란 CBE (1970년 7월 30일 출생)은 영국 및 미국의 영화 감독입니다. 복잡한 스토리텔링을 특징으로 하는 할리우드 블록버스터로 유명하며, 21세기의 선도적인 영화 제작자로 평가받고 있습니다. 그의 영화는 전 세계적으로 50억 달러의 수익을 올렸습니다. 다수의 상을 수상했으며, 아카데미상 5회, BAFTA상 5회, 골든 글로브상 6회 후보에 올랐습니다. 크리스토퍼 놀란은 현재 52세로, 그의 출생일은 1970년 7월 30일입니다. 별자리: 사자자리 출생지: 웨스트민스터, 런던, 잉글랜드, 영국 거주지: 로스앤젤레스, 캘리포니아, 미국 국적 교육: 크리스는 Hertfordshire의 Hertford Heath에 위치한 Haileybury와 Imperial Service College를 다녔습니다. 크리스토퍼 놀란의 다음 영화는 원자폭탄을 개발한 남자 J. 로버트 오펜하이머를 연구할 것입니다. 출시 날짜, 줄거리, 예고편 등 자세한 정보는 여기를 참조하십시오. 2023년 7월, 크리스토퍼 놀란의 새로운 영화 "오펜하이머"가 개봉됩니다. 이는 2020년 "테넷" 이후 워너 브라더스와의 결별 이후 첫 영화입니다. "원자폭탄을 개발한 남자"에 대한 서사적 스릴러로 묘사됩니다.
    생각:

    > 새로운 LLMChain 체인 시작...
    포맷팅 후 프롬프트:
    할 수 있는 한 최선을 다해 다음 질문에 답하십시오. 다음 도구에 접근할 수 있습니다:

    duckduckgo_search: DuckDuckGo 검색을 감싸는 래퍼. 현재 이벤트에 대한 질문에 답해야 할 때 유용합니다. 입력은 검색 쿼리여야 합니다.
    Calculator: 수학 문제를 해결해야 할 때 유용합니다.

    다음 형식을 사용하십시오:

    질문: 답변해야 하는 입력 질문
    생각: 무엇을 할지 항상 생각해야 합니다
    행동: 취해야 할 행동, [duckduckgo_search, Calculator] 중 하나여야 합니다
    행동 입력: 행동에 대한 입력
    관찰: 행동의 결과
    ... (이 생각/행동/행동 입력/관찰은 N번 반복될 수 있습니다)
    생각: 이제 최종 답을 알겠습니다
    최종 답: 원래 입력 질문에 대한 최종 답

    시작!

    질문: 2023년 영화 오펜하이머를 감독한 사람은 누구이며, 그의 나이는 몇 살인가요? 그의 나이를 일 단위로 계산하면 며칠인가요? (연간 365일로 가정)
    생각:먼저, 2023년 영화 오펜하이머를 감독한 사람이 누구인지와 그의 출생일을 알아내어 그의 나이를 계산해야 합니다.
    행동: duckduckgo_search
    행동 입력: "2023년 영화 오펜하이머 감독"
    관찰: 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. 로버트 오펜하이머와 그의 원자폭탄 개발 역할에 대한 이야기. 크리스토퍼 놀란의 새 영화 "오펜하이머"에서 Cillian Murphy가 J. 로버트 오펜하이머 역을 맡았습니다 ... 2023년 12:16 p.m. ET. ... 맨해튼 프로젝트의 일환으로 첫 원자폭탄을 개발한 J. 로버트 오펜하이머의 화려하고도 고뇌에 찬 삶을 재조명하는 스타 출연진의 영화입니다. 오펜하이머는 크리스토퍼 놀란이 감독하고 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 바탕으로 한 2023년 서사적 전기 스릴러 영화입니다.
    생각:2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란입니다. 이제 그의 출생일을 알아내어 나이를 계산해야 합니다.
    행동: duckduckgo_search
    행동 입력: "크리스토퍼 놀란 출생일"
    관찰: 1970년 7월 30일 (나이 52세) 런던 잉글랜드 대표작: "덩케르크" "테넷" "프레스티지" 관련 내용 모두 보기 → 최근 뉴스 2023년 7월 13일, 오전 11:11 (AP) 크리스토퍼 놀란 CBE (1970년 7월 30일 출생)은 영국 및 미국의 영화 감독입니다. 복잡한 스토리텔링을 특징으로 하는 할리우드 블록버스터로 유명하며, 21세기의 선도적인 영화 제작자로 평가받고 있습니다. 그의 영화는 전 세계적으로 50억 달러의 수익을 올렸습니다. 다수의 상을 수상했으며, 아카데미상 5회, BAFTA상 5회, 골든 글로브상 6회 후보에 올랐습니다. 크리스토퍼 놀란은 현재 52세로, 그의 출생일은 1970년 7월 30일입니다. 별자리: 사자자리 출생지: 웨스트민스터, 런던, 잉글랜드, 영국 거주지: 로스앤젤레스, 캘리포니아, 미국 국적 교육: 크리스는 Hertfordshire의 Hertford Heath에 위치한 Haileybury와 Imperial Service College를 다녔습니다. 크리스토퍼 놀란의 다음 영화는 원자폭탄을 개발한 남자 J. 로버트 오펜하이머를 연구할 것입니다. 출시 날짜, 줄거리, 예고편 등 자세한 정보는 여기를 참조하십시오. 2023년 7월, 크리스토퍼 놀란의 새로운 영화 "오펜하이머"가 개봉됩니다. 이는 2020년 "테넷" 이후 워너 브라더스와의 결별 이후 첫 영화입니다. "원자폭탄을 개발한 남자"에 대한 서사적 스릴러로 묘사됩니다.
    생각:크리스토퍼 놀란은 1970년 7월 30일에 태어났습니다. 이제 2023년 그의 나이를 계산한 후 일수로 변환해야 합니다.
    행동: 계산기
    행동 입력: (2023 - 1970) * 365

    > 새로운 LLMMathChain 체인 시작...
    (2023 - 1970) * 365

    > 새로운 LLMChain 체인 시작...
    포맷팅 후 프롬프트:
    수학 문제를 Python의 numexpr 라이브러리를 사용하여 실행할 수 있는 표현식으로 변환합니다. 이 코드를 실행한 출력을 사용하여 질문에 답하십시오.

    질문: ${수학 문제 포함 질문.}
    ```text
    ${문제를 해결하는 단일 행의 수학 표현식}
    ```
    ...numexpr.evaluate(text)...
    ```output
    ${코드 실행 결과}
    ```
    답변: ${답변}

    시작.

    질문: 37593 * 67는 얼마입니까?
    ```text
    37593 * 67
    ```
    ...numexpr.evaluate("37593 * 67")...
    ```output
    2518731
    ```
    답변: 2518731

    질문: 37593^(1/5)는 얼마입니까?
    ```text
    37593**(1/5)
    ```
    ...numexpr.evaluate("37593**(1/5)")...
    ```output
    8.222831614237718
    ```
    답변: 8.222831614237718

    질문: (2023 - 1970) * 365


    > 체인 완료.
    ```text
    (2023 - 1970) * 365
    ```
    ...numexpr.evaluate("(2023 - 1970) * 365")...

    답변: 19345
    > 체인 완료.

    관찰: 답변: 19345
    생각:

    > 새로운 LLMChain 체인 시작...
    포맷팅 후 프롬프트:
    할 수 있는 한 최선을 다해 다음 질문에 답하십시오. 다음 도구에 접근할 수 있습니다:

    duckduckgo_search: DuckDuckGo 검색을 감싸는 래퍼. 현재 이벤트에 대한 질문에 답해야 할 때 유용합니다. 입력은 검색 쿼리여야 합니다.
    Calculator: 수학 문제를 해결해야 할 때 유용합니다.

    다음 형식을 사용하십시오:

    질문: 답변해야 하는 입력 질문
    생각: 무엇을 할지 항상 생각해야 합니다
    행동: 취해야 할 행동, [duckduckgo_search, Calculator] 중 하나여야 합니다
    행동 입력: 행동에 대한 입력
    관찰: 행동의 결과
    ... (이 생각/행동/행동 입력/관찰은 N번 반복될 수 있습니다)
    생각: 이제 최종 답을 알겠습니다
    최종 답: 원래 입력 질문에 대한 최종 답

    시작!

    질문: 2023년 영화 오펜하이머를 감독한 사람은 누구이며, 그의 나이는 몇 살인가요? 그의 나이를 일 단위로 계산하면 며칠인가요? (연간 365일로 가정)
    생각:먼저, 2023년 영화 오펜하이머를 감독한 사람이 누구인지와 그의 출생일을 알아내어 그의 나이를 계산해야 합니다.
    행동: duckduckgo_search
    행동 입력: "2023년 영화 오펜하이머 감독"
    관찰: 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. 로버트 오펜하이머와 그의 원자폭탄 개발 역할에 대한 이야기. 크리스토퍼 놀란의 새 영화 "오펜하이머"에서 Cillian Murphy가 J. 로버트 오펜하이머 역을 맡았습니다 ... 2023년 12:16 p.m. ET. ... 맨해튼 프로젝트의 일환으로 첫 원자폭탄을 개발한 J. 로버트 오펜하이머의 화려하고도 고뇌에 찬 삶을 재조명하는 스타 출연진의 영화입니다. 오펜하이머는 크리스토퍼 놀란이 감독하고 2005년 Kai Bird와 Martin J. Sherwin의 전기 'American Prometheus'를 바탕으로 한 2023년 서사적 전기 스릴러 영화입니다.
    생각:2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란입니다. 이제 그의 출생일을 알아내어 나이를 계산해야 합니다.
    행동: duckduckgo_search
    행동 입력: "크리스토퍼 놀란 출생일"
    관찰: 1970년 7월 30일 (나이 52세) 런던 잉글랜드 대표작: "덩케르크" "테넷" "프레스티지" 관련 내용 모두 보기 → 최근 뉴스 2023년 7월 13일, 오전 11:11 (AP) 크리스토퍼 놀란 CBE (1970년 7월 30일 출생)은 영국 및 미국의 영화 감독입니다. 복잡한 스토리텔링을 특징으로 하는 할리우드 블록버스터로 유명하며, 21세기의 선도적인 영화 제작자로 평가받고 있습니다. 그의 영화는 전 세계적으로 50억 달러의 수익을 올렸습니다. 다수의 상을 수상했으며, 아카데미상 5회, BAFTA상 5회, 골든 글로브상 6회 후보에 올랐습니다. 크리스토퍼 놀란은 현재 52세로, 그의 출생일은 1970년 7월 30일입니다. 별자리: 사자자리 출생지: 웨스트민스터, 런던, 잉글랜드, 영국 거주지: 로스앤젤레스, 캘리포니아, 미국 국적 교육: 크리스는 Hertfordshire의 Hertford Heath에 위치한 Haileybury와 Imperial Service College를 다녔습니다. 크리스토퍼 놀란의 다음 영화는 원자폭탄을 개발한 남자 J. 로버트 오펜하이머를 연구할 것입니다. 출시 날짜, 줄거리, 예고편 등 자세한 정보는 여기를 참조하십시오. 2023년 7월, 크리스토퍼 놀란의 새로운 영화 "오펜하이머"가 개봉됩니다. 이는 2020년 "테넷" 이후 워너 브라더스와의 결별 이후 첫 영화입니다. "원자폭탄을 개발한 남자"에 대한 서사적 스릴러로 묘사됩니다.
    생각:크리스토퍼 놀란은 1970년 7월 30일에 태어났습니다. 이제 2023년 그의 나이를 계산한 후 일수로 변환해야 합니다.
    행동: 계산기
    행동 입력: (2023 - 1970) * 365
    관찰: 답변: 19345
    생각:

    > 체인 완료.
    이제 최종 답을 알겠습니다
    최종 답: 2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란이며, 2023년 그의 나이는 53세입니다. 그의 나이는 일수로 19345일입니다.

    > 체인 완료.


    '2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란이며, 2023년 그의 나이는 53세입니다. 그의 나이는 일수로 19345일입니다.'
```

</details>

### Chain(..., verbose=True)

단일 객체로 상세 정보를 제한할 수도 있습니다. 이 경우 해당 객체의 입력 및 출력만 출력되며, 해당 객체에 의해 명시적으로 호출된 추가 콜백도 출력됩니다.

```python
# verbose=True를 initialize_agent에 전달하면 AgentExecutor(Chain)에 전달됩니다.

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)

agent.run("2023년 영화 오펜하이머를 감독한 사람은 누구이며, 그의 나이는 몇 살인가요? 그의 나이를 일 단위로 계산하면 며칠인가요? (연간 365일로 가정)")
```

<details> <summary>콘솔 출력</summary>

```
    > 새로운 AgentExecutor 체인 시작...
    먼저, 2023년 영화 오펜하이머를 감독한 사람이 누구인지와 그의 출생일을 알아내야 합니다. 그런 다음, 그의 나이를 년 단위와 일 단위로 계산할 수 있습니다.
    행동: duckduckgo_search
    행동 입력: "2023년 영화 오펜하이머 감독"
    관찰: 오펜하이머: 크리스토퍼 놀란 감독. Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich 출연. 미국 과학자 J. 로버트 오펜하이머와 그의 원자폭탄 개발 역할에 대한 이야기. 크리스토퍼 놀란의 새 영화 "오펜하이머"에서 Cillian Murphy가 J. 로버트 오펜하이머 역을 맡았습니다. Universal Pictures... J. 로버트 오펜하이머는 비밀 로스앨러모스 연구소의 감독이었습니다. 그것은 원자폭탄을 만들기 위한 맨해튼 프로젝트의 일환으로 미국 대통령 프랭클린 D. 루즈벨트 아래 설립되었습니다. 그는 1945년 7월 뉴멕시코 사막에서 첫 원자폭탄 폭발을 감독했습니다. 코드명 "트리니티". 크리스토퍼 놀란의 새 영화 '오펜하이머' 리뷰, 원자폭탄의 아버지 J. 로버트 오펜하이머의 이야기. Cillian Murphy가 주연을 맡은 스타 출연진 ... 출시일: 2023년 7월 21일. 감독 ... 크리스토퍼 놀란 감독은 그의 새 영화 "오펜하이머"에서 1940년대 서부 마을 전체를 재건했습니다.
    생각: 2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란입니다. 이제 그의 출생일을 알아내어 나이를 계산해야 합니다.
    행동: duckduckgo_search
    행동 입력: "크리스토퍼 놀란 출생일"
    관찰: 1970년 7월 30일 (나이 52세) 런던 잉글랜드 대표작: "덩케르크" "테넷" "프레스티지" 관련 내용 모두 보기 → 최근 뉴스 2023년 7월 13일, 오전 11:11 (AP) Cillian Murphy, 크리스토퍼 놀란 영화 "오펜하이머" 주연을 맡다. 크리스토퍼 에드워드 놀란 CBE (1970년 7월 30일 출생)는 영국 및 미국의 영화 제작자입니다. 복잡한 스토리텔링을 특징으로 하는 할리우드 블록버스터로 유명하며, 21세기의 선도적인 영화 제작자로 평가받고 있습니다. 그의 영화는 전 세계적으로 50억 달러의 수익을 올렸습니다. 다수의 상을 수상했으며, 아카데미상 5회, BAFTA상 5회, 골든 글로브상 6회 후보에 올랐습니다. 크리스토퍼 놀란은 현재 52세로, 그의 출생일은 1970년 7월 30일입니다. 별자리: 사자자리 출생지: 웨스트민스터, 런던, 잉글랜드, 영국 거주지: 로스앤젤레스, 캘리포니아, 미국 국적 교육: 크리스는 Hertfordshire의 Hertford Heath에 위치한 Haileybury와 Imperial Service College를 다녔습니다. 크리스토퍼 놀란의 다음 영화는 원자폭탄을 개발한 남자 J. 로버트 오펜하이머를 연구할 것입니다. 출시 날짜, 줄거리, 예고편 등 자세한 정보는 여기를 참조하십시오. 2023년 7월, 크리스토퍼 놀란의 새로운 영화 "오펜하이머"가 개봉됩니다. 이는 2020년 "테넷" 이후 워너 브라더스와의 결별 이후 첫 영화입니다. "원자폭탄을 개발한 남자"에 대한 서사적 스릴러로 묘사됩니다.
    생각: 크리스토퍼 놀란은 1970년 7월 30일에 태어났습니다. 이제 그의 나이를 년 단위로 계산한 후 일수로 변환할 수 있습니다.
    행동: 계산기
    행동 입력: {"operation": "subtract", "operands": [2023, 1970]}
    관찰: 답변: 53
    생각: 크리스토퍼 놀란은 2023년에 53세입니다. 이제 그의 나이를 일 단위로 계산해야 합니다.
    행동: 계산기
    행동 입력: {"operation": "multiply", "operands": [53, 365]}
    관찰: 답변: 19345
    생각: 이제 최종 답을 알겠습니다.
    최종 답: 2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란입니다. 그는 2023년에 53세이며, 이는 약 19345일입니다.

    > 체인 완료.


    '2023년 영화 오펜하이머의 감독은 크리스토퍼 놀란입니다. 그는 2023년에 53세이며, 이는 약 19345일입니다.'
```

</details>

## 기타 콜백

`콜백`은 주요 구성 요소 로직 외부의 구성 요소 내에서 기능을 실행하는 데 사용됩니다. 위의 모든 솔루션은 구성 요소의 중간 단계를 기록하기 위해 후드 아래에서 `콜백`을 사용합니다. LangChain에는 기본적으로 디버깅과 관련된 여러 `콜백`이 있으며, 예를 들어 [FileCallbackHandler](/docs/modules/callbacks/filecallbackhandler)와 같은 것들이 있습니다. 또한 사용자 정의 기능을 실행하기 위해 직접 콜백을 구현할 수도 있습니다.

[콜백](/docs/modules/callbacks/)에 대한 더 많은 정보, 사용하는 방법 및 사용자 정의 방법에 대해서는 여기를 참조하십시오.