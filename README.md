# osome-csdl-ranking-challenge
Testing ranking algorithms to improve social cohesion 

## How to run the server 

1. Set up the environment:
- Make sure you have conda or [miniconda](https://waylonwalker.com/install-miniconda/) installed on your machine. 
- Change to `osome-csdl-ranking-challenge` directory 
- Run the command `make` in the terminal — this will create a conda environment and install necessary libraries used by the ranker

2. Set up ranker: 
You will need the file ``libs/osomerank/data/audience_diversity_2022-2023_visitor_level.csv" (not included in this public repo since it contains sensitive data). Ask Bao/Saumya you give you this file. Without this the ranker won't run properly.

After doing the above steps, run the following commands to test that the ranker run properly -- it should pass the test without giving any errors:
```
conda activate osomerank
python3 app/ranking_server_test.py 
```

3. Run the server on local host:
- Activate the conda environment: `conda activate`
- Run the command `python osome-csdl-ranking-challenge/app/ranking_server.py`
- This would create a server running at http://localhost:5001 in dev mode 


## Collect data from personal account using the extension: 

- To install the chrome extension: unzip `rc-extension-0.3.0-20240514.zip` (Shared in PRC Google group or in our Slack channel Gdrive -- Please don't share this extension/don't commit it to this public repo!!)
- Replace `manifest.json` and `service_worker.js` with the 2 files in `rc-extension-update`
- Install the extension according to directions in `rc-extension/READNE.md` 
- Run the server following step 3 above. 
- Now you can do either of these:
    - Scroll manually: Log in to your  account and scroll. Your account timeline data, plus the ranked posts will be saved in `data/extension_data`
    - Scroll automatically: Run one of the selenium scripts in `rc-extension-update/scripts` to collect data from the corresponding social media (X/Facebook/Reddit). 
    - Note: these scripts will navigate to the login page & wait 1 minute for you to enter the credentials. After you're logged in, the browser driver will scroll automatically.

### Calculating "dose" 

When you run the server and scroll, the dose calculated using Rank-biased Overlap (RBO) will be calculated for each payload, printed to the terminal  saved in `data/extension_data/<platform>_ranked*.json` files. Look something like this:

```
{
    "ranked_post_ids": [
        "tweet-1794363035253194910",
        "tweet-1794413716357972268",
        "tweet-1794376515477807452",
        "tweet-1794027648257020292",
        "tweet-1793930355617259811"
    ],
    "rbo": 0.4820609478723649
}
``` 

## Develop ranking models  

Since we now have the extension, sample data collected using the previous section is preferred. But if for some reasons you're not using that, you can do as follows 

### Sample data 

Run this code to generate sample data: 
`python3 data/sample_data/data_pull.py -p <platform> --numposts <number-of-items> --randomseed 999` 

where platform can take 3 values: twitter, facebook, reddit 

This will print the json object of a timeline to stdout. It will also save the object to a .json file in `data/sample_data/<platform>_data` for you to inspect.

