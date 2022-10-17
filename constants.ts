//TO CHANGE: Set the Spreadsheet ID of that year's spreadsheet and the ACM Google Service Account in your .env
import * as dotenv from "dotenv";
dotenv.config();
export const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
export const SERVICE_ACCOUNT = process.env.SERVICE_ACCOUNT ?? "";

//TO CHANGE: Change these constants as you wish to match the year's applications.
export const PERSONAL_INFO_SHEET = "Personal Info";
export const NAME_ROW_INDEX = 2;
export const EMAIL_ROW_INDEX = 1;
export const SOCIALS_ROW_INDEX = 6;
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Change these values to match the column names that correspond to the question ranges for each committee!
export const COMMITTEE_QUESTION_COLS = {
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

export const GENERAL_QUESTION_COLS = ["D", "...", "F"];

//If you change a value in the COMMITTEE_QUESTION_COLS above, be sure to update this enum as well!
export enum Committees {
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
