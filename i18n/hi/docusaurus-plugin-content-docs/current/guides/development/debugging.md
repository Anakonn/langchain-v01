---
translated: true
---

यदि आप एलएलएम के साथ बना रहे हैं, तो किसी समय कुछ टूट जाएगा, और आपको डीबग करने की जरूरत होगी। मॉडल कॉल विफल हो जाएगा, या मॉडल आउटपुट गलत प्रारूप में होगा, या कुछ घुमावदार मॉडल कॉल होंगे और यह स्पष्ट नहीं होगा कि किस मार्ग पर गलत आउटपुट बनाया गया था।

यहाँ डीबगिंग में मदद करने के लिए कुछ अलग-अलग उपकरण और कार्यक्षमताएं हैं।

## ट्रेसिंग

[LangSmith](/docs/langsmith/) जैसी ट्रेसिंग क्षमताओं वाली प्लेटफॉर्म्स डीबगिंग के लिए सबसे व्यापक समाधान हैं। ये प्लेटफॉर्म न केवल एलएलएम ऐप्स को लॉग और दृश्यमान बनाने में आसान बनाते हैं, बल्कि उन्हें सक्रिय रूप से डीबग, परीक्षण और परिष्कृत करने में भी मदद करते हैं।

उत्पादन-स्तरीय एलएलएम अनुप्रयोगों को बनाते समय, ऐसी प्लेटफॉर्म्स अनिवार्य हैं।

![LangSmith डीबगिंग इंटरफ़ेस का स्क्रीनशॉट जो एक AgentExecutor रन को इनपुट और आउटपुट विवरण के साथ, और एक रन ट्री दृश्यमान के साथ दिखाता है।](../../../../../../static/img/run_details.png "LangSmith डीबगिंग इंटरफ़ेस")

## `set_debug` और `set_verbose`

यदि आप Jupyter Notebooks में प्रोटोटाइप बना रहे हैं या Python स्क्रिप्ट चला रहे हैं, तो एक Chain रन के मध्यवर्ती चरणों को प्रिंट करना मददगार हो सकता है।

विभिन्न स्तरों की वर्बोसिटी को सक्षम करने के कई तरीके हैं।

मान लीजिए हमारे पास एक सरल एजेंट है, और हम उसके द्वारा लिए गए कार्रवाई और प्राप्त उपकरण आउटपुट को दृश्यमान बनाना चाहते हैं। किसी भी डीबगिंग के बिना, यह है जो हम देखते हैं:

```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent_types.AgentType.html", "title": "Debugging"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.initialize.initialize_agent.html", "title": "Debugging"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Debugging"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Debugging"}]-->
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4", temperature=0)
tools = load_tools(["ddg-search", "llm-math"], llm=llm)
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION)
```

```python
agent.run("Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?")
```

```output
    'The director of the 2023 film Oppenheimer is Christopher Nolan and he is approximately 19345 days old in 2023.'
```

### `set_debug(True)`

वैश्विक `debug` फ्लैग को सेट करने से सभी LangChain घटकों में कॉलबैक समर्थन (श्रृंखलाएं, मॉडल, एजेंट, उपकरण, पुनर्प्राप्तकर्ता) होगा जो उन्हें प्राप्त इनपुट और उत्पन्न आउटपुट को प्रिंट करेगा। यह सबसे अधिक वर्बोस सेटिंग है और कच्चे इनपुट और आउटपुट को पूरी तरह से लॉग करेगा।

```python
<!--IMPORTS:[{"imported": "set_debug", "source": "langchain.globals", "docs": "https://api.python.langchain.com/en/latest/globals/langchain.globals.set_debug.html", "title": "Debugging"}]-->
from langchain.globals import set_debug

set_debug(True)

agent.run("Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?")
```

<details> <summary>कंसोल आउटपुट</summary>

```output
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor] Entering Chain run with input:
    {
      "input": "Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?"
    }
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 2:RunTypeEnum.chain:LLMChain] Entering Chain run with input:
    {
      "input": "Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?",
      "agent_scratchpad": "",
      "stop": [
        "\nObservation:",
        "\n\tObservation:"
      ]
    }
    [llm/start] [1:RunTypeEnum.chain:AgentExecutor > 2:RunTypeEnum.chain:LLMChain > 3:RunTypeEnum.llm:ChatOpenAI] Entering LLM run with input:
    {
      "prompts": [
        "Human: Answer the following questions as best you can. You have access to the following tools:\n\nduckduckgo_search: A wrapper around DuckDuckGo Search. Useful for when you need to answer questions about current events. Input should be a search query.\nCalculator: Useful for when you need to answer questions about math.\n\nUse the following format:\n\nQuestion: the input question you must answer\nThought: you should always think about what to do\nAction: the action to take, should be one of [duckduckgo_search, Calculator]\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question\n\nBegin!\n\nQuestion: Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?\nThought:"
      ]
    }
    [llm/end] [1:RunTypeEnum.chain:AgentExecutor > 2:RunTypeEnum.chain:LLMChain > 3:RunTypeEnum.llm:ChatOpenAI] [5.53s] Exiting LLM run with output:
    {
      "generations": [
        [
          {
            "text": "I need to find out who directed the 2023 film Oppenheimer and their age. Then, I need to calculate their age in days. I will use DuckDuckGo to find out the director and their age.\nAction: duckduckgo_search\nAction Input: \"Director of the 2023 film Oppenheimer and their age\"",
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
                "content": "I need to find out who directed the 2023 film Oppenheimer and their age. Then, I need to calculate their age in days. I will use DuckDuckGo to find out the director and their age.\nAction: duckduckgo_search\nAction Input: \"Director of the 2023 film Oppenheimer and their age\"",
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
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 2:RunTypeEnum.chain:LLMChain] [5.53s] Exiting Chain run with output:
    {
      "text": "I need to find out who directed the 2023 film Oppenheimer and their age. Then, I need to calculate their age in days. I will use DuckDuckGo to find out the director and their age.\nAction: duckduckgo_search\nAction Input: \"Director of the 2023 film Oppenheimer and their age\""
    }
    [tool/start] [1:RunTypeEnum.chain:AgentExecutor > 4:RunTypeEnum.tool:duckduckgo_search] Entering Tool run with input:
    "Director of the 2023 film Oppenheimer and their age"
    [tool/end] [1:RunTypeEnum.chain:AgentExecutor > 4:RunTypeEnum.tool:duckduckgo_search] [1.51s] Exiting Tool run with output:
    "Capturing the mad scramble to build the first atomic bomb required rapid-fire filming, strict set rules and the construction of an entire 1940s western town. By Jada Yuan. July 19, 2023 at 5:00 a ... In Christopher Nolan's new film, "Oppenheimer," Cillian Murphy stars as J. Robert Oppenheimer, the American physicist who oversaw the Manhattan Project in Los Alamos, N.M. Universal Pictures... Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. Christopher Nolan goes deep on 'Oppenheimer,' his most 'extreme' film to date. By Kenneth Turan. July 11, 2023 5 AM PT. For Subscribers. Christopher Nolan is photographed in Los Angeles ... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age."
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 5:RunTypeEnum.chain:LLMChain] Entering Chain run with input:
    {
      "input": "Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?",
      "agent_scratchpad": "I need to find out who directed the 2023 film Oppenheimer and their age. Then, I need to calculate their age in days. I will use DuckDuckGo to find out the director and their age.\nAction: duckduckgo_search\nAction Input: \"Director of the 2023 film Oppenheimer and their age\"\nObservation: Capturing the mad scramble to build the first atomic bomb required rapid-fire filming, strict set rules and the construction of an entire 1940s western town. By Jada Yuan. July 19, 2023 at 5:00 a ... In Christopher Nolan's new film, \"Oppenheimer,\" Cillian Murphy stars as J. Robert Oppenheimer, the American physicist who oversaw the Manhattan Project in Los Alamos, N.M. Universal Pictures... Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. Christopher Nolan goes deep on 'Oppenheimer,' his most 'extreme' film to date. By Kenneth Turan. July 11, 2023 5 AM PT. For Subscribers. Christopher Nolan is photographed in Los Angeles ... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age.\nThought:",
      "stop": [
        "\nObservation:",
        "\n\tObservation:"
      ]
    }
    [llm/start] [1:RunTypeEnum.chain:AgentExecutor > 5:RunTypeEnum.chain:LLMChain > 6:RunTypeEnum.llm:ChatOpenAI] Entering LLM run with input:
    {
      "prompts": [
        "Human: Answer the following questions as best you can. You have access to the following tools:\n\nduckduckgo_search: A wrapper around DuckDuckGo Search. Useful for when you need to answer questions about current events. Input should be a search query.\nCalculator: Useful for when you need to answer questions about math.\n\nUse the following format:\n\nQuestion: the input question you must answer\nThought: you should always think about what to do\nAction: the action to take, should be one of [duckduckgo_search, Calculator]\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question\n\nBegin!\n\nQuestion: Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?\nThought:I need to find out who directed the 2023 film Oppenheimer and their age. Then, I need to calculate their age in days. I will use DuckDuckGo to find out the director and their age.\nAction: duckduckgo_search\nAction Input: \"Director of the 2023 film Oppenheimer and their age\"\nObservation: Capturing the mad scramble to build the first atomic bomb required rapid-fire filming, strict set rules and the construction of an entire 1940s western town. By Jada Yuan. July 19, 2023 at 5:00 a ... In Christopher Nolan's new film, \"Oppenheimer,\" Cillian Murphy stars as J. Robert Oppenheimer, the American physicist who oversaw the Manhattan Project in Los Alamos, N.M. Universal Pictures... Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. Christopher Nolan goes deep on 'Oppenheimer,' his most 'extreme' film to date. By Kenneth Turan. July 11, 2023 5 AM PT. For Subscribers. Christopher Nolan is photographed in Los Angeles ... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age.\nThought:"
      ]
    }
    [llm/end] [1:RunTypeEnum.chain:AgentExecutor > 5:RunTypeEnum.chain:LLMChain > 6:RunTypeEnum.llm:ChatOpenAI] [4.46s] Exiting LLM run with output:
    {
      "generations": [
        [
          {
            "text": "The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his age.\nAction: duckduckgo_search\nAction Input: \"Christopher Nolan age\"",
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
                "content": "The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his age.\nAction: duckduckgo_search\nAction Input: \"Christopher Nolan age\"",
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
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 5:RunTypeEnum.chain:LLMChain] [4.46s] Exiting Chain run with output:
    {
      "text": "The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his age.\nAction: duckduckgo_search\nAction Input: \"Christopher Nolan age\""
    }
    [tool/start] [1:RunTypeEnum.chain:AgentExecutor > 7:RunTypeEnum.tool:duckduckgo_search] Entering Tool run with input:
    "Christopher Nolan age"
    [tool/end] [1:RunTypeEnum.chain:AgentExecutor > 7:RunTypeEnum.tool:duckduckgo_search] [1.33s] Exiting Tool run with output:
    "Christopher Edward Nolan CBE (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide. The recipient of many accolades, he has been nominated for five Academy Awards, five BAFTA Awards and six Golden Globe Awards. July 30, 1970 (age 52) London England Notable Works: "Dunkirk" "Tenet" "The Prestige" See all related content → Recent News Jul. 13, 2023, 11:11 AM ET (AP) Cillian Murphy, playing Oppenheimer, finally gets to lead a Christopher Nolan film July 11, 2023 5 AM PT For Subscribers Christopher Nolan is photographed in Los Angeles. (Joe Pugliese / For The Times) This is not the story I was supposed to write. Oppenheimer director Christopher Nolan, Cillian Murphy, Emily Blunt and Matt Damon on the stakes of making a three-hour, CGI-free summer film. Christopher Nolan, the director behind such films as "Dunkirk," "Inception," "Interstellar," and the "Dark Knight" trilogy, has spent the last three years living in Oppenheimer's world, writing ..."
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 8:RunTypeEnum.chain:LLMChain] Entering Chain run with input:
    {
      "input": "Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?",
      "agent_scratchpad": "I need to find out who directed the 2023 film Oppenheimer and their age. Then, I need to calculate their age in days. I will use DuckDuckGo to find out the director and their age.\nAction: duckduckgo_search\nAction Input: \"Director of the 2023 film Oppenheimer and their age\"\nObservation: Capturing the mad scramble to build the first atomic bomb required rapid-fire filming, strict set rules and the construction of an entire 1940s western town. By Jada Yuan. July 19, 2023 at 5:00 a ... In Christopher Nolan's new film, \"Oppenheimer,\" Cillian Murphy stars as J. Robert Oppenheimer, the American physicist who oversaw the Manhattan Project in Los Alamos, N.M. Universal Pictures... Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. Christopher Nolan goes deep on 'Oppenheimer,' his most 'extreme' film to date. By Kenneth Turan. July 11, 2023 5 AM PT. For Subscribers. Christopher Nolan is photographed in Los Angeles ... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age.\nThought:The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his age.\nAction: duckduckgo_search\nAction Input: \"Christopher Nolan age\"\nObservation: Christopher Edward Nolan CBE (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide. The recipient of many accolades, he has been nominated for five Academy Awards, five BAFTA Awards and six Golden Globe Awards. July 30, 1970 (age 52) London England Notable Works: \"Dunkirk\" \"Tenet\" \"The Prestige\" See all related content → Recent News Jul. 13, 2023, 11:11 AM ET (AP) Cillian Murphy, playing Oppenheimer, finally gets to lead a Christopher Nolan film July 11, 2023 5 AM PT For Subscribers Christopher Nolan is photographed in Los Angeles. (Joe Pugliese / For The Times) This is not the story I was supposed to write. Oppenheimer director Christopher Nolan, Cillian Murphy, Emily Blunt and Matt Damon on the stakes of making a three-hour, CGI-free summer film. Christopher Nolan, the director behind such films as \"Dunkirk,\" \"Inception,\" \"Interstellar,\" and the \"Dark Knight\" trilogy, has spent the last three years living in Oppenheimer's world, writing ...\nThought:",
      "stop": [
        "\nObservation:",
        "\n\tObservation:"
      ]
    }
    [llm/start] [1:RunTypeEnum.chain:AgentExecutor > 8:RunTypeEnum.chain:LLMChain > 9:RunTypeEnum.llm:ChatOpenAI] Entering LLM run with input:
    {
      "prompts": [
        "Human: Answer the following questions as best you can. You have access to the following tools:\n\nduckduckgo_search: A wrapper around DuckDuckGo Search. Useful for when you need to answer questions about current events. Input should be a search query.\nCalculator: Useful for when you need to answer questions about math.\n\nUse the following format:\n\nQuestion: the input question you must answer\nThought: you should always think about what to do\nAction: the action to take, should be one of [duckduckgo_search, Calculator]\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question\n\nBegin!\n\nQuestion: Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?\nThought:I need to find out who directed the 2023 film Oppenheimer and their age. Then, I need to calculate their age in days. I will use DuckDuckGo to find out the director and their age.\nAction: duckduckgo_search\nAction Input: \"Director of the 2023 film Oppenheimer and their age\"\nObservation: Capturing the mad scramble to build the first atomic bomb required rapid-fire filming, strict set rules and the construction of an entire 1940s western town. By Jada Yuan. July 19, 2023 at 5:00 a ... In Christopher Nolan's new film, \"Oppenheimer,\" Cillian Murphy stars as J. Robert Oppenheimer, the American physicist who oversaw the Manhattan Project in Los Alamos, N.M. Universal Pictures... Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. Christopher Nolan goes deep on 'Oppenheimer,' his most 'extreme' film to date. By Kenneth Turan. July 11, 2023 5 AM PT. For Subscribers. Christopher Nolan is photographed in Los Angeles ... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age.\nThought:The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his age.\nAction: duckduckgo_search\nAction Input: \"Christopher Nolan age\"\nObservation: Christopher Edward Nolan CBE (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide. The recipient of many accolades, he has been nominated for five Academy Awards, five BAFTA Awards and six Golden Globe Awards. July 30, 1970 (age 52) London England Notable Works: \"Dunkirk\" \"Tenet\" \"The Prestige\" See all related content → Recent News Jul. 13, 2023, 11:11 AM ET (AP) Cillian Murphy, playing Oppenheimer, finally gets to lead a Christopher Nolan film July 11, 2023 5 AM PT For Subscribers Christopher Nolan is photographed in Los Angeles. (Joe Pugliese / For The Times) This is not the story I was supposed to write. Oppenheimer director Christopher Nolan, Cillian Murphy, Emily Blunt and Matt Damon on the stakes of making a three-hour, CGI-free summer film. Christopher Nolan, the director behind such films as \"Dunkirk,\" \"Inception,\" \"Interstellar,\" and the \"Dark Knight\" trilogy, has spent the last three years living in Oppenheimer's world, writing ...\nThought:"
      ]
    }
    [llm/end] [1:RunTypeEnum.chain:AgentExecutor > 8:RunTypeEnum.chain:LLMChain > 9:RunTypeEnum.llm:ChatOpenAI] [2.69s] Exiting LLM run with output:
    {
      "generations": [
        [
          {
            "text": "Christopher Nolan was born on July 30, 1970, which makes him 52 years old in 2023. Now I need to calculate his age in days.\nAction: Calculator\nAction Input: 52*365",
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
                "content": "Christopher Nolan was born on July 30, 1970, which makes him 52 years old in 2023. Now I need to calculate his age in days.\nAction: Calculator\nAction Input: 52*365",
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
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 8:RunTypeEnum.chain:LLMChain] [2.69s] Exiting Chain run with output:
    {
      "text": "Christopher Nolan was born on July 30, 1970, which makes him 52 years old in 2023. Now I need to calculate his age in days.\nAction: Calculator\nAction Input: 52*365"
    }
    [tool/start] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator] Entering Tool run with input:
    "52*365"
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain] Entering Chain run with input:
    {
      "question": "52*365"
    }
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain > 12:RunTypeEnum.chain:LLMChain] Entering Chain run with input:
    {
      "question": "52*365",
      "stop": [
        "```output"
      ]
    }
    [llm/start] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain > 12:RunTypeEnum.chain:LLMChain > 13:RunTypeEnum.llm:ChatOpenAI] Entering LLM run with input:
    {
      "prompts": [
        "Human: Translate a math problem into a expression that can be executed using Python's numexpr library. Use the output of running this code to answer the question.\n\nQuestion: ${Question with math problem.}\n```text\n${single line mathematical expression that solves the problem}\n```\n...numexpr.evaluate(text)...\n```output\n${Output of running the code}\n```\nAnswer: ${Answer}\n\nBegin.\n\nQuestion: What is 37593 * 67?\n```text\n37593 * 67\n```\n...numexpr.evaluate(\"37593 * 67\")...\n```output\n2518731\n```\nAnswer: 2518731\n\nQuestion: 37593^(1/5)\n```text\n37593**(1/5)\n```\n...numexpr.evaluate(\"37593**(1/5)\")...\n```output\n8.222831614237718\n```\nAnswer: 8.222831614237718\n\nQuestion: 52*365"
      ]
    }
    [llm/end] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain > 12:RunTypeEnum.chain:LLMChain > 13:RunTypeEnum.llm:ChatOpenAI] [2.89s] Exiting LLM run with output:
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
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain > 12:RunTypeEnum.chain:LLMChain] [2.89s] Exiting Chain run with output:
    {
      "text": "```text\n52*365\n```\n...numexpr.evaluate(\"52*365\")...\n"
    }
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator > 11:RunTypeEnum.chain:LLMMathChain] [2.90s] Exiting Chain run with output:
    {
      "answer": "Answer: 18980"
    }
    [tool/end] [1:RunTypeEnum.chain:AgentExecutor > 10:RunTypeEnum.tool:Calculator] [2.90s] Exiting Tool run with output:
    "Answer: 18980"
    [chain/start] [1:RunTypeEnum.chain:AgentExecutor > 14:RunTypeEnum.chain:LLMChain] Entering Chain run with input:
    {
      "input": "Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?",
      "agent_scratchpad": "I need to find out who directed the 2023 film Oppenheimer and their age. Then, I need to calculate their age in days. I will use DuckDuckGo to find out the director and their age.\nAction: duckduckgo_search\nAction Input: \"Director of the 2023 film Oppenheimer and their age\"\nObservation: Capturing the mad scramble to build the first atomic bomb required rapid-fire filming, strict set rules and the construction of an entire 1940s western town. By Jada Yuan. July 19, 2023 at 5:00 a ... In Christopher Nolan's new film, \"Oppenheimer,\" Cillian Murphy stars as J. Robert Oppenheimer, the American physicist who oversaw the Manhattan Project in Los Alamos, N.M. Universal Pictures... Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. Christopher Nolan goes deep on 'Oppenheimer,' his most 'extreme' film to date. By Kenneth Turan. July 11, 2023 5 AM PT. For Subscribers. Christopher Nolan is photographed in Los Angeles ... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age.\nThought:The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his age.\nAction: duckduckgo_search\nAction Input: \"Christopher Nolan age\"\nObservation: Christopher Edward Nolan CBE (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide. The recipient of many accolades, he has been nominated for five Academy Awards, five BAFTA Awards and six Golden Globe Awards. July 30, 1970 (age 52) London England Notable Works: \"Dunkirk\" \"Tenet\" \"The Prestige\" See all related content → Recent News Jul. 13, 2023, 11:11 AM ET (AP) Cillian Murphy, playing Oppenheimer, finally gets to lead a Christopher Nolan film July 11, 2023 5 AM PT For Subscribers Christopher Nolan is photographed in Los Angeles. (Joe Pugliese / For The Times) This is not the story I was supposed to write. Oppenheimer director Christopher Nolan, Cillian Murphy, Emily Blunt and Matt Damon on the stakes of making a three-hour, CGI-free summer film. Christopher Nolan, the director behind such films as \"Dunkirk,\" \"Inception,\" \"Interstellar,\" and the \"Dark Knight\" trilogy, has spent the last three years living in Oppenheimer's world, writing ...\nThought:Christopher Nolan was born on July 30, 1970, which makes him 52 years old in 2023. Now I need to calculate his age in days.\nAction: Calculator\nAction Input: 52*365\nObservation: Answer: 18980\nThought:",
      "stop": [
        "\nObservation:",
        "\n\tObservation:"
      ]
    }
    [llm/start] [1:RunTypeEnum.chain:AgentExecutor > 14:RunTypeEnum.chain:LLMChain > 15:RunTypeEnum.llm:ChatOpenAI] Entering LLM run with input:
    {
      "prompts": [
        "Human: Answer the following questions as best you can. You have access to the following tools:\n\nduckduckgo_search: A wrapper around DuckDuckGo Search. Useful for when you need to answer questions about current events. Input should be a search query.\nCalculator: Useful for when you need to answer questions about math.\n\nUse the following format:\n\nQuestion: the input question you must answer\nThought: you should always think about what to do\nAction: the action to take, should be one of [duckduckgo_search, Calculator]\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question\n\nBegin!\n\nQuestion: Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?\nThought:I need to find out who directed the 2023 film Oppenheimer and their age. Then, I need to calculate their age in days. I will use DuckDuckGo to find out the director and their age.\nAction: duckduckgo_search\nAction Input: \"Director of the 2023 film Oppenheimer and their age\"\nObservation: Capturing the mad scramble to build the first atomic bomb required rapid-fire filming, strict set rules and the construction of an entire 1940s western town. By Jada Yuan. July 19, 2023 at 5:00 a ... In Christopher Nolan's new film, \"Oppenheimer,\" Cillian Murphy stars as J. Robert Oppenheimer, the American physicist who oversaw the Manhattan Project in Los Alamos, N.M. Universal Pictures... Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. Christopher Nolan goes deep on 'Oppenheimer,' his most 'extreme' film to date. By Kenneth Turan. July 11, 2023 5 AM PT. For Subscribers. Christopher Nolan is photographed in Los Angeles ... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age.\nThought:The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his age.\nAction: duckduckgo_search\nAction Input: \"Christopher Nolan age\"\nObservation: Christopher Edward Nolan CBE (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide. The recipient of many accolades, he has been nominated for five Academy Awards, five BAFTA Awards and six Golden Globe Awards. July 30, 1970 (age 52) London England Notable Works: \"Dunkirk\" \"Tenet\" \"The Prestige\" See all related content → Recent News Jul. 13, 2023, 11:11 AM ET (AP) Cillian Murphy, playing Oppenheimer, finally gets to lead a Christopher Nolan film July 11, 2023 5 AM PT For Subscribers Christopher Nolan is photographed in Los Angeles. (Joe Pugliese / For The Times) This is not the story I was supposed to write. Oppenheimer director Christopher Nolan, Cillian Murphy, Emily Blunt and Matt Damon on the stakes of making a three-hour, CGI-free summer film. Christopher Nolan, the director behind such films as \"Dunkirk,\" \"Inception,\" \"Interstellar,\" and the \"Dark Knight\" trilogy, has spent the last three years living in Oppenheimer's world, writing ...\nThought:Christopher Nolan was born on July 30, 1970, which makes him 52 years old in 2023. Now I need to calculate his age in days.\nAction: Calculator\nAction Input: 52*365\nObservation: Answer: 18980\nThought:"
      ]
    }
    [llm/end] [1:RunTypeEnum.chain:AgentExecutor > 14:RunTypeEnum.chain:LLMChain > 15:RunTypeEnum.llm:ChatOpenAI] [3.52s] Exiting LLM run with output:
    {
      "generations": [
        [
          {
            "text": "I now know the final answer\nFinal Answer: The director of the 2023 film Oppenheimer is Christopher Nolan and he is 52 years old. His age in days is approximately 18980 days.",
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
                "content": "I now know the final answer\nFinal Answer: The director of the 2023 film Oppenheimer is Christopher Nolan and he is 52 years old. His age in days is approximately 18980 days.",
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
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor > 14:RunTypeEnum.chain:LLMChain] [3.52s] Exiting Chain run with output:
    {
      "text": "I now know the final answer\nFinal Answer: The director of the 2023 film Oppenheimer is Christopher Nolan and he is 52 years old. His age in days is approximately 18980 days."
    }
    [chain/end] [1:RunTypeEnum.chain:AgentExecutor] [21.96s] Exiting Chain run with output:
    {
      "output": "The director of the 2023 film Oppenheimer is Christopher Nolan and he is 52 years old. His age in days is approximately 18980 days."
    }





    'The director of the 2023 film Oppenheimer is Christopher Nolan and he is 52 years old. His age in days is approximately 18980 days.'
```

</details>

### `set_verbose(True)`

`verbose` फ्लैग को सेट करने से थोड़ा अधिक पठनीय प्रारूप में इनपुट और आउटपुट प्रिंट होंगे और कुछ कच्चे आउटपुट (जैसे एक एलएलएम कॉल के लिए टोकन उपयोग आंकड़े) को छोड़ दिया जाएगा ताकि आप अनुप्रयोग तर्क पर ध्यान केंद्रित कर सकें।

```python
<!--IMPORTS:[{"imported": "set_verbose", "source": "langchain.globals", "docs": "https://api.python.langchain.com/en/latest/globals/langchain.globals.set_verbose.html", "title": "Debugging"}]-->
from langchain.globals import set_verbose

set_verbose(True)

agent.run("Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?")
```

<details> <summary>कंसोल आउटपुट</summary>

```output
    > Entering new AgentExecutor chain...


    > Entering new LLMChain chain...
    Prompt after formatting:
    Answer the following questions as best you can. You have access to the following tools:

    duckduckgo_search: A wrapper around DuckDuckGo Search. Useful for when you need to answer questions about current events. Input should be a search query.
    Calculator: Useful for when you need to answer questions about math.

    Use the following format:

    Question: the input question you must answer
    Thought: you should always think about what to do
    Action: the action to take, should be one of [duckduckgo_search, Calculator]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question

    Begin!

    Question: Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?
    Thought:

    > Finished chain.
    First, I need to find out who directed the film Oppenheimer in 2023 and their birth date to calculate their age.
    Action: duckduckgo_search
    Action Input: "Director of the 2023 film Oppenheimer"
    Observation: Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. In Christopher Nolan's new film, "Oppenheimer," Cillian Murphy stars as J. Robert ... 2023, 12:16 p.m. ET. ... including his role as the director of the Manhattan Engineer District, better ... J Robert Oppenheimer was the director of the secret Los Alamos Laboratory. It was established under US president Franklin D Roosevelt as part of the Manhattan Project to build the first atomic bomb. He oversaw the first atomic bomb detonation in the New Mexico desert in July 1945, code-named "Trinity". In this opening salvo of 2023's Oscar battle, Nolan has enjoined a star-studded cast for a retelling of the brilliant and haunted life of J. Robert Oppenheimer, the American physicist whose... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age.
    Thought:

    > Entering new LLMChain chain...
    Prompt after formatting:
    Answer the following questions as best you can. You have access to the following tools:

    duckduckgo_search: A wrapper around DuckDuckGo Search. Useful for when you need to answer questions about current events. Input should be a search query.
    Calculator: Useful for when you need to answer questions about math.

    Use the following format:

    Question: the input question you must answer
    Thought: you should always think about what to do
    Action: the action to take, should be one of [duckduckgo_search, Calculator]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question

    Begin!

    Question: Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?
    Thought:First, I need to find out who directed the film Oppenheimer in 2023 and their birth date to calculate their age.
    Action: duckduckgo_search
    Action Input: "Director of the 2023 film Oppenheimer"
    Observation: Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. In Christopher Nolan's new film, "Oppenheimer," Cillian Murphy stars as J. Robert ... 2023, 12:16 p.m. ET. ... including his role as the director of the Manhattan Engineer District, better ... J Robert Oppenheimer was the director of the secret Los Alamos Laboratory. It was established under US president Franklin D Roosevelt as part of the Manhattan Project to build the first atomic bomb. He oversaw the first atomic bomb detonation in the New Mexico desert in July 1945, code-named "Trinity". In this opening salvo of 2023's Oscar battle, Nolan has enjoined a star-studded cast for a retelling of the brilliant and haunted life of J. Robert Oppenheimer, the American physicist whose... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age.
    Thought:

    > Finished chain.
    The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his birth date to calculate his age.
    Action: duckduckgo_search
    Action Input: "Christopher Nolan birth date"
    Observation: July 30, 1970 (age 52) London England Notable Works: "Dunkirk" "Tenet" "The Prestige" See all related content → Recent News Jul. 13, 2023, 11:11 AM ET (AP) Cillian Murphy, playing Oppenheimer, finally gets to lead a Christopher Nolan film Christopher Edward Nolan CBE (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide. The recipient of many accolades, he has been nominated for five Academy Awards, five BAFTA Awards and six Golden Globe Awards. Christopher Nolan is currently 52 according to his birthdate July 30, 1970 Sun Sign Leo Born Place Westminster, London, England, United Kingdom Residence Los Angeles, California, United States Nationality Education Chris attended Haileybury and Imperial Service College, in Hertford Heath, Hertfordshire. Christopher Nolan's next movie will study the man who developed the atomic bomb, J. Robert Oppenheimer. Here's the release date, plot, trailers & more. July 2023 sees the release of Christopher Nolan's new film, Oppenheimer, his first movie since 2020's Tenet and his split from Warner Bros. Billed as an epic thriller about "the man who ...
    Thought:

    > Entering new LLMChain chain...
    Prompt after formatting:
    Answer the following questions as best you can. You have access to the following tools:

    duckduckgo_search: A wrapper around DuckDuckGo Search. Useful for when you need to answer questions about current events. Input should be a search query.
    Calculator: Useful for when you need to answer questions about math.

    Use the following format:

    Question: the input question you must answer
    Thought: you should always think about what to do
    Action: the action to take, should be one of [duckduckgo_search, Calculator]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question

    Begin!

    Question: Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?
    Thought:First, I need to find out who directed the film Oppenheimer in 2023 and their birth date to calculate their age.
    Action: duckduckgo_search
    Action Input: "Director of the 2023 film Oppenheimer"
    Observation: Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. In Christopher Nolan's new film, "Oppenheimer," Cillian Murphy stars as J. Robert ... 2023, 12:16 p.m. ET. ... including his role as the director of the Manhattan Engineer District, better ... J Robert Oppenheimer was the director of the secret Los Alamos Laboratory. It was established under US president Franklin D Roosevelt as part of the Manhattan Project to build the first atomic bomb. He oversaw the first atomic bomb detonation in the New Mexico desert in July 1945, code-named "Trinity". In this opening salvo of 2023's Oscar battle, Nolan has enjoined a star-studded cast for a retelling of the brilliant and haunted life of J. Robert Oppenheimer, the American physicist whose... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age.
    Thought:The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his birth date to calculate his age.
    Action: duckduckgo_search
    Action Input: "Christopher Nolan birth date"
    Observation: July 30, 1970 (age 52) London England Notable Works: "Dunkirk" "Tenet" "The Prestige" See all related content → Recent News Jul. 13, 2023, 11:11 AM ET (AP) Cillian Murphy, playing Oppenheimer, finally gets to lead a Christopher Nolan film Christopher Edward Nolan CBE (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide. The recipient of many accolades, he has been nominated for five Academy Awards, five BAFTA Awards and six Golden Globe Awards. Christopher Nolan is currently 52 according to his birthdate July 30, 1970 Sun Sign Leo Born Place Westminster, London, England, United Kingdom Residence Los Angeles, California, United States Nationality Education Chris attended Haileybury and Imperial Service College, in Hertford Heath, Hertfordshire. Christopher Nolan's next movie will study the man who developed the atomic bomb, J. Robert Oppenheimer. Here's the release date, plot, trailers & more. July 2023 sees the release of Christopher Nolan's new film, Oppenheimer, his first movie since 2020's Tenet and his split from Warner Bros. Billed as an epic thriller about "the man who ...
    Thought:

    > Finished chain.
    Christopher Nolan was born on July 30, 1970. Now I need to calculate his age in 2023 and then convert it into days.
    Action: Calculator
    Action Input: (2023 - 1970) * 365

    > Entering new LLMMathChain chain...
    (2023 - 1970) * 365

    > Entering new LLMChain chain...
    Prompt after formatting:
    Translate a math problem into a expression that can be executed using Python's numexpr library. Use the output of running this code to answer the question.

    Question: ${Question with math problem.}
    ```text
    ${single line mathematical expression that solves the problem}
    ```
    ...numexpr.evaluate(text)...
    ```output
    ${Output of running the code}
    ```
    Answer: ${Answer}

    Begin.

    Question: What is 37593 * 67?
    ```text
    37593 * 67
    ```
    ...numexpr.evaluate("37593 * 67")...
    ```output
    2518731
    ```
    Answer: 2518731

    Question: 37593^(1/5)
    ```text
    37593**(1/5)
    ```
    ...numexpr.evaluate("37593**(1/5)")...
    ```output
    8.222831614237718
    ```
    Answer: 8.222831614237718

    Question: (2023 - 1970) * 365


    > Finished chain.
    ```text
    (2023 - 1970) * 365
    ```
    ...numexpr.evaluate("(2023 - 1970) * 365")...

    Answer: 19345
    > Finished chain.

    Observation: Answer: 19345
    Thought:

    > Entering new LLMChain chain...
    Prompt after formatting:
    Answer the following questions as best you can. You have access to the following tools:

    duckduckgo_search: A wrapper around DuckDuckGo Search. Useful for when you need to answer questions about current events. Input should be a search query.
    Calculator: Useful for when you need to answer questions about math.

    Use the following format:

    Question: the input question you must answer
    Thought: you should always think about what to do
    Action: the action to take, should be one of [duckduckgo_search, Calculator]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question

    Begin!

    Question: Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?
    Thought:First, I need to find out who directed the film Oppenheimer in 2023 and their birth date to calculate their age.
    Action: duckduckgo_search
    Action Input: "Director of the 2023 film Oppenheimer"
    Observation: Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. In Christopher Nolan's new film, "Oppenheimer," Cillian Murphy stars as J. Robert ... 2023, 12:16 p.m. ET. ... including his role as the director of the Manhattan Engineer District, better ... J Robert Oppenheimer was the director of the secret Los Alamos Laboratory. It was established under US president Franklin D Roosevelt as part of the Manhattan Project to build the first atomic bomb. He oversaw the first atomic bomb detonation in the New Mexico desert in July 1945, code-named "Trinity". In this opening salvo of 2023's Oscar battle, Nolan has enjoined a star-studded cast for a retelling of the brilliant and haunted life of J. Robert Oppenheimer, the American physicist whose... Oppenheimer is a 2023 epic biographical thriller film written and directed by Christopher Nolan.It is based on the 2005 biography American Prometheus by Kai Bird and Martin J. Sherwin about J. Robert Oppenheimer, a theoretical physicist who was pivotal in developing the first nuclear weapons as part of the Manhattan Project and thereby ushering in the Atomic Age.
    Thought:The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his birth date to calculate his age.
    Action: duckduckgo_search
    Action Input: "Christopher Nolan birth date"
    Observation: July 30, 1970 (age 52) London England Notable Works: "Dunkirk" "Tenet" "The Prestige" See all related content → Recent News Jul. 13, 2023, 11:11 AM ET (AP) Cillian Murphy, playing Oppenheimer, finally gets to lead a Christopher Nolan film Christopher Edward Nolan CBE (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide. The recipient of many accolades, he has been nominated for five Academy Awards, five BAFTA Awards and six Golden Globe Awards. Christopher Nolan is currently 52 according to his birthdate July 30, 1970 Sun Sign Leo Born Place Westminster, London, England, United Kingdom Residence Los Angeles, California, United States Nationality Education Chris attended Haileybury and Imperial Service College, in Hertford Heath, Hertfordshire. Christopher Nolan's next movie will study the man who developed the atomic bomb, J. Robert Oppenheimer. Here's the release date, plot, trailers & more. July 2023 sees the release of Christopher Nolan's new film, Oppenheimer, his first movie since 2020's Tenet and his split from Warner Bros. Billed as an epic thriller about "the man who ...
    Thought:Christopher Nolan was born on July 30, 1970. Now I need to calculate his age in 2023 and then convert it into days.
    Action: Calculator
    Action Input: (2023 - 1970) * 365
    Observation: Answer: 19345
    Thought:

    > Finished chain.
    I now know the final answer
    Final Answer: The director of the 2023 film Oppenheimer is Christopher Nolan and he is 53 years old in 2023. His age in days is 19345 days.

    > Finished chain.


    'The director of the 2023 film Oppenheimer is Christopher Nolan and he is 53 years old in 2023. His age in days is 19345 days.'
```

</details>

### `Chain(..., verbose=True)`

आप एक व्यक्तिगत वस्तु के दायरे में वर्बोसिटी को भी सीमित कर सकते हैं, जिस मामले में केवल उस वस्तु के इनपुट और आउटपुट प्रिंट होंगे (साथ ही उस वस्तु द्वारा विशेष रूप से किए गए कोई अतिरिक्त कॉलबैक कॉल)।

```python
# Passing verbose=True to initialize_agent will pass that along to the AgentExecutor (which is a Chain).
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)

agent.run("Who directed the 2023 film Oppenheimer and what is their age? What is their age in days (assume 365 days per year)?")
```

<details> <summary>कंसोल आउटपुट</summary>

```output
    > Entering new AgentExecutor chain...
    First, I need to find out who directed the film Oppenheimer in 2023 and their birth date. Then, I can calculate their age in years and days.
    Action: duckduckgo_search
    Action Input: "Director of 2023 film Oppenheimer"
    Observation: Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. In Christopher Nolan's new film, "Oppenheimer," Cillian Murphy stars as J. Robert Oppenheimer, the American physicist who oversaw the Manhattan Project in Los Alamos, N.M. Universal Pictures... J Robert Oppenheimer was the director of the secret Los Alamos Laboratory. It was established under US president Franklin D Roosevelt as part of the Manhattan Project to build the first atomic bomb. He oversaw the first atomic bomb detonation in the New Mexico desert in July 1945, code-named "Trinity". A Review of Christopher Nolan's new film 'Oppenheimer' , the story of the man who fathered the Atomic Bomb. Cillian Murphy leads an all star cast ... Release Date: July 21, 2023. Director ... For his new film, "Oppenheimer," starring Cillian Murphy and Emily Blunt, director Christopher Nolan set out to build an entire 1940s western town.
    Thought:The director of the 2023 film Oppenheimer is Christopher Nolan. Now I need to find out his birth date to calculate his age.
    Action: duckduckgo_search
    Action Input: "Christopher Nolan birth date"
    Observation: July 30, 1970 (age 52) London England Notable Works: "Dunkirk" "Tenet" "The Prestige" See all related content → Recent News Jul. 13, 2023, 11:11 AM ET (AP) Cillian Murphy, playing Oppenheimer, finally gets to lead a Christopher Nolan film Christopher Edward Nolan CBE (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, Nolan is considered a leading filmmaker of the 21st century. His films have grossed $5 billion worldwide. The recipient of many accolades, he has been nominated for five Academy Awards, five BAFTA Awards and six Golden Globe Awards. Christopher Nolan is currently 52 according to his birthdate July 30, 1970 Sun Sign Leo Born Place Westminster, London, England, United Kingdom Residence Los Angeles, California, United States Nationality Education Chris attended Haileybury and Imperial Service College, in Hertford Heath, Hertfordshire. Christopher Nolan's next movie will study the man who developed the atomic bomb, J. Robert Oppenheimer. Here's the release date, plot, trailers & more. Date of Birth: 30 July 1970 . ... Christopher Nolan is a British-American film director, producer, and screenwriter. His films have grossed more than US$5 billion worldwide, and have garnered 11 Academy Awards from 36 nominations. ...
    Thought:Christopher Nolan was born on July 30, 1970. Now I can calculate his age in years and then in days.
    Action: Calculator
    Action Input: {"operation": "subtract", "operands": [2023, 1970]}
    Observation: Answer: 53
    Thought:Christopher Nolan is 53 years old in 2023. Now I need to calculate his age in days.
    Action: Calculator
    Action Input: {"operation": "multiply", "operands": [53, 365]}
    Observation: Answer: 19345
    Thought:I now know the final answer
    Final Answer: The director of the 2023 film Oppenheimer is Christopher Nolan. He is 53 years old in 2023, which is approximately 19345 days.

    > Finished chain.


    'The director of the 2023 film Oppenheimer is Christopher Nolan. He is 53 years old in 2023, which is approximately 19345 days.'
```

</details>

## अन्य कॉलबैक

`Callbacks` वह हैं जिनका उपयोग हम किसी भी कार्यक्षमता को मुख्य घटक तर्क के बाहर निष्पादित करने के लिए करते हैं। उपरोक्त सभी समाधान `Callbacks` का उपयोग करते हैं जो घटकों के मध्यवर्ती चरणों को लॉग करने के लिए नींव हैं। LangChain के साथ आने वाले कई `Callbacks` डीबगिंग के लिए प्रासंगिक हैं, जैसे [FileCallbackHandler](/docs/modules/callbacks/filecallbackhandler)। आप अपने कस्टम कार्यक्षमता को निष्पादित करने के लिए अपने कॉलबैक भी लागू कर सकते हैं।

[Callbacks](/docs/modules/callbacks/) के बारे में और अधिक जानकारी के लिए यहां देखें, उन्हें कैसे उपयोग करें और कस्टमाइज़ करें।
