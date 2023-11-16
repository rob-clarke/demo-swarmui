# Setup

1. If you haven't already got them, install:
   - [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
   - [conda](https://conda.io/projects/conda/en/latest/user-guide/install/index.html)

2. Setup the conda environment for the backend:
   ```sh
   conda env create -f server/environment.yml
   conda activate swarmui-sever
   ```

3. Start the backend:
   ```sh
   python server/demo.py
   ```

4. In a new terminal, install the correct node version:
   > NB: This command is `n**v**m`, others will be `n**p**m`
   ```sh
   nvm use
   ```

5. Install the required frontend dependencies:
   ```sh
   npm install
   ```

6. Start the frontend:
   ```sh
   npm run dev
   ```
   Press "o" on your keyboard to open the page in the browser
