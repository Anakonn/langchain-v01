---
translated: true
---

# कैसेंड्रा डेटाबेस

Apache Cassandra® एक व्यापक रूप से उपयोग किया जाने वाला डेटाबेस है जो लेनदेन आधारित अनुप्रयोग डेटा को संग्रहीत करता है। बड़े भाषा मॉडलों में कार्यों और उपकरणों के परिचय ने मौजूदा डेटा में कुछ रोमांचक उपयोग मामलों को खोला है। कैसेंड्रा डेटाबेस टूलकिट एआई इंजीनियरों को कैसेंड्रा डेटा के साथ एजेंटों को कुशलतापूर्वक एकीकृत करने में सक्षम बनाता है, जो निम्नलिखित सुविधाएं प्रदान करता है:
 - अनुकूलित क्वेरी के माध्यम से तेज़ डेटा पहुंच। अधिकांश क्वेरी एकल अंकों में मिलीसेकंड या उससे कम में चलनी चाहिए।
 - एलएलएम तर्कशक्ति क्षमताओं को बढ़ाने के लिए स्कीमा अंतर्दृष्टि
 - विभिन्न कैसेंड्रा तैनातियों के साथ संगतता, जिसमें Apache Cassandra®, DataStax Enterprise™ और DataStax Astra™ शामिल हैं
 - वर्तमान में, टूलकिट SELECT क्वेरी और स्कीमा अंतर्दृष्टि संचालन तक सीमित है। (सुरक्षा पहले)

## त्वरित शुरुआत

 - कैसियो लाइब्रेरी स्थापित करें
 - आप कनेक्ट कर रहे कैसेंड्रा डेटाबेस के लिए पर्यावरण चर सेट करें
 - CassandraDatabase को इनिशियलाइज़ करें
 - toolkit.get_tools() के साथ अपने एजेंट को उपकरण पास करें
 - पीछे बैठें और देखें कि यह आपके लिए सब कुछ कर रहा है

## संचालन का सिद्धांत

कैसेंड्रा क्वेरी भाषा (CQL) कैसेंड्रा डेटाबेस के साथ बातचीत करने का प्राथमिक *मानव-केंद्रित* तरीका है। क्वेरी जनरेट करते समय कुछ लचीलापन प्रदान करने के बावजूद, यह कैसेंड्रा डेटा मॉडलिंग सर्वोत्तम प्रथाओं के ज्ञान की आवश्यकता होती है। एलएलएम फ़ंक्शन कॉलिंग एजेंट को तर्क करने और फिर अनुरोध को पूरा करने के लिए एक उपकरण चुनने की क्षमता देता है। एलएलएम का उपयोग करते हुए एजेंट को कैसेंड्रा-विशिष्ट तर्क का उपयोग करना चाहिए जब उचित टूलकिट या टूलकिट श्रृंखला का चयन करते हैं। इससे एलएलएम को शीर्ष-नीचे समाधान प्रदान करने के लिए मजबूर किए जाने पर आने वाली अनियमितता को कम किया जा सकता है। क्या आप चाहते हैं कि एक एलएलएम आपके डेटाबेस तक पूरी तरह से बिना किसी प्रतिबंध के पहुंच पाए? हाँ। शायद नहीं। इसे प्राप्त करने के लिए, हम एजेंट के निर्माण के लिए प्रश्न बनाने में उपयोग किए जाने वाले एक प्रॉम्प्ट प्रदान करते हैं:

```json
You are an Apache Cassandra expert query analysis bot with the following features
and rules:
 - You will take a question from the end user about finding specific
   data in the database.
 - You will examine the schema of the database and create a query path.
 - You will provide the user with the correct query to find the data they are looking
   for, showing the steps provided by the query path.
 - You will use best practices for querying Apache Cassandra using partition keys
   and clustering columns.
 - Avoid using ALLOW FILTERING in the query.
 - The goal is to find a query path, so it may take querying other tables to get
   to the final answer.

The following is an example of a query path in JSON format:

 {
  "query_paths": [
    {
      "description": "Direct query to users table using email",
      "steps": [
        {
          "table": "user_credentials",
          "query":
             "SELECT userid FROM user_credentials WHERE email = 'example@example.com';"
        },
        {
          "table": "users",
          "query": "SELECT * FROM users WHERE userid = ?;"
        }
      ]
    }
  ]
}
```

## प्रदान किए गए उपकरण

### `cassandra_db_schema`

कनेक्ट किए गए डेटाबेस या किसी विशिष्ट स्कीमा के लिए सभी स्कीमा जानकारी एकत्र करता है। एजेंट के लिए कार्रवाई निर्धारित करने में महत्वपूर्ण।

### `cassandra_db_select_table_data`

विशिष्ट कीस्पेस और तालिका से डेटा का चयन करता है। एजेंट प्रेडिकेट और वापस लौटाए गए रिकॉर्डों की संख्या पर सीमाएं पास कर सकता है।

### `cassandra_db_query`

`cassandra_db_select_table_data` का प्रयोगात्मक वैकल्पिक जो एजेंट द्वारा पूरी तरह से बनाए गए क्वेरी स्ट्रिंग को लेता है, न कि पैरामीटर। *चेतावनी*: इससे असामान्य क्वेरी हो सकती हैं जो कि इतनी अच्छी प्रदर्शन (या यहां तक कि काम) नहीं कर सकती हैं। भविष्य में इसे हटा दिया जा सकता है। यदि यह कुछ शानदार करता है, तो हम इसके बारे में जानना चाहते हैं। आप कभी नहीं जानते!

## वातावरण सेटअप

निम्नलिखित Python मॉड्यूल स्थापित करें:

```bash
pip install ipykernel python-dotenv cassio langchain_openai langchain langchain-community langchainhub
```

### .env फ़ाइल

कनेक्शन `cassio` का उपयोग करके `auto=True` पैरामीटर के माध्यम से होता है, और नोटबुक OpenAI का उपयोग करता है। आपको एक `.env` फ़ाइल बनानी चाहिए।

कैसेंड्रा के लिए सेट करें:

```bash
CASSANDRA_CONTACT_POINTS
CASSANDRA_USERNAME
CASSANDRA_PASSWORD
CASSANDRA_KEYSPACE
```

Astra के लिए सेट करें:

```bash
ASTRA_DB_APPLICATION_TOKEN
ASTRA_DB_DATABASE_ID
ASTRA_DB_KEYSPACE
```

उदाहरण के लिए:

```bash
# Connection to Astra:
ASTRA_DB_DATABASE_ID=a1b2c3d4-...
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
ASTRA_DB_KEYSPACE=notebooks

# Also set
OPENAI_API_KEY=sk-....
```

(आप `cassio` के साथ सीधे कनेक्ट करने के लिए नीचे दिए गए कोड को भी संशोधित कर सकते हैं।)

```python
from dotenv import load_dotenv

load_dotenv(override=True)
```

```python
# Import necessary libraries
import os

import cassio
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_community.agent_toolkits.cassandra_database.toolkit import (
    CassandraDatabaseToolkit,
)
from langchain_community.tools.cassandra_database.prompt import QUERY_PATH_PROMPT
from langchain_community.tools.cassandra_database.tool import (
    GetSchemaCassandraDatabaseTool,
    GetTableDataCassandraDatabaseTool,
    QueryCassandraDatabaseTool,
)
from langchain_community.utilities.cassandra_database import CassandraDatabase
from langchain_openai import ChatOpenAI
```

## कैसेंड्रा डेटाबेस से कनेक्ट करें

```python
cassio.init(auto=True)
session = cassio.config.resolve_session()
if not session:
    raise Exception(
        "Check environment configuration or manually configure cassio connection parameters"
    )
```

```python
# Test data pep

session = cassio.config.resolve_session()

session.execute("""DROP KEYSPACE IF EXISTS langchain_agent_test; """)

session.execute(
    """
CREATE KEYSPACE if not exists langchain_agent_test
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.user_credentials (
    user_email text PRIMARY KEY,
    user_id UUID,
    password TEXT
);
"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.users (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT
);"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.user_videos (
    user_id UUID,
    video_id UUID,
    title TEXT,
    description TEXT,
    PRIMARY KEY (user_id, video_id)
);
"""
)

user_id = "522b1fe2-2e36-4cef-a667-cd4237d08b89"
video_id = "27066014-bad7-9f58-5a30-f63fe03718f6"

session.execute(
    f"""
    INSERT INTO langchain_agent_test.user_credentials (user_id, user_email)
    VALUES ({user_id}, 'patrick@datastax.com');
"""
)

session.execute(
    f"""
    INSERT INTO langchain_agent_test.users (id, name, email)
    VALUES ({user_id}, 'Patrick McFadin', 'patrick@datastax.com');
"""
)

session.execute(
    f"""
    INSERT INTO langchain_agent_test.user_videos (user_id, video_id, title)
    VALUES ({user_id}, {video_id}, 'Use Langflow to Build a LangChain LLM Application in 5 Minutes');
"""
)

session.set_keyspace("langchain_agent_test")
```

```python
# Create a CassandraDatabase instance
# Uses the cassio session to connect to the database
db = CassandraDatabase()

# Create the Cassandra Database tools
query_tool = QueryCassandraDatabaseTool(db=db)
schema_tool = GetSchemaCassandraDatabaseTool(db=db)
select_data_tool = GetTableDataCassandraDatabaseTool(db=db)
```

```python
# Choose the LLM that will drive the agent
# Only certain models support this
llm = ChatOpenAI(temperature=0, model="gpt-4-1106-preview")
toolkit = CassandraDatabaseToolkit(db=db)

tools = toolkit.get_tools()

print("Available tools:")
for tool in tools:
    print(tool.name + "\t- " + tool.description)
```

```output
Available tools:
cassandra_db_schema	-
    Input to this tool is a keyspace name, output is a table description
    of Apache Cassandra tables.
    If the query is not correct, an error message will be returned.
    If an error is returned, report back to the user that the keyspace
    doesn't exist and stop.

cassandra_db_query	-
    Execute a CQL query against the database and get back the result.
    If the query is not correct, an error message will be returned.
    If an error is returned, rewrite the query, check the query, and try again.

cassandra_db_select_table_data	-
    Tool for getting data from a table in an Apache Cassandra database.
    Use the WHERE clause to specify the predicate for the query that uses the
    primary key. A blank predicate will return all rows. Avoid this if possible.
    Use the limit to specify the number of rows to return. A blank limit will
    return all rows.
```

```python
prompt = hub.pull("hwchase17/openai-tools-agent")

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(llm, tools, prompt)
```

```python
input = (
    QUERY_PATH_PROMPT
    + "\n\nHere is your task: Find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the langchain_agent_test keyspace."
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

response = agent_executor.invoke({"input": input})

print(response["output"])
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `cassandra_db_schema` with `{'keyspace': 'langchain_agent_test'}`


[0m[36;1m[1;3mTable Name: user_credentials
- Keyspace: langchain_agent_test
- Columns
  - password (text)
  - user_email (text)
  - user_id (uuid)
- Partition Keys: (user_email)
- Clustering Keys:

Table Name: user_videos
- Keyspace: langchain_agent_test
- Columns
  - description (text)
  - title (text)
  - user_id (uuid)
  - video_id (uuid)
- Partition Keys: (user_id)
- Clustering Keys: (video_id asc)


Table Name: users
- Keyspace: langchain_agent_test
- Columns
  - email (text)
  - id (uuid)
  - name (text)
- Partition Keys: (id)
- Clustering Keys:

[0m[32;1m[1;3m
Invoking: `cassandra_db_select_table_data` with `{'keyspace': 'langchain_agent_test', 'table': 'user_credentials', 'predicate': "user_email = 'patrick@datastax.com'", 'limit': 1}`


[0m[38;5;200m[1;3mRow(user_email='patrick@datastax.com', password=None, user_id=UUID('522b1fe2-2e36-4cef-a667-cd4237d08b89'))[0m[32;1m[1;3m
Invoking: `cassandra_db_select_table_data` with `{'keyspace': 'langchain_agent_test', 'table': 'user_videos', 'predicate': 'user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89', 'limit': 10}`


[0m[38;5;200m[1;3mRow(user_id=UUID('522b1fe2-2e36-4cef-a667-cd4237d08b89'), video_id=UUID('27066014-bad7-9f58-5a30-f63fe03718f6'), description='DataStax Academy is a free resource for learning Apache Cassandra.', title='DataStax Academy')[0m[32;1m[1;3mTo find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the `langchain_agent_test` keyspace, we can follow these steps:

1. Query the `user_credentials` table to find the `user_id` associated with the email 'patrick@datastax.com'.
2. Use the `user_id` obtained from the first step to query the `user_videos` table to retrieve all the videos uploaded by the user.

Here is the query path in JSON format:

\```json
{
  "query_paths": [
    {
      "description": "Find user_id from user_credentials and then query user_videos for all videos uploaded by the user",
      "steps": [
        {
          "table": "user_credentials",
          "query": "SELECT user_id FROM user_credentials WHERE user_email = 'patrick@datastax.com';"
        },
        {
          "table": "user_videos",
          "query": "SELECT * FROM user_videos WHERE user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89;"
        }
      ]
    }
  ]
}
\```

Following this query path, we found that the user with the user_id `522b1fe2-2e36-4cef-a667-cd4237d08b89` has uploaded at least one video with the title 'DataStax Academy' and the description 'DataStax Academy is a free resource for learning Apache Cassandra.' The video_id for this video is `27066014-bad7-9f58-5a30-f63fe03718f6`. If there are more videos, the same query can be used to retrieve them, possibly with an increased limit if necessary.[0m

[1m> Finished chain.[0m
To find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the `langchain_agent_test` keyspace, we can follow these steps:

1. Query the `user_credentials` table to find the `user_id` associated with the email 'patrick@datastax.com'.
2. Use the `user_id` obtained from the first step to query the `user_videos` table to retrieve all the videos uploaded by the user.

Here is the query path in JSON format:

\```json
{
  "query_paths": [
    {
      "description": "Find user_id from user_credentials and then query user_videos for all videos uploaded by the user",
      "steps": [
        {
          "table": "user_credentials",
          "query": "SELECT user_id FROM user_credentials WHERE user_email = 'patrick@datastax.com';"
        },
        {
          "table": "user_videos",
          "query": "SELECT * FROM user_videos WHERE user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89;"
        }
      ]
    }
  ]
}
\```

Following this query path, we found that the user with the user_id `522b1fe2-2e36-4cef-a667-cd4237d08b89` has uploaded at least one video with the title 'DataStax Academy' and the description 'DataStax Academy is a free resource for learning Apache Cassandra.' The video_id for this video is `27066014-bad7-9f58-5a30-f63fe03718f6`. If there are more videos, the same query can be used to retrieve them, possibly with an increased limit if necessary.

```

कैसेंड्रा DB एजेंट बनाने के लिए गहन जानकारी के लिए [CQL एजेंट कुकबुक](https://github.com/langchain-ai/langchain/blob/master/cookbook/cql_agent.md) देखें
