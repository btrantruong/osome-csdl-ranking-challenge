# osome-csdl-ranking-challenge
Testing ranking algorithms to improve social cohesion 

## How to run the server 

1. Set up the environment:
- Make sure you have conda or [miniconda](https://waylonwalker.com/install-miniconda/) installed on your machine. 
- Change to `osome-server` directory 
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
- Run the command `python osome-server/app/ranking_server.py`
- This would create a server running at http://localhost:5001 in dev mode 


## Collect data from personal account using the extension: 

- To install the chrome extension: unzip `rc-extension-0.3.0-20240514.zip` and install according to directions in `rc-extension/READNE.md` 

## Develop ranking models  

Since we now have the extension, sample data collected using the previous section is preferred. But if for some reasons you're not using that, you can do as follows 

### Sample data 

Run this code to generate sample data: 
`python3 sample_data/data_pull.py -p <platform> --numposts <number-of-items> --randomseed 999` 

where platform can take 3 values: twitter, facebook, reddit 

This will print the json object of a timeline to stdout. It will also save the object to a .json file in `sample_data/<platform>_data` for you to inspect.

