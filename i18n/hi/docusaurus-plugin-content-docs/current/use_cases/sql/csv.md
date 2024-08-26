---
sidebar_position: 5
translated: true
---

# CSV

LLM (Language Learning Models) विभिन्न प्रकार के डेटा स्रोतों पर प्रश्न-उत्तर प्रणाली बनाने के लिए बहुत अच्छे हैं। इस खंड में हम CSV फ़ाइल(ों) में संग्रहीत डेटा पर Q&A प्रणाली कैसे बनाएं, इस पर चर्चा करेंगे। SQL डेटाबेस के साथ काम करने की तरह, CSV फ़ाइलों के साथ काम करने का कुंजी डेटा को क्वेरी और इंटरैक्ट करने के लिए उपकरण देना है। ऐसा करने के दो प्रमुख तरीके हैं:

* **अनुशंसित**: CSV(s) को SQL डेटाबेस में लोड करें, और [SQL use case docs](/docs/use_cases/sql/) में वर्णित दृष्टिकोण का उपयोग करें।
* LLM को ऐसे Python वातावरण तक पहुंच देना जहां वह Pandas जैसी लाइब्रेरी का उपयोग करके डेटा के साथ इंटरैक्ट कर सके।

## ⚠️ सुरक्षा नोट ⚠️

उपर्युक्त दोनों दृष्टिकोण में महत्वपूर्ण जोखिम हैं। SQL का उपयोग करने के लिए मॉडल-जनित SQL क्वेरी निष्पादित करने की आवश्यकता होती है। Pandas जैसी लाइब्रेरी का उपयोग करने के लिए मॉडल को Python कोड निष्पादित करने की अनुमति देनी होती है। चूंकि SQL कनेक्शन अनुमतियों को सीमित करना और SQL क्वेरी को सैनिटाइज करना Python वातावरण को सैंडबॉक्स करने से आसान है, **हम CSV डेटा के साथ SQL के माध्यम से इंटरैक्ट करने की बहुत अधिक सिफारिश करते हैं।** सामान्य सुरक्षा सर्वोत्तम प्रथाओं के बारे में अधिक जानकारी के लिए, [यहां देखें](/docs/security)।

## सेटअप

इस गाइड के लिए आवश्यक डिपेंडेंसी:

```python
%pip install -qU langchain langchain-openai langchain-community langchain-experimental pandas
```

आवश्यक वातावरण चर सेट करें:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Using LangSmith is recommended but not required. Uncomment below lines to use.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

[Titanic डेटासेट](https://www.kaggle.com/datasets/yasserh/titanic-dataset) डाउनलोड करें यदि आप पहले से नहीं हैं:

```python
!wget https://web.stanford.edu/class/archive/cs/cs109/cs109.1166/stuff/titanic.csv -O titanic.csv
```

```python
import pandas as pd

df = pd.read_csv("titanic.csv")
print(df.shape)
print(df.columns.tolist())
```

```output
(887, 8)
['Survived', 'Pclass', 'Name', 'Sex', 'Age', 'Siblings/Spouses Aboard', 'Parents/Children Aboard', 'Fare']
```

## SQL

CSV डेटा के साथ SQL के माध्यम से इंटरैक्ट करना अनुशंसित दृष्टिकोण है क्योंकि यह अनुमतियों को सीमित करना और क्वेरी को सैनिटाइज करना Python के साथ की तुलना में आसान है।

अधिकांश SQL डेटाबेस CSV फ़ाइल को एक तालिका के रूप में लोड करने में आसान बनाते हैं ([DuckDB](https://duckdb.org/docs/data/csv/overview.html), [SQLite](https://www.sqlite.org/csv.html) आदि)। एक बार ऐसा करने के बाद, आप [SQL use case guide](/docs/use_cases/sql/) में वर्णित सभी श्रृंखला और एजेंट-बनाने तकनीकों का उपयोग कर सकते हैं। यहाँ SQLite के साथ ऐसा करने का एक त्वरित उदाहरण है:

```python
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine

engine = create_engine("sqlite:///titanic.db")
df.to_sql("titanic", engine, index=False)
```

```output
887
```

```python
db = SQLDatabase(engine=engine)
print(db.dialect)
print(db.get_usable_table_names())
db.run("SELECT * FROM titanic WHERE Age < 2;")
```

```output
sqlite
['titanic']
```

```output
"[(1, 2, 'Master. Alden Gates Caldwell', 'male', 0.83, 0, 2, 29.0), (0, 3, 'Master. Eino Viljami Panula', 'male', 1.0, 4, 1, 39.6875), (1, 3, 'Miss. Eleanor Ileen Johnson', 'female', 1.0, 1, 1, 11.1333), (1, 2, 'Master. Richard F Becker', 'male', 1.0, 2, 1, 39.0), (1, 1, 'Master. Hudson Trevor Allison', 'male', 0.92, 1, 2, 151.55), (1, 3, 'Miss. Maria Nakid', 'female', 1.0, 0, 2, 15.7417), (0, 3, 'Master. Sidney Leonard Goodwin', 'male', 1.0, 5, 2, 46.9), (1, 3, 'Miss. Helene Barbara Baclini', 'female', 0.75, 2, 1, 19.2583), (1, 3, 'Miss. Eugenie Baclini', 'female', 0.75, 2, 1, 19.2583), (1, 2, 'Master. Viljo Hamalainen', 'male', 0.67, 1, 1, 14.5), (1, 3, 'Master. Bertram Vere Dean', 'male', 1.0, 1, 2, 20.575), (1, 3, 'Master. Assad Alexander Thomas', 'male', 0.42, 0, 1, 8.5167), (1, 2, 'Master. Andre Mallet', 'male', 1.0, 0, 2, 37.0042), (1, 2, 'Master. George Sibley Richards', 'male', 0.83, 1, 1, 18.75)]"
```

और इससे इंटरैक्ट करने के लिए एक [SQL एजेंट](/docs/use_cases/sql/agents) बनाएं:

```python
from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)
```

```python
agent_executor.invoke({"input": "what's the average age of survivors"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_list_tables` with `{}`


[0m[38;5;200m[1;3mtitanic[0m[32;1m[1;3m
Invoking: `sql_db_schema` with `{'table_names': 'titanic'}`


[0m[33;1m[1;3m
CREATE TABLE titanic (
	"Survived" BIGINT,
	"Pclass" BIGINT,
	"Name" TEXT,
	"Sex" TEXT,
	"Age" FLOAT,
	"Siblings/Spouses Aboard" BIGINT,
	"Parents/Children Aboard" BIGINT,
	"Fare" FLOAT
)

/*
3 rows from titanic table:
Survived	Pclass	Name	Sex	Age	Siblings/Spouses Aboard	Parents/Children Aboard	Fare
0	3	Mr. Owen Harris Braund	male	22.0	1	0	7.25
1	1	Mrs. John Bradley (Florence Briggs Thayer) Cumings	female	38.0	1	0	71.2833
1	3	Miss. Laina Heikkinen	female	26.0	0	0	7.925
*/[0m[32;1m[1;3m
Invoking: `sql_db_query` with `{'query': 'SELECT AVG(Age) AS AverageAge FROM titanic WHERE Survived = 1'}`
responded: To find the average age of survivors, I will query the "titanic" table and calculate the average of the "Age" column for the rows where "Survived" is equal to 1.

Here is the SQL query:

    ```sql
    SELECT AVG(Age) AS AverageAge
    FROM titanic
    WHERE Survived = 1
    ```

Executing this query will give us the average age of the survivors.

[0m[36;1m[1;3m[(28.408391812865496,)][0m[32;1m[1;3mThe average age of the survivors is approximately 28.41 years.[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's the average age of survivors",
 'output': 'The average age of the survivors is approximately 28.41 years.'}
```

यह दृष्टिकोण कई CSV फ़ाइलों पर आसानी से सामान्यीकृत हो जाता है, क्योंकि हम प्रत्येक को अपने डेटाबेस में अपनी खुद की तालिका के रूप में लोड कर सकते हैं। [SQL गाइड](/docs/use_cases/sql/) पर और अधिक जानकारी के लिए जाएं।

## Pandas

SQL के बजाय, हम पैंडास जैसी डेटा विश्लेषण लाइब्रेरियों और LLM की कोड जनन क्षमताओं का उपयोग करके भी CSV डेटा के साथ इंटरैक्ट कर सकते हैं। फिर भी, **यह दृष्टिकोण उत्पादन उपयोग मामलों के लिए उपयुक्त नहीं है जब तक कि आपके पास व्यापक सुरक्षा उपाय न हों।** इस कारण से, हमारे कोड-निष्पादन उपकरण और निर्माता `langchain-experimental` पैकेज में हैं।

### श्रृंखला

अधिकांश LLM पैंडास Python कोड पर इतना प्रशिक्षित हैं कि वे केवल उससे पूछे जाने पर ही उत्पन्न कर सकते हैं:

```python
ai_msg = llm.invoke(
    "I have a pandas DataFrame 'df' with columns 'Age' and 'Fare'. Write code to compute the correlation between the two columns. Return Markdown for a Python code snippet and nothing else."
)
print(ai_msg.content)
```

```output
    ```python
    correlation = df['Age'].corr(df['Fare'])
    correlation
    ```
```

हम इस क्षमता को Python-निष्पादन उपकरण के साथ संयोजित कर सकते हैं ताकि एक सरल डेटा विश्लेषण श्रृंखला बना सकें। हम पहले अपने CSV टेबल को एक dataframe के रूप में लोड करना चाहेंगे, और इस dataframe तक उपकरण की पहुंच देंगे:

```python
import pandas as pd
from langchain_core.prompts import ChatPromptTemplate
from langchain_experimental.tools import PythonAstREPLTool

df = pd.read_csv("titanic.csv")
tool = PythonAstREPLTool(locals={"df": df})
tool.invoke("df['Fare'].mean()")
```

```output
32.30542018038331
```

हमारे Python उपकरण के उचित उपयोग को प्रवर्तित करने में मदद करने के लिए, हम [function calling](/docs/modules/model_io/chat/function_calling) का उपयोग करेंगे:

```python
llm_with_tools = llm.bind_tools([tool], tool_choice=tool.name)
llm_with_tools.invoke(
    "I have a dataframe 'df' and want to know the correlation between the 'Age' and 'Fare' columns"
)
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_6TZsNaCqOcbP7lqWudosQTd6', 'function': {'arguments': '{\n  "query": "df[[\'Age\', \'Fare\']].corr()"\n}', 'name': 'python_repl_ast'}, 'type': 'function'}]})
```

हम [OpenAI tools output parser](/docs/modules/model_io/output_parsers/types/openai_tools) जोड़ेंगे ताकि फ़ंक्शन कॉल को एक डिक्शनरी के रूप में निकाल सकें:

```python
from langchain.output_parsers.openai_tools import JsonOutputKeyToolsParser

parser = JsonOutputKeyToolsParser(tool.name, first_tool_only=True)
(llm_with_tools | parser).invoke(
    "I have a dataframe 'df' and want to know the correlation between the 'Age' and 'Fare' columns"
)
```

```output
{'query': "df[['Age', 'Fare']].corr()"}
```

और प्रोम्प्ट के साथ संयोजित करें ताकि हम हर बार dataframe जानकारी निर्दिष्ट करने की आवश्यकता के बिना केवल एक प्रश्न निर्दिष्ट कर सकें:

```python
system = f"""You have access to a pandas dataframe `df`. \
Here is the output of `df.head().to_markdown()`:

    ```
    {df.head().to_markdown()}
    ```

Given a user question, write the Python code to answer it. \
Return ONLY the valid Python code and nothing else. \
Don't assume you have access to any libraries other than built-in Python ones and pandas."""
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", "{question}")])
code_chain = prompt | llm_with_tools | parser
code_chain.invoke({"question": "What's the correlation between age and fare"})
```

```output
{'query': "df[['Age', 'Fare']].corr()"}
```

और अंत में, हम अपने Python उपकरण को जोड़ेंगे ताकि उत्पन्न कोड वास्तव में निष्पादित किया जा सके:

```python
chain = prompt | llm_with_tools | parser | tool  # noqa
chain.invoke({"question": "What's the correlation between age and fare"})
```

```output
0.11232863699941621
```

और इसके साथ ही हमारे पास एक सरल डेटा विश्लेषण श्रृंखला है। हम LangSmith ट्रेस देखकर मध्यवर्ती चरणों को देख सकते हैं: https://smith.langchain.com/public/b1309290-7212-49b7-bde2-75b39a32b49a/r

हम अंत में एक वार्तालाप प्रतिक्रिया उत्पन्न करने के लिए एक अतिरिक्त LLM कॉल जोड़ सकते हैं, ताकि हम केवल उपकरण आउटपुट के साथ प्रतिक्रिया न दें। इसके लिए हमें अपने प्रोम्प्ट में एक चैट इतिहास `MessagesPlaceholder` जोड़ना होगा:

```python
from operator import itemgetter

from langchain_core.messages import ToolMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough

system = f"""You have access to a pandas dataframe `df`. \
Here is the output of `df.head().to_markdown()`:

    ```
    {df.head().to_markdown()}
    ```

Given a user question, write the Python code to answer it. \
Don't assume you have access to any libraries other than built-in Python ones and pandas.
Respond directly to the question once you have enough information to answer it."""
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            system,
        ),
        ("human", "{question}"),
        # This MessagesPlaceholder allows us to optionally append an arbitrary number of messages
        # at the end of the prompt using the 'chat_history' arg.
        MessagesPlaceholder("chat_history", optional=True),
    ]
)


def _get_chat_history(x: dict) -> list:
    """Parse the chain output up to this point into a list of chat history messages to insert in the prompt."""
    ai_msg = x["ai_msg"]
    tool_call_id = x["ai_msg"].additional_kwargs["tool_calls"][0]["id"]
    tool_msg = ToolMessage(tool_call_id=tool_call_id, content=str(x["tool_output"]))
    return [ai_msg, tool_msg]


chain = (
    RunnablePassthrough.assign(ai_msg=prompt | llm_with_tools)
    .assign(tool_output=itemgetter("ai_msg") | parser | tool)
    .assign(chat_history=_get_chat_history)
    .assign(response=prompt | llm | StrOutputParser())
    .pick(["tool_output", "response"])
)
```

```python
chain.invoke({"question": "What's the correlation between age and fare"})
```

```output
{'tool_output': 0.11232863699941621,
 'response': 'The correlation between age and fare is approximately 0.112.'}
```

इस रन के लिए LangSmith ट्रेस यहां है: https://smith.langchain.com/public/ca689f8a-5655-4224-8bcf-982080744462/r

### एजेंट

जटिल प्रश्नों के लिए, यह मददगार हो सकता है कि एक LLM अपने पिछले निष्पादनों के इनपुट और आउटपुट को बनाए रखते हुए कोड को दोहराया कर सके। यहीं पर एजेंट प्रासंगिक हैं। वे एक LLM को यह तय करने की अनुमति देते हैं कि एक उपकरण को कितनी बार बुलाया जाना चाहिए और अब तक किए गए निष्पादनों का ट्रैक रखते हैं। [create_pandas_dataframe_agent](https://api.python.langchain.com/en/latest/agents/langchain_experimental.agents.agent_toolkits.pandas.base.create_pandas_dataframe_agent.html) एक बिल्ट-इन एजेंट है जो dataframes के साथ काम करना आसान बनाता है:

```python
from langchain_experimental.agents import create_pandas_dataframe_agent

agent = create_pandas_dataframe_agent(llm, df, agent_type="openai-tools", verbose=True)
agent.invoke(
    {
        "input": "What's the correlation between age and fare? is that greater than the correlation between fare and survival?"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `python_repl_ast` with `{'query': "df[['Age', 'Fare']].corr()"}`


[0m[36;1m[1;3m           Age      Fare
Age   1.000000  0.112329
Fare  0.112329  1.000000[0m[32;1m[1;3m
Invoking: `python_repl_ast` with `{'query': "df[['Fare', 'Survived']].corr()"}`


[0m[36;1m[1;3m              Fare  Survived
Fare      1.000000  0.256179
Survived  0.256179  1.000000[0m[32;1m[1;3mThe correlation between age and fare is 0.112329, while the correlation between fare and survival is 0.256179. Therefore, the correlation between fare and survival is greater than the correlation between age and fare.[0m

[1m> Finished chain.[0m
```

```output
{'input': "What's the correlation between age and fare? is that greater than the correlation between fare and survival?",
 'output': 'The correlation between age and fare is 0.112329, while the correlation between fare and survival is 0.256179. Therefore, the correlation between fare and survival is greater than the correlation between age and fare.'}
```

इस रन के लिए LangSmith ट्रेस यहां है: https://smith.langchain.com/public/8e6c23cc-782c-4203-bac6-2a28c770c9f0/r

### एक से अधिक CSV

एक से अधिक CSV (या डेटाफ्रेम) को संभालने के लिए हमें केवल हमारे Python उपकरण में एक सूची में कई डेटाफ्रेम पास करने की आवश्यकता है। हमारा `create_pandas_dataframe_agent` निर्माता इसे बॉक्स से कर सकता है, हम केवल एक डेटाफ्रेम के बजाय एक सूची में डेटाफ्रेम पास कर सकते हैं। यदि हम खुद एक श्रृंखला का निर्माण कर रहे हैं, तो हम इस तरह कर सकते हैं:

```python
df_1 = df[["Age", "Fare"]]
df_2 = df[["Fare", "Survived"]]

tool = PythonAstREPLTool(locals={"df_1": df_1, "df_2": df_2})
llm_with_tool = llm.bind_tools(tools=[tool], tool_choice=tool.name)
df_template = """```python
{df_name}.head().to_markdown()
>>> {df_head}
    ```"""
df_context = "\n\n".join(
    df_template.format(df_head=_df.head().to_markdown(), df_name=df_name)
    for _df, df_name in [(df_1, "df_1"), (df_2, "df_2")]
)

system = f"""You have access to a number of pandas dataframes. \
Here is a sample of rows from each dataframe and the python code that was used to generate the sample:

{df_context}

Given a user question about the dataframes, write the Python code to answer it. \
Don't assume you have access to any libraries other than built-in Python ones and pandas. \
Make sure to refer only to the variables mentioned above."""
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", "{question}")])

chain = prompt | llm_with_tool | parser | tool
chain.invoke(
    {
        "question": "return the difference in the correlation between age and fare and the correlation between fare and survival"
    }
)
```

```output
-0.14384991262954416
```

यहां इस रन के लिए LangSmith ट्रेस है: https://smith.langchain.com/public/653e499f-179c-4757-8041-f5e2a5f11fcc/r

### सैंडबॉक्स कोड निष्पादन

[E2B](/docs/integrations/tools/e2b_data_analysis) और [Bearly](/docs/integrations/tools/bearly) जैसे कई उपकरण सुरक्षित कोड-निष्पादन श्रृंखलाओं और एजेंटों की अनुमति देने के लिए Python कोड निष्पादन के लिए सैंडबॉक्स वातावरण प्रदान करते हैं।

## अगले कदम

अधिक उन्नत डेटा विश्लेषण अनुप्रयोगों के लिए हम निम्नलिखित की जांच करने की सिफारिश करते हैं:

* [SQL उपयोग मामला](/docs/use_cases/sql/): SQL डीबी और CSV के साथ काम करने की चुनौतियों में से कई किसी भी संरचित डेटा प्रकार के लिए सामान्य हैं, इसलिए यह उपयोगी है कि यदि आप CSV डेटा विश्लेषण के लिए Pandas का उपयोग कर रहे हैं तो SQL तकनीकों को पढ़ें।
* [उपकरण उपयोग](/docs/use_cases/tool_use/): श्रृंखलाओं और एजेंटों के साथ काम करते समय सामान्य सर्वोत्तम प्रथाओं पर मार्गदर्शन।
* [एजेंट](/docs/modules/agents/): एलएलएम एजेंट बनाने के मूलभूत सिद्धांतों को समझें।
* एकीकरण: [E2B](/docs/integrations/tools/e2b_data_analysis) और [Bearly](/docs/integrations/tools/bearly) जैसे सैंडबॉक्स वातावरण, [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html#langchain_community.utilities.sql_database.SQLDatabase) जैसे उपयोगी उपकरण, [Spark DataFrame एजेंट](/docs/integrations/toolkits/spark) जैसे संबंधित एजेंट।
