# osome-csdl-ranking-challenge
Testing ranking algorithms to improve social cohesion 

## Environment set-up 

- Change to `osome-csdl-ranking-challenge` directory 
- run `make` — this will create a conda environment and install necessary libraries used by the ranker

## Sample data 

Run this code to generate sample data: 
`python3 sample_data/data_pull.py -p <platform> --numposts <number-of-items> --randomseed 999` 

where platform can take 3 values: twitter, facebook, reddit 

This will print the json object of a timeline to stdout. It will also save the object to a .json file in `sample_data/<platform>_data` for you to inspect.

