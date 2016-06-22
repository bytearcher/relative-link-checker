Scans file path for html files and validates every relatively referenced file is found within the directory tree.

## Usage

Install either globally

    npm install -g relative-link-checker
    relative-link-checker <root directory>

or locally to be available in your package.json scripts

    npm install relative-link-checker --save-dev
    node_modules/.bin/relative-link-checker <root directory>

### Usage example

    $ relative-link-checker dist
    Validating relative links in: dist
    Everything ok
