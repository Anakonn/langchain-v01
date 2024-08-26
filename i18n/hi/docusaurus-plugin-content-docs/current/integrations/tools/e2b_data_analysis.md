---
translated: true
---

# E2B डेटा विश्लेषण

[E2B के क्लाउड वातावरण](https://e2b.dev) LLM के लिए महान रन-टाइम सैंडबॉक्स हैं।

E2B के डेटा विश्लेषण सैंडबॉक्स में सुरक्षित कोड निष्पादन के लिए एक सैंडबॉक्स वातावरण है। यह कोड व्याख्याता या उन्नत डेटा विश्लेषण जैसे उपकरण बनाने के लिए आदर्श है, जैसा कि ChatGPT में किया गया है।

E2B डेटा विश्लेषण सैंडबॉक्स आपको निम्नलिखित करने की अनुमति देता है:
- पायथन कोड चलाएं
- मैटप्लॉट के माध्यम से चार्ट उत्पन्न करें
- रन-टाइम के दौरान डायनेमिक रूप से पायथन पैकेज इंस्टॉल करें
- रन-टाइम के दौरान डायनेमिक रूप से सिस्टम पैकेज इंस्टॉल करें
- शेल कमांड चलाएं
- फ़ाइलें अपलोड और डाउनलोड करें

हम एक सरल OpenAI एजेंट बनाएंगे जो पायथन का उपयोग करके E2B के डेटा विश्लेषण सैंडबॉक्स का उपयोग करके अपलोड की गई फ़ाइलों पर विश्लेषण करेगा।

अपना OpenAI API कुंजी और [E2B API कुंजी यहां](https://e2b.dev/docs/getting-started/api-key) प्राप्त करें और उन्हें पर्यावरण चर के रूप में सेट करें।

आप पूर्ण API दस्तावेज़ीकरण [यहां](https://e2b.dev/docs) पा सकते हैं।

शुरू करने के लिए आपको `e2b` इंस्टॉल करना होगा:

```python
%pip install --upgrade --quiet  langchain e2b
```

```python
from langchain_community.tools import E2BDataAnalysisTool
```

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_openai import ChatOpenAI

os.environ["E2B_API_KEY"] = "<E2B_API_KEY>"
os.environ["OPENAI_API_KEY"] = "<OPENAI_API_KEY>"
```

जब `E2BDataAnalysisTool` का एक इंस्टेंस बनाते समय, आप सैंडबॉक्स के आउटपुट को सुनने के लिए कॉलबैक पास कर सकते हैं। यह उदाहरण के लिए अधिक प्रतिक्रियाशील UI बनाते समय उपयोगी है, खासकर LLM से स्ट्रीमिंग आउटपुट के संयोजन के साथ।

```python
# Artifacts are charts created by matplotlib when `plt.show()` is called
def save_artifact(artifact):
    print("New matplotlib chart generated:", artifact.name)
    # Download the artifact as `bytes` and leave it up to the user to display them (on frontend, for example)
    file = artifact.download()
    basename = os.path.basename(artifact.name)

    # Save the chart to the `charts` directory
    with open(f"./charts/{basename}", "wb") as f:
        f.write(file)


e2b_data_analysis_tool = E2BDataAnalysisTool(
    # Pass environment variables to the sandbox
    env_vars={"MY_SECRET": "secret_value"},
    on_stdout=lambda stdout: print("stdout:", stdout),
    on_stderr=lambda stderr: print("stderr:", stderr),
    on_artifact=save_artifact,
)
```

हमारे एजेंट द्वारा विश्लेषण करने के लिए एक उदाहरण CSV डेटा फ़ाइल सैंडबॉक्स में अपलोड करें। आप उदाहरण के लिए [यह फ़ाइल](https://storage.googleapis.com/e2b-examples/netflix.csv) का उपयोग कर सकते हैं जो Netflix टीवी शो के बारे में है।

```python
with open("./netflix.csv") as f:
    remote_path = e2b_data_analysis_tool.upload_file(
        file=f,
        description="Data about Netflix tv shows including their title, category, director, release date, casting, age rating, etc.",
    )
    print(remote_path)
```

```output
name='netflix.csv' remote_path='/home/user/netflix.csv' description='Data about Netflix tv shows including their title, category, director, release date, casting, age rating, etc.'
```

एक `Tool` ऑब्जेक्ट बनाएं और Langchain एजेंट को इनिशियलाइज़ करें।

```python
tools = [e2b_data_analysis_tool.as_tool()]

llm = ChatOpenAI(model="gpt-4", temperature=0)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True,
    handle_parsing_errors=True,
)
```

अब हम पहले से अपलोड की गई CSV फ़ाइल के बारे में एजेंट से प्रश्न पूछ सकते हैं।

```python
agent.run(
    "What are the 5 longest movies on netflix released between 2000 and 2010? Create a chart with their lengths."
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `e2b_data_analysis` with `{'python_code': "import pandas as pd\n\n# Load the data\nnetflix_data = pd.read_csv('/home/user/netflix.csv')\n\n# Convert the 'release_year' column to integer\nnetflix_data['release_year'] = netflix_data['release_year'].astype(int)\n\n# Filter the data for movies released between 2000 and 2010\nfiltered_data = netflix_data[(netflix_data['release_year'] >= 2000) & (netflix_data['release_year'] <= 2010) & (netflix_data['type'] == 'Movie')]\n\n# Remove rows where 'duration' is not available\nfiltered_data = filtered_data[filtered_data['duration'].notna()]\n\n# Convert the 'duration' column to integer\nfiltered_data['duration'] = filtered_data['duration'].str.replace(' min','').astype(int)\n\n# Get the top 5 longest movies\nlongest_movies = filtered_data.nlargest(5, 'duration')\n\n# Create a bar chart\nimport matplotlib.pyplot as plt\n\nplt.figure(figsize=(10,5))\nplt.barh(longest_movies['title'], longest_movies['duration'], color='skyblue')\nplt.xlabel('Duration (minutes)')\nplt.title('Top 5 Longest Movies on Netflix (2000-2010)')\nplt.gca().invert_yaxis()\nplt.savefig('/home/user/longest_movies.png')\n\nlongest_movies[['title', 'duration']]"}`


[0mstdout:                              title  duration
stdout: 1019                        Lagaan       224
stdout: 4573                  Jodhaa Akbar       214
stdout: 2731      Kabhi Khushi Kabhie Gham       209
stdout: 2632  No Direction Home: Bob Dylan       208
stdout: 2126          What's Your Raashee?       203
[36;1m[1;3m{'stdout': "                             title  duration\n1019                        Lagaan       224\n4573                  Jodhaa Akbar       214\n2731      Kabhi Khushi Kabhie Gham       209\n2632  No Direction Home: Bob Dylan       208\n2126          What's Your Raashee?       203", 'stderr': ''}[0m[32;1m[1;3mThe 5 longest movies on Netflix released between 2000 and 2010 are:

1. Lagaan - 224 minutes
2. Jodhaa Akbar - 214 minutes
3. Kabhi Khushi Kabhie Gham - 209 minutes
4. No Direction Home: Bob Dylan - 208 minutes
5. What's Your Raashee? - 203 minutes

Here is the chart showing their lengths:

![Longest Movies](sandbox:/home/user/longest_movies.png)[0m

[1m> Finished chain.[0m
```

```output
"The 5 longest movies on Netflix released between 2000 and 2010 are:\n\n1. Lagaan - 224 minutes\n2. Jodhaa Akbar - 214 minutes\n3. Kabhi Khushi Kabhie Gham - 209 minutes\n4. No Direction Home: Bob Dylan - 208 minutes\n5. What's Your Raashee? - 203 minutes\n\nHere is the chart showing their lengths:\n\n![Longest Movies](sandbox:/home/user/longest_movies.png)"
```

E2B आपको रन-टाइम के दौरान डायनेमिक रूप से पायथन और सिस्टम (`apt` के माध्यम से) पैकेज इंस्टॉल करने की भी अनुमति देता है, इस तरह से:

```python
# Install Python package
e2b_data_analysis_tool.install_python_packages("pandas")
```

```output
stdout: Requirement already satisfied: pandas in /usr/local/lib/python3.10/dist-packages (2.1.1)
stdout: Requirement already satisfied: python-dateutil>=2.8.2 in /usr/local/lib/python3.10/dist-packages (from pandas) (2.8.2)
stdout: Requirement already satisfied: pytz>=2020.1 in /usr/local/lib/python3.10/dist-packages (from pandas) (2023.3.post1)
stdout: Requirement already satisfied: numpy>=1.22.4 in /usr/local/lib/python3.10/dist-packages (from pandas) (1.26.1)
stdout: Requirement already satisfied: tzdata>=2022.1 in /usr/local/lib/python3.10/dist-packages (from pandas) (2023.3)
stdout: Requirement already satisfied: six>=1.5 in /usr/local/lib/python3.10/dist-packages (from python-dateutil>=2.8.2->pandas) (1.16.0)
```

इसके अलावा, आप निम्नानुसार सैंडबॉक्स से कोई भी फ़ाइल डाउनलोड कर सकते हैं:

```python
# The path is a remote path in the sandbox
files_in_bytes = e2b_data_analysis_tool.download_file("/home/user/netflix.csv")
```

अंत में, आप `run_command` के माध्यम से सैंडबॉक्स के भीतर कोई भी शेल कमांड चला सकते हैं।

```python
# Install SQLite
e2b_data_analysis_tool.run_command("sudo apt update")
e2b_data_analysis_tool.install_system_packages("sqlite3")

# Check the SQLite version
output = e2b_data_analysis_tool.run_command("sqlite3 --version")
print("version: ", output["stdout"])
print("error: ", output["stderr"])
print("exit code: ", output["exit_code"])
```

```output
stderr:
stderr: WARNING: apt does not have a stable CLI interface. Use with caution in scripts.
stderr:
stdout: Hit:1 http://security.ubuntu.com/ubuntu jammy-security InRelease
stdout: Hit:2 http://archive.ubuntu.com/ubuntu jammy InRelease
stdout: Hit:3 http://archive.ubuntu.com/ubuntu jammy-updates InRelease
stdout: Hit:4 http://archive.ubuntu.com/ubuntu jammy-backports InRelease
stdout: Reading package lists...
stdout: Building dependency tree...
stdout: Reading state information...
stdout: All packages are up to date.
stdout: Reading package lists...
stdout: Building dependency tree...
stdout: Reading state information...
stdout: Suggested packages:
stdout:   sqlite3-doc
stdout: The following NEW packages will be installed:
stdout:   sqlite3
stdout: 0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.
stdout: Need to get 768 kB of archives.
stdout: After this operation, 1873 kB of additional disk space will be used.
stdout: Get:1 http://archive.ubuntu.com/ubuntu jammy-updates/main amd64 sqlite3 amd64 3.37.2-2ubuntu0.1 [768 kB]
stderr: debconf: delaying package configuration, since apt-utils is not installed
stdout: Fetched 768 kB in 0s (2258 kB/s)
stdout: Selecting previously unselected package sqlite3.
(Reading database ... 23999 files and directories currently installed.)
stdout: Preparing to unpack .../sqlite3_3.37.2-2ubuntu0.1_amd64.deb ...
stdout: Unpacking sqlite3 (3.37.2-2ubuntu0.1) ...
stdout: Setting up sqlite3 (3.37.2-2ubuntu0.1) ...
stdout: 3.37.2 2022-01-06 13:25:41 872ba256cbf61d9290b571c0e6d82a20c224ca3ad82971edc46b29818d5dalt1
version:  3.37.2 2022-01-06 13:25:41 872ba256cbf61d9290b571c0e6d82a20c224ca3ad82971edc46b29818d5dalt1
error:
exit code:  0
```

जब आपका एजेंट समाप्त हो जाए, तो सैंडबॉक्स को बंद करना न भूलें।

```python
e2b_data_analysis_tool.close()
```
