# README for Værdata6

Dette er ett script som henter data fra meteorologisk institutt, og presenterer dataen for de neste 7 dagene.

scriptet ber først om ett stedsnavn. 

man vil etter valgt by, kunne skrive inn hvilken type data man vil ha ut.

> #### For å kjøre scriptet:
> Scriptet kjører i node.js
>> Det kan kjøres fra kommandolinjen ved å:
>> + navigere til scriptets mappe, i konsollen
>> + og bruke kommandoen `node Main.js`
>
> scriptet vil kun fungere hvis node.js er installert.

Man vil bli bedt om å identifisere seg (ved epostadresse). dette er fordi Meteorologisk institutt vil vite hvem som ber om tilgang til dataene deres.

### scriptet godtar de følgende parametrene:
------------------------------------------------------------------------------

 + **temperatur**:       *Data om temperatur i celsius*

 + **skydekke**:         *Data om skydekke i prosent*

 + **vind**:             *Data om vind, hastighet og retning*

 + **regn**:             *Data om regn, i 1 eller 6 timers perioder utifra hva som er tilgjengelig*

 + **trykk**:            *Data om lufttrykk ved havnivå i hPa*

 + **fuktighet**:        *Data om relativ luftfuktighet i prosent*

 + **alt**:              *Viser data for alle de andre parametrene*

 + **periode**:          *Viser gjennomsnitt av data for en gitt periode, (klokkeslett-klokkeslett) (antall dager frem) eks: 00-05 2*

 + **time**:             *Viser data for hver time av hver dag*

 + **nydata**:           *Henter ny data, hvis nødvendig*

 + **parametere**:       *Viser denne listen over parametere, i konsollen*

------------------------------------------------------------------------------

 skulle man velge periode, vil man bli spurt om klokkeslett(fra og til), og antall dager fra idag. scriptet godtar kun 1 eller 2 dager frem for periode.
