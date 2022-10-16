import * as dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SERVICE_ACCOUNT = process.env.SERVICE_ACCOUNT ?? "";
const PERSONAL_INFO_SHEET = "Personal Info";

async function processSheet() {
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
  const BASE_REQUEST = {
    auth: jwtClient,
    spreadsheetId: SPREADSHEET_ID,
  };

  // Get roles from google sheets
  const res = await sheets.spreadsheets.values.get({
    auth: jwtClient,
    spreadsheetId: SPREADSHEET_ID,
    range: `Form Responses 1!A2:BT`,
  });
  const personal_info = [["ID", "Name", "Email", "Socials"]];
  const rows: string[][] = res?.data.values ?? [];
  for (let i = 0; i < rows.length; i++) {
    personal_info.push([
      (i + 1).toString(),
      rows[i][2],
      rows[i][1],
      rows[i][6],
    ]);
  }

  //making the personal info
  //delete personal info if it exists
  try {
    await sheets.spreadsheets.values.clear({
      ...BASE_REQUEST,
      range: PERSONAL_INFO_SHEET,
    });
  } catch (err) {
    console.log("Personal info sheet does not exist yet!");
    await sheets.spreadsheets.batchUpdate({
      ...BASE_REQUEST,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: PERSONAL_INFO_SHEET,
              },
            },
          },
        ],
      },
    });
  }

  await sheets.spreadsheets.values.append({
    ...BASE_REQUEST,
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

async function main() {
  const res = await processSheet();
  console.log(res);
}
main();
// export default processSheet;
