import cli from "./modules/Cli.js";
import * as tools from "./modules/DataTools.js";
import { FetchData } from "./modules/FetchData.js";
import { Presentation } from "./modules/Presentation.js";


async function main(){

    //console.clear();

    const resultat = await cli.init();

    const by = resultat.by;
    const lat = resultat.lat;
    const lon = resultat.lon;
    let parameterSet = resultat.parametere;
    const periode = resultat.periode;

    //console.clear()

    const rawData = await FetchData(lat, lon, parameterSet, by);

    const dataen = rawData.data;

    let resultToLog;

    if (parameterSet.has("periode")){

        // data for gitt periode av en dag
        resultToLog = [tools.CalculateAvgPeriod(dataen, periode)];

    }else if (parameterSet.has("time")){

        //data for hver time av dagen
        resultToLog = dataen;

    }else{
        
        // data for default perioder av alle dagene
        resultToLog = tools.AvgPer(dataen);
        
    };


    Presentation(resultToLog, parameterSet);

    cli.InterfaceClose()

    console.log("\n\n\tData fra MET Norway, link: " + rawData.url + "\n\n");

};

main();
