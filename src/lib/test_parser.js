import { config } from "dotenv";

config({ path: '../../.env.local' })

import { LoadResume } from "./resume_parser";
const run = async () => {
    const res = await LoadResume("/home/doshant/Documents/Doshant_Giradkar_8329474509.pdf");
    console.log((await res.extractJson()));
    console.log(res.getText())
}

run();
