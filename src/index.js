import localforage from "localforage";
import WebMMD from "./modules/WebMMD"

// for debug
// localforage.clear();

const app = new WebMMD()

app.start()
