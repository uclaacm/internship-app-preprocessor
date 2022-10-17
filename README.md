# Internship App Preprocessor

## What Does it Do?

This is a preprocessor that can be modified with minimal effort to do the following to help process ACM's intern/officer applications:

- Strip personal information from applications and assigning IDs to applicants to ensure blind applications.
- Separate applications by committee and only keep the relevant questions on sub-sheets for each committee.

## Running The Script

To run the script, simply clone the repository, then download all the required dependencies with `yarn install`. Then, once you update the .env with the necessary **\*SPREADSHEET_ID** of the Internship/Officer Applications Responses Spreadsheet and **SERVICE_ACCOUNT**, you can simply run `yarn run-script` to process all of the applications!

## Updating Information From Year To Year

To update this script to run from year to year, as the questions vary from committee to committee yearly, simply update the columns corresponding to the form questions accordingly, or the committees, and it should work!
