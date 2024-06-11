#!/bin/bash
#####  Constructed by HPC everywhere #####
#SBATCH -A r00382
#SBATCH --mail-user=baotruon@iu.edu
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=1
#SBATCH --gpus-per-task=1
#SBATCH -p gpu
#SBATCH --time=1:00:00
#SBATCH --mem=58gb
#SBATCH --mail-type=FAIL,BEGIN,END
#SBATCH --job-name=ranker_profile

######  Module commands #####
source /N/u/baotruon/BigRed200/conda/etc/profile.d/conda.sh
conda activate osomerank


######  Job commands go below this line #####
cd /N/u/baotruon/BigRed200/osome-csdl-ranking-challenge
echo '###### running ranker profile ######'
python3 /N/u/baotruon/BigRed200/osome-csdl-ranking-challenge/app/ranker_profile.py