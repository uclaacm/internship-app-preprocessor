import * as dotenv from "dotenv";
import { google } from "googleapis";
import {
  ALPHABET,
  COMMITTEE_QUESTION_COLS,
  Committees,
  EMAIL_ROW_INDEX,
  GENERAL_QUESTION_COLS,
  NAME_ROW_INDEX,
  PERSONAL_INFO_SHEET,
  SERVICE_ACCOUNT,
  SOCIALS_ROW_INDEX,
  SPREADSHEET_ID,
} from "./constants";

dotenv.config();

//A is index 0, AA is index 26, BA is index 52, etc
//start,end

//Function to map columns in Google Sheets A1 notation to notation of an array
//Only works of up to ~700ish questions or up to ZZ, but I doubt we'll go past that ever
function columnToIndex(str: string) {
  const input = str.toUpperCase();
  const inputLen = input.length;
  if (inputLen > 1) {
    return 26 * (ALPHABET.indexOf(input[0]) + 1) + ALPHABET.indexOf(input[1]);
  } else {
    return ALPHABET.indexOf(input);
  }
}

const GENERAL_QUESTION_START = columnToIndex(GENERAL_QUESTION_COLS[0]);
const GENERAL_QUESTION_END = columnToIndex(
  GENERAL_QUESTION_COLS[GENERAL_QUESTION_COLS.length - 1]
);

async function main() {
  //do auth
  const sheets = google.sheets("v4");
  // Get JWT Token to access sheet
  const service_account = JSON.parse(SERVICE_ACCOUNT);
  const jwtClient = new google.auth.JWT(
    service_account.client_email,
    "",
    service_account.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  await jwtClient.authorize(function (err) {
    if (err) {
      console.error(err);
      throw err;
    }
  });

  async function createSheet(SHEET_NAME: string) {
    try {
      //clear if already made
      await sheets.spreadsheets.values.clear({
        auth: jwtClient,
        spreadsheetId: SPREADSHEET_ID,
        range: SHEET_NAME,
      });
    } catch (err) {
      //make sheet otherwise
      console.log(SHEET_NAME, "sheet does not exist yet!"); // get rid of later
      await sheets.spreadsheets.batchUpdate({
        auth: jwtClient,
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_NAME,
                },
              },
            },
          ],
        },
      });
    }
  }

  async function parsePersonalInfo() {
    const res = await sheets.spreadsheets.values.get({
      auth: jwtClient,
      spreadsheetId: SPREADSHEET_ID,
      range: `Form Responses 1!A1:BT`,
    });
    const rows: string[][] = res?.data.values ?? [];

    //PROCESSING APPLICANTS
    const personal_info = [["ID", "Name", "Email", "Socials"]];
    for (let i = 1; i < rows.length; i++) {
      personal_info.push([
        (i + 1).toString(),
        rows[i][NAME_ROW_INDEX],
        rows[i][EMAIL_ROW_INDEX],
        rows[i][SOCIALS_ROW_INDEX],
      ]);
    }

    //making the personal info sheet
    //delete personal info if it exists
    await createSheet(PERSONAL_INFO_SHEET);

    await sheets.spreadsheets.values.append({
      auth: jwtClient,
      spreadsheetId: SPREADSHEET_ID,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      range: PERSONAL_INFO_SHEET,
      requestBody: {
        majorDimension: "ROWS",
        range: PERSONAL_INFO_SHEET,
        values: personal_info,
      },
    });

    return rows;
  }

  async function getCommitteeApplicants(
    committee: Committees,
    rows: string[][]
  ) {
    //list of committee applicants
    const committeeApplicants: string[][] = [];
    const COMMITTEE_QUESTION_START = columnToIndex(
      COMMITTEE_QUESTION_COLS[committee][0]
    );

    const COMMITTEE_QUESTION_END = columnToIndex(
      COMMITTEE_QUESTION_COLS[committee][
        COMMITTEE_QUESTION_COLS[committee].length - 1
      ]
    );
    const question_headers = ["Applicant ID"].concat(
      rows[0]
        .slice(GENERAL_QUESTION_START, GENERAL_QUESTION_END + 1)
        .concat(
          rows[0].slice(COMMITTEE_QUESTION_START, COMMITTEE_QUESTION_END + 1)
        )
    );
    for (let i = 1; i < rows.length; i++) {
      const applicantIndex = i + 1;
      //add that current row to the committee's applicants pool if they applied for that committee
      if (rows[i][COMMITTEE_QUESTION_START]) {
        //start applicant info with their ID
        //assuming constant range of questions

        //applicantInfo.concat
        const applicantInfo = rows[i]
          .slice(GENERAL_QUESTION_START, GENERAL_QUESTION_END + 1)
          .concat(
            rows[i].slice(COMMITTEE_QUESTION_START, COMMITTEE_QUESTION_END + 1)
          );
        committeeApplicants.push(
          [applicantIndex.toString()].concat(applicantInfo)
        );
      }
    }

    const committeeSheetValues = [question_headers].concat(committeeApplicants);

    //batch write the committeeSheetValues
    await sheets.spreadsheets.values.append({
      auth: jwtClient,
      spreadsheetId: SPREADSHEET_ID,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      range: committee,
      requestBody: {
        majorDimension: "ROWS",
        range: committee,
        values: committeeSheetValues,
      },
    });
  }

  async function createCommitteeTabs(committee: Committees, rows: string[][]) {
    await createSheet(committee);
    await getCommitteeApplicants(committee, rows); // call function that gets info + ID for each applicant to that committee
  }

  // get all rows responses
  const rows = await parsePersonalInfo();
  // parse out committee info
  Object.values(Committees).map((committee) =>
    createCommitteeTabs(committee, rows)
  );
}

main();
