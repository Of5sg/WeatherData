import * as readline from "node:readline";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";

const mulige_Parametere_Liste = JSON.parse(fs.readFileSync("./Data/InputMuligheter.json"));

// det er viktig å huske cli.InterfaceClose når enn man ikke skal ta inn mer data.

const cli = {};

cli.init = async function () {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let lat;
    let lon;
    let by;
    let periodeArray = [];
    const parameterSet = new Set();

    cli.byNavn = async ()=>{
        return new Promise (resolve => {
            rl.question("\nVelg en by: ", async (svar) => {

                try{
            
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${svar}+Norway&format=json&countrycodes=NO`);
                    const data = await response.json();

                    for (let i = 0; i < data.length; i++){
                        if (data[i].class === "boundary"){
                            lat = data[i].lat;
                            lon = data[i].lon;
                            by = svar;
                            //console.clear();
                            resolve();
                            return;
                        };
                    };
                    throw new Error("her");

                }catch(error){
                    console.log("\nFeil, kan ikke finne en by ved navn \""+ svar +"\".\n\nvennligst sjekk at det er stavet riktig.\n");
                    await cli.byNavn()
                    resolve();
                };
            });
        });
    };

    cli.Parametere = () => {

        return new Promise((resolve) => {

            rl.question("\nHva vil du vite? (skriv parametere, for en liste over mulige parametere)\n\t-", (svar) => {

                const prosess = svar.toLowerCase().split(/:?, |,| /);

                const muligeParametere = Object.keys(mulige_Parametere_Liste);

                // den nye inputvalideringen/stavekontrollen 
                
                /* her under går jeg igjennom hvert av parameterene fra listen for hver av parameterene i input.
                og sammenligner hver bokstav i listen med tilsvarende bokstav i input +-1  
                    altså: for hvert input-parameter, 
                        leter jeg igjennom alle de godkjente parameterene fra listen, og sammenligner med det valgte input-parameteret
                            -- men bare hvis de godkjente parametrene er like lange, +-1 bokstav.
                */

                for (const ønsketParameter of prosess){
                    // for hvert parameter av brukerinput

                    let treffPåParameter = 0;

                    for (const parameter of muligeParametere){
                        // for hver av de mulige parameterene, fra InputMuligheter.json

                        if (ønsketParameter.length >= parameter.length -1 && ønsketParameter.length <= parameter.length +1){
                            // finne alle parametere fra jsonfil som er like lange som input, +-1

                            const størrelse = Math.max(ønsketParameter.length, parameter.length);

                            const bufferArray = [];

                            // populere bufferArray med de tre første bokstavene i hvert parameter fra bruker input
                            for (let i = 0; i < 3; i++){
                                bufferArray.push(ønsketParameter[i]);
                            };

                            let count = 0;
                            
                            // for hver bokstav i det lengste ordet, av parameter(fra inputMuligheter.json) og ønsketParameter(input).
                            for (let i = 0; i < størrelse; i++ ){

                                //console.log(bufferArray, (count/parameter.length)); // for test, se hva som skjer ---------------------------

                                for(let y = 0; y < 3; y++){
                                    // sammelign med hver bokstav i bufferArray

                                    if (bufferArray[y] === parameter[i] && y === 0){
                                        bufferArray.shift();
                                        bufferArray.push(ønsketParameter[i+3]);
                                        count++;
                                    }else if (bufferArray[y] === parameter[i] && y === 1){
                                        const tempBokstav = bufferArray.shift();
                                        bufferArray.shift();
                                        bufferArray.unshift(tempBokstav);
                                        bufferArray.push(ønsketParameter[i+3]);
                                        count++;
                                    }else if (bufferArray[y] === parameter[i] && y === 2){
                                        bufferArray.pop();
                                        bufferArray.push(ønsketParameter[i+3]);
                                        count++;
                                    };

                                };

                                // hvis mer enn 75% likhet mellom ord fra input og ord fra liste
                                if ((count/størrelse) > 0.75){
                                    if (ønsketParameter !== "data"){
                                        parameterSet.add(parameter);
                                    };
                                    treffPåParameter = 1;
                                };
                            };
                        };
                    };

                    if (treffPåParameter === 1){
                        // må tenke ut en annen måte å gjøre dette på
                    }else if(ønsketParameter === "ny" && prosess.includes("data")){
                        if (parameterSet.has("nydata") === false){
                            parameterSet.add("nydata");
                        };
                    }else{
                        if (ønsketParameter !== "data"){
                            console.log("Beklager, vi har ikke informasjon om:", ønsketParameter);
                        };
                    };
                };

                //console.log("\n", parameterSet); // for å se hvilke parametere som er godtatt, for test --------------------------------------
                resolve();
                
            });
        });
    };

    cli.periode = async () => {
        // her tar vi gjennomsnitt av verdiene for gitt periode, Kun tilgjengelig for de neste 2 dagene.
        return new Promise((resolve) => {

            rl.question("\nEksempel: 00-08, 2(dager frem) \n\n\tPeriode: \n\t\t- ", async (svar) => {

                periodeArray = svar.split(/:?-|, | |,/);
        
                if (periodeArray.length === 3 && periodeArray[0] < periodeArray [1] && periodeArray[2] <= 2){
                    resolve();
                }else if(periodeArray[2] > 2){
                    console.log("Beklager, gjennomsnitt for gitt periode er kun tilgjengelig for de neste 2 dagene");
                    await cli.periode();
                    resolve();
                }else{
                    console.log("Beklager, her var det noe rart.");
                    await cli.periode();
                    resolve();
                };
            });
        });
    };

    cli.DisplayParametere = async () => {

        console.log("")
        for (const [key, value] of Object.entries(mulige_Parametere_Liste)){
            console.log(`\t${key}`.padEnd(20, " "), value);
        }
        await cli.Parametere();
    };

    cli.BrukerData = async () => {
        return new Promise((resolve) => {
            rl.question("\nMangler brukerdata, vennligst identifiser deg: \n(eksempel: bruker@epost.org) \n\t-", response => {
                resolve(response);
                return response;
            });
        });
    };

    cli.SaveUserData = async (User) => {
        return new Promise ((resolve) => {
            rl.question("ønsker du å lagre brukerdataen? (y/n)\n\t-", async response => {
                if(response === "y"){
                    const temp = {data: User};
                    await fsPromises.writeFile("./Data/BrukerData.json", JSON.stringify(temp, null, 2))
                    resolve(response);
                }else if(response === "n"){
                    console.log("Brukerdata er ikke lagret.")
                    resolve(response);
                }else{
                    console.log("vennligs svar y eller n");
                    await cli.SaveUserData();
                    resolve(response);
                }
            })
        })
    }

    cli.InterfaceClose = () => {
        rl.close();
    };

    //-----------------

    await cli.byNavn();

    await cli.Parametere();

    if (parameterSet.has("parametere")){
        await cli.DisplayParametere();
    };

    if (parameterSet.has("periode")){

        await cli.periode();

        return {lat: lat, lon: lon, by: by, parametere: parameterSet, periode: periodeArray};

    }else{

        return {lat: lat, lon: lon, by: by, parametere: parameterSet, periode: null};
    };

};

export default cli;