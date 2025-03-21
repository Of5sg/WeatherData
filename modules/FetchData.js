import * as fsPromises from "node:fs/promises";
import cli from "./Cli.js";
import { SortData } from "./DataTools.js";

export async function FetchData(lat, lon, parameterSet, by){

    // Funksjon for å hente værdata

    try{

        let tidligereData;
        //setter dato for tidligere data til tom streng
        let datoForTidligereData = "";
        // 'Sat, 09 Mar 2025 22:38:22 GMT'

        /* laster inn info om siste oppdatering av data */

        try{
            const tidligereDataKlokkeslettRaw = await fsPromises.readFile("./Data/response.json", "utf8");
            tidligereData = JSON.parse(tidligereDataKlokkeslettRaw);            
        }catch(error){
            console.log(error);
            if (parameterSet.has("nydata")===false){
                console.error("\nData mangler for tidligere dato\n");
            }else{
                return;
            };
        };

        let brukerData = null;

        // ser om brukerdata er lagret. hvis ikke, bes det om brukerdata. til bruk i Header
        try{
            const brukerDataJson = await fsPromises.readFile("./Data/BrukerData.json", "utf8");
            brukerData = JSON.parse(brukerDataJson);
        }catch{
            console.log("\nFinner ingen lagret brukerdata");
        };
        // under bes brukeren om å identifisere seg, hvis ingen lagret data er funnet. man får også spørsmål om man vil lagre dataen.
        if (brukerData === null) {
            brukerData = await cli.BrukerData()
            await cli.SaveUserData(brukerData);
        };

        /* - her settes variabel til header "If-Modified-since", til tom streng
         så ny data hentes inn, hvis "nydata" finnes i Set: parameterSet.
         - bruker gammel data hvis sted er det samme som før, og det ikke 
         har gått for lang tid */

        try{
            if (tidligereData.sted === by && parameterSet.has("nydata")===false){
                datoForTidligereData = tidligereData.oppdateringstidspunkt;
            };
        }catch(err){
            console.log("\ndato satt til tom streng");
        };


        /* henter Værdata */
        const headers = new Headers({
            "User-Agent": brukerData.data,
            "If-Modified-Since": datoForTidligereData,
        });
        const response = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`, {
            method: "GET",
            headers: headers
        });

        if (response.ok === false && response.status !== 304){
            console.log(response);         
        };

        // url fordi det stod i licensing and Data Policy at det er å foretrekke, om det linkes til.
        const urlForData = response.url;

        /* forsøker å parse ny data i blokken under. hvis jeg har hentet
        ny data nylig, henter blokken dataen fra Data.json istedet. */        

        let data;

        try{

            // når siste oppdatering var, fra respons header, for å sende tilbake hvis jeg kjører scriptet igjen snarlig
            const sisteOppdatering = {sted: by, oppdateringstidspunkt: response.headers.get("last-modified")};

            // lagre tidspunk(last modified) og dataen til sine separate filer, hvis response.ok === true
            if (response.ok === true){
                
                const dataen = await response.json();
                data = SortData(dataen)

                console.log("Data Oppdatert");

                await fsPromises.writeFile("./Data/response.json", JSON.stringify((sisteOppdatering), null, 2), (err)=>{
                    if (err === null){
                        return;
                    }else{
                        console.error(err);
                    };
                });

                await fsPromises.writeFile("./Data/Data.json", JSON.stringify(data, null, 2), (err)=>{
                    if (err === null){
                        return;
                    }else{
                        console.error(err);
                    };
                });

            }else{

                // lese data fra Data.json, hvis scriptet har blitt kjørt nylig, og ny data ikke er tilgjengelig
                data = JSON.parse(await fsPromises.readFile("./Data/Data.json", "utf8"));

                console.log("\tBruker tidligere data, oppdatert:", new Date(datoForTidligereData).toLocaleString(), "\n");

            };

        }catch(error){

            console.log("Data mangler:\n", error);

        };

        return {data: data, url: urlForData};

    }catch(error){

        console.error(error);

    };
};
