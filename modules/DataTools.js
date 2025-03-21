
function Avg(dataArray){
    let sum = 0;
    dataArray.forEach((item) => {
        sum += item;
    });
    return (sum / dataArray.length).toFixed(1);
};

export function CalculateAvgPeriod(sortertData, periode){

    const antallDagerFrem = Number(periode[2]);

    const fraKl = periode[0];
    const tilKl = periode[1];

    const dato = new Date();
    dato.setDate(dato.getDate()+antallDagerFrem);
    
    const tempArray = [];
    const regnArray = [];
    const vindArray = [];
    const vindretningArr = [];
    const fuktArray = [];
    const trykkArray = [];
    const skyArray = [];

    const samleArray = [];

    let returDato;

    sortertData.forEach((item) => {

        const datoForData = item.dato;

        if (datoForData === dato.toISOString().split("T")[0]){

            returDato = datoForData;

            item.data.forEach((tidspunkt) => {
                // for hvert tilgjengelige klokkeslett i hver dag

                const tidTilEval = `${tidspunkt.tid}`.split(":").join("");

                if ( tidTilEval <= (tilKl + "00") && tidTilEval >= (fraKl + "00") ){
                    tempArray.push(tidspunkt.temp);
                    regnArray.push(tidspunkt.regn);            
                    vindArray.push(tidspunkt.vind);
                    vindretningArr.push(tidspunkt.vindRetning);
                    fuktArray.push(tidspunkt.fukt);
                    trykkArray.push(tidspunkt.trykk);
                    skyArray.push(tidspunkt.skydekke);
                };
            });
        };
    });

    samleArray.push({
        tid: fraKl+"-"+tilKl+".00",
        temp: Avg(tempArray),
        regn: Avg(regnArray),
        vind: Avg(vindArray),
        vindRetning: Avg(vindretningArr),
        fukt: Avg(fuktArray),
        trykk: Avg(trykkArray),
        skydekke: Avg(skyArray),
    });

    return {dato: returDato, data: samleArray};

};

export function SortData(data){

    const datoArray = [];

    const dato = new Date();

    // fylle datoArray med datoene til de neste 7 dagene
    for (let i  = 0; i < 7; i++){
        dato.setDate(dato.getDate() + 1);
        const datoer = new Date(dato);

        datoArray.push(datoer);
    };

    let dagenesData = [];

    // for hver dag i datoArray
    datoArray.forEach((dag) => {

        const dagensDato = dag.toISOString().split("T")[0]

        const tempArray = [];

        // for hver time i Datasettet
        data.properties.timeseries.forEach((object) => {
            let objektet = object.time.split("T")[0]        
            if (objektet === dagensDato){


                const datoOgTid = object.time.split("T");

                let regnet = null;

                if ("next_1_hours" in object.data){
                    regnet = object.data.next_1_hours.details.precipitation_amount;
                } else if ("next_6_hours" in object.data){
                    regnet = object.data.next_6_hours.details.precipitation_amount;
                };

                tempArray.push({
                    tid: datoOgTid[1].slice(0, 5),
                    temp: object.data.instant.details.air_temperature,
                    regn: regnet,
                    vind: object.data.instant.details.wind_speed,
                    vindRetning:object.data.instant.details.wind_from_direction,
                    fukt: object.data.instant.details.relative_humidity,
                    trykk: object.data.instant.details.air_pressure_at_sea_level,
                    skydekke: object.data.instant.details.cloud_area_fraction
                });
            };
        });

        dagenesData.push({dato: dagensDato, data: tempArray});
    });

    return dagenesData;

};

export function AvgPer(data) {

    // gi gjennomsnittet av 4 forskjellige perioder som default, for de først 2 dagene

    const periodeArray = [["00", "08"], ["08", "12"], ["12", "18"], ["18", "23"]];

    let mappedData;

    let datafor1;
    let datafor2;

    // gjør denne 1 gang for hver av de første 2 dagene
    for (let i = 1; i <= 2; i++ ){

        const samleArray = [];

        // for hver tidsperiode i periodeArray
        periodeArray.forEach((periodeVar) => {

            const periode = [...periodeVar, i];

            mappedData = CalculateAvgPeriod(data, periode);

            samleArray.push(...mappedData.data);

            if (i === 1){
                datafor1 = {dato: mappedData.dato, data: samleArray};
            }else if(i === 2){
                datafor2 = {dato: mappedData.dato, data: samleArray};
            };
        });
    };

    data.shift();
    data.shift();

    data.unshift(datafor2);
    data.unshift(datafor1);

    return data;

};