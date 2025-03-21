
function WindDirMath(vinkelVind){

    // her har jeg delt 360 på 32 og doblet alt i arrayen, med Nord på begge ender. det har vist seg å være den beste løsningen.

    const himmelRetninger = ["N", "NNØ", "NNØ", "NØ", "NØ", "ØNØ", "ØNØ", "Ø", "Ø", "ØSØ", "ØSØ", "SØ", "SØ", "SSØ", "SSØ", "S", "S", "SSV", "SSV", "SV", "SV", "VSV", "VSV", "V", "V", "VNV", "VNV", "NV", "NV", "NNV", "NNV", "N"];
    
    // deler på (360 / 32) = 11.25
    let matte = vinkelVind / 11.25;

    return himmelRetninger[Math.floor(matte)];

};

export function Presentation (dataArray, parameterSet){

    dataArray.forEach((object)=>{

        console.log("\n\tDato:", `${object.dato}`.split("-").reverse().join("."));

        object.data.forEach((obj) => {

            // her presenteres dataen basert på hvilke parametere som eksisterer i parameterSet

            let samleString = "";

            if (parameterSet.has("periode")){
                samleString += "\nSnitt ";
            }else{
                samleString += "\n";
            };

            const str1 = "| Kl " + obj.tid;

            samleString += str1;

            if (parameterSet.has("temperatur") || parameterSet.has("alt")){
                const str = "| Temperatur: " + `${obj.temp}`.padStart(4, " ") + " \u00B0C";
                samleString += str.padStart(str.length + 1, " ");
            };

            if (parameterSet.has("regn") || parameterSet.has("alt")){
                const str = "| Regn: " + `${obj.regn}`.padStart(3, " ") + " mm";
                samleString += str.padStart(str.length + 1, " ");
            };

            if (parameterSet.has("vind") || parameterSet.has("alt")){

                const str = "| Vind: " + `${obj.vind}`.padStart(3, " ") + " m/s";
                samleString += str.padStart(str.length + 1, " ");

                const str2 = "| Vind fra: " + `${WindDirMath(obj.vindRetning)}`.padStart(3, " ");
                samleString += str2.padStart(str2.length + 1, " ");
            };

            if (parameterSet.has("fuktighet") || parameterSet.has("alt")){
                const str = "| Luftfuktighet: " + `${obj.fukt}`.padStart(4, " ") + " %";
                samleString += str.padStart(str.length + 1, " ");
            };

            if (parameterSet.has("trykk") || parameterSet.has("alt")){
                const str = "| Lufttrykk ved havnivå: " + `${obj.trykk}`.padStart(6, " ") + " hPa";
                samleString += str.padStart((str.length + 1), " ");
            };

            if (parameterSet.has("skydekke") || parameterSet.has("alt")){
                const str = "| Skydekke: " + `${obj.skydekke}`.padStart(4, " ") + " %";
                samleString += str.padStart(str.length + 1, " ");
            };

            samleString += " |";

            console.log(samleString);

        });
    });
};