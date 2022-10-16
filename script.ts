import * as dotenv from "dotenv";
import { google } from "googleapis";
import { sheets_v4 } from "googleapis";

dotenv.config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SERVICE_ACCOUNT = process.env.SERVICE_ACCOUNT ?? "";
const PERSONAL_INFO_SHEET = "Personal Info";
const NAME_ROW_INDEX = 2;
const EMAIL_ROW_INDEX = 1;
const SOCIALS_ROW_INDEX = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

//A is index 0, AA is index 26, BA is index 52, etc
//start,end
// function columnToIndex(str: string) {
//   const input = str.toUpperCase();
//   const inputLen = input.length;
//   let rV = 0;
//   if (inputLen > 1) {
//     return 26 * (ALPHABET.indexOf(input[0]) + 1) + ALPHABET.indexOf(input[1]);
//   } else {
//     return ALPHABET.indexOf(input);
//   }
// }

enum Committees {
  GENERAL_QUESTIONS = "GENERAL_QUESTIONS",
  BOARD = "BOARD",
  DEV_TEAM = "DEV_TEAM",
  AI = "AI",
  CYBER = "CYBER",
  DESIGN = "DESIGN",
  HACK = "HACK",
  ICPC = "ICPC",
  STUDIO = "STUDIO",
  TEACH_LA = "TEACH_LA",
  W = "W",
}

const COMMITTEE_QUESTION_COLS = {
  GENERAL_QUESTIONS: ["D", "...", "F"],
  BOARD: ["I", "...", "Y"],
  DEV_TEAM: ["Z", "...", "AF"],
  AI: ["AG", "...", "AM"],
  CYBER: ["AN", "...", "AQ"],
  DESIGN: ["AR", "...", "AW"],
  HACK: ["AX", "...", "AZ"],
  ICPC: ["BA", "...", "BC"],
  STUDIO: ["BD", "...", "BH"],
  TEACH_LA: ["BI", "...", "BO"],
  W: ["BP", "...", "BT"],
};

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
  }

  async function createCommitteeTabs(committee: Committees) {
    await createSheet(committee);
    // getInfo(committee); // call function that gets info + ID for each applicant to that committee
  }

  // get personal info sheet
  await parsePersonalInfo();
  // parse out committee info
  Object.values(Committees).map((committee) => createCommitteeTabs(committee));
}

main();
