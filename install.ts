import { exec } from "child_process";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const filePaths = Object.keys(process.env).reduce((accArr, key) => {
  if (key.startsWith("FILE_") && process.env.hasOwnProperty(key)) {
    accArr.push(process.env[key] as string);
  }
  return accArr;
}, [] as string[]);

if (!process.env.DEV_MODE) {
  exec("git reset --hard && git pull && git log -1", (error, stdout) => {
    if (error) {
      console.log(`[ERROR] in git ${error}`);
    }

    console.log(stdout);
  });
}

if (fs.existsSync(process.env.DATA_FILES_DIR as string)) {
  console.log(`[INFO]: Data files dir exists. Nothing to do.`);
} else {
  fs.mkdirSync(process.env.DATA_FILES_DIR as string);
  console.log(`[INFO]: Data files dir was created.`);
}

filePaths.forEach((path) => {
  if (fs.existsSync(path as string)) {
    console.log(`[INFO]: ${path} exists. Nothing to do.`);
  } else {
    if (path.includes(".txt")) {
      fs.writeFileSync(path, "");
    }
    fs.writeFileSync(path, "{}", { encoding: "utf-8" });
    console.log(`[INFO]: ${path} was created.`);
  }
});

//not working rn, no stdout

// const botChildProc = exec("npx tsx main.ts", (error, stdout) => {
//   if (error) {
//     console.log(`[ERROR] in git ${error}`);
//   }

//   console.log(stdout);
// });

// process.on("SIGINT", function () {
//   botChildProc.;
// });
